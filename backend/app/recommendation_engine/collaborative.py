"""
TensorFlow 2.x Neural Collaborative Filtering (NCF / NeuMF) Model.
Provides neural matrix factorization combining Generalized Matrix Factorization (GMF)
and Multi-Layer Perceptrons (MLP) for non-linear user-item interaction modeling.
Decouples institutional identity from training by learning over pseudonymous IDs.
"""
import os
import json
import logging
from typing import List, Dict, Any, Tuple, Optional

logger = logging.getLogger(__name__)

# Lazy import flag for TensorFlow
TF_AVAILABLE = False
try:
    import numpy as np
    import tensorflow as tf
    from tensorflow.keras import layers, models, optimizers, callbacks
    TF_AVAILABLE = True
except ImportError as e:
    logger.warning("TensorFlow or NumPy not loaded yet: %s", e)

from .preprocessing import CategoricalVocabulary


def build_neumf_model(
    num_users: int,
    num_items: int,
    latent_dim_gmf: int = 16,
    latent_dim_mlp: int = 32,
    mlp_layers: List[int] = [64, 32, 16],
    dropout_rate: float = 0.2,
    learning_rate: float = 0.001
):
    """
    Constructs a NeuMF (Neural Matrix Factorization) model in TensorFlow 2.x Keras.
    Combines linear dot-product GMF with non-linear deep MLP branches.
    """
    if not TF_AVAILABLE:
        raise RuntimeError("TensorFlow 2.x is required to build the NeuMF model.")

    # 1. Inputs: User ID and Item ID integer indices
    user_input = layers.Input(shape=(1,), dtype=tf.int32, name="user_id_input")
    item_input = layers.Input(shape=(1,), dtype=tf.int32, name="item_id_input")

    # 2. GMF Branch (Generalized Matrix Factorization)
    gmf_user_embed = layers.Embedding(
        input_dim=num_users,
        output_dim=latent_dim_gmf,
        name="gmf_user_embedding",
        embeddings_initializer="glorot_uniform"
    )(user_input)

    gmf_item_embed = layers.Embedding(
        input_dim=num_items,
        output_dim=latent_dim_gmf,
        name="gmf_item_embedding",
        embeddings_initializer="glorot_uniform"
    )(item_input)

    # Element-wise product for linear interactions
    gmf_vector = layers.Multiply(name="gmf_latent_product")([gmf_user_embed, gmf_item_embed])
    gmf_vector = layers.Flatten(name="gmf_flatten")(gmf_vector)

    # 3. MLP Branch (Multi-Layer Perceptron)
    mlp_user_embed = layers.Embedding(
        input_dim=num_users,
        output_dim=latent_dim_mlp,
        name="mlp_user_embedding",
        embeddings_initializer="glorot_uniform"
    )(user_input)

    mlp_item_embed = layers.Embedding(
        input_dim=num_items,
        output_dim=latent_dim_mlp,
        name="mlp_item_embedding",
        embeddings_initializer="glorot_uniform"
    )(item_input)

    mlp_vector = layers.Concatenate(name="mlp_latent_concat")([mlp_user_embed, mlp_item_embed])
    mlp_vector = layers.Flatten(name="mlp_flatten")(mlp_vector)

    # Deep feedforward layers
    x = mlp_vector
    for i, units in enumerate(mlp_layers):
        x = layers.Dense(units, activation="relu", name=f"mlp_dense_{i+1}")(x)
        if dropout_rate > 0.0:
            x = layers.Dropout(dropout_rate, name=f"mlp_dropout_{i+1}")(x)
        x = layers.BatchNormalization(name=f"mlp_bn_{i+1}")(x)

    # 4. NeuMF Fusion (Concatenate GMF and MLP representations)
    fusion_vector = layers.Concatenate(name="neumf_fusion")([gmf_vector, x])

    # 5. Output Prediction Layer (Sigmoid normalized affinity [0.0, 1.0])
    prediction = layers.Dense(
        1,
        activation="sigmoid",
        name="rating_prediction",
        kernel_initializer="lecun_uniform"
    )(fusion_vector)

    model = models.Model(inputs=[user_input, item_input], outputs=prediction, name="NeuMF_Recommender")
    model.compile(
        optimizer=optimizers.Adam(learning_rate=learning_rate),
        loss="mean_squared_error",
        metrics=["mae", "mse"]
    )
    return model


class NeuralCollaborativeRecommender:
    """
    High-level Collaborative Filtering Recommender using TensorFlow 2.x.
    Manages data mapping, model instantiation, training, model persistence, and batch inference.
    """

    def __init__(self, artifacts_dir: Optional[str] = None):
        self.artifacts_dir = artifacts_dir or os.path.join(os.path.dirname(__file__), "artifacts")
        os.makedirs(self.artifacts_dir, exist_ok=True)
        self.vocab = CategoricalVocabulary()
        self.model: Optional[Any] = None
        self.is_trained: bool = False
        self.latent_dim_gmf: int = 16
        self.latent_dim_mlp: int = 32
        self.training_history: Dict[str, Any] = {}

    def fit_from_interactions(
        self,
        interactions: List[Dict[str, Any]],
        epochs: int = 15,
        batch_size: int = 32,
        learning_rate: float = 0.002,
        validation_split: float = 0.15,
        random_seed: int = 42
    ) -> Dict[str, Any]:
        """
        Train the NeuMF model on user-item interaction records.
        """
        if not TF_AVAILABLE:
            raise RuntimeError("TensorFlow is not installed. Collaborative model cannot be trained.")

        tf.random.set_seed(random_seed)
        np.random.seed(random_seed)

        # 1. Build ID vocabularies
        user_ids = [str(r["user_id"]) for r in interactions]
        item_ids = [str(r["item_id"]) for r in interactions]
        self.vocab.fit(user_ids, item_ids)

        # 2. Encode to integer tensors
        user_indices = np.array([self.vocab.encode_user(u) for u in user_ids], dtype=np.int32)
        item_indices = np.array([self.vocab.encode_item(i) for i in item_ids], dtype=np.int32)
        ratings = np.array([float(r.get("normalized_rating", 0.5)) for r in interactions], dtype=np.float32)

        # 3. Instantiate model
        self.model = build_neumf_model(
            num_users=self.vocab.num_users + 1,  # extra margin for UNK
            num_items=self.vocab.num_items + 1,
            latent_dim_gmf=self.latent_dim_gmf,
            latent_dim_mlp=self.latent_dim_mlp,
            learning_rate=learning_rate
        )

        # 4. Train with Early Stopping
        early_stop = callbacks.EarlyStopping(
            monitor="val_loss" if validation_split > 0 else "loss",
            patience=5,
            restore_best_weights=True
        )

        history = self.model.fit(
            x=[user_indices, item_indices],
            y=ratings,
            batch_size=batch_size,
            epochs=epochs,
            validation_split=validation_split,
            callbacks=[early_stop],
            verbose=0
        )

        self.is_trained = True
        self.training_history = {
            "epochs_trained": len(history.epoch),
            "final_loss": float(history.history["loss"][-1]),
            "final_mae": float(history.history["mae"][-1]),
            "val_loss": float(history.history["val_loss"][-1]) if "val_loss" in history.history else None,
            "num_users": self.vocab.num_users,
            "num_items": self.vocab.num_items,
            "num_interactions": len(interactions)
        }

        # Save artifacts to disk
        self.save_artifacts()

        return self.training_history

    def predict_user_item_scores(
        self,
        user_id: str,
        item_ids: List[str]
    ) -> Dict[str, float]:
        """
        Batch score candidate items for a user.
        If user or item is novel (cold-start), returns neutral baseline 0.5.
        """
        if not self.is_trained or self.model is None or not TF_AVAILABLE:
            return {i: 0.5 for i in item_ids}

        u_idx = self.vocab.encode_user(user_id)
        # Check if user is known
        if u_idx == 0:
            # Completely cold-start user
            return {i: 0.5 for i in item_ids}

        user_arr = np.full((len(item_ids), 1), u_idx, dtype=np.int32)
        item_arr = np.array([[self.vocab.encode_item(i)] for i in item_ids], dtype=np.int32)

        preds = self.model.predict([user_arr, item_arr], batch_size=64, verbose=0)
        scores = {}
        for i, item_id in enumerate(item_ids):
            scores[item_id] = round(float(preds[i][0]), 4)

        return scores

    def save_artifacts(self, model_version: str = "v1"):
        """Save model weights, configuration, and categorical vocabulary."""
        if not self.is_trained or self.model is None:
            return

        version_dir = os.path.join(self.artifacts_dir, model_version)
        os.makedirs(version_dir, exist_ok=True)

        # 1. Weights
        weights_path = os.path.join(version_dir, "neumf_weights.weights.h5")
        try:
            self.model.save_weights(weights_path)
        except Exception:
            # Fallback format if needed
            self.model.save_weights(os.path.join(version_dir, "neumf_weights.h5"))

        # 2. Vocabulary & Metadata
        meta = {
            "version": model_version,
            "num_users": self.vocab.num_users,
            "num_items": self.vocab.num_items,
            "user2idx": self.vocab.user2idx,
            "item2idx": self.vocab.item2idx,
            "latent_dim_gmf": self.latent_dim_gmf,
            "latent_dim_mlp": self.latent_dim_mlp,
            "training_history": self.training_history
        }

        meta_path = os.path.join(version_dir, "metadata.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

        logger.info("Saved TensorFlow NeuMF artifacts to %s", version_dir)

    def load_artifacts(self, model_version: str = "v1") -> bool:
        """Load saved model weights and vocabulary from disk."""
        if not TF_AVAILABLE:
            return False

        version_dir = os.path.join(self.artifacts_dir, model_version)
        meta_path = os.path.join(version_dir, "metadata.json")

        if not os.path.exists(meta_path):
            return False

        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)

            self.vocab.user2idx = meta["user2idx"]
            self.vocab.idx2user = {int(v): k for k, v in meta["user2idx"].items()}
            self.vocab.item2idx = meta["item2idx"]
            self.vocab.idx2item = {int(v): k for k, v in meta["item2idx"].items()}
            self.latent_dim_gmf = meta.get("latent_dim_gmf", 16)
            self.latent_dim_mlp = meta.get("latent_dim_mlp", 32)
            self.training_history = meta.get("training_history", {})

            # Rebuild model graph
            self.model = build_neumf_model(
                num_users=self.vocab.num_users + 1,
                num_items=self.vocab.num_items + 1,
                latent_dim_gmf=self.latent_dim_gmf,
                latent_dim_mlp=self.latent_dim_mlp
            )

            # Load weights
            weights_h5 = os.path.join(version_dir, "neumf_weights.weights.h5")
            if not os.path.exists(weights_h5):
                weights_h5 = os.path.join(version_dir, "neumf_weights.h5")

            if os.path.exists(weights_h5):
                self.model.load_weights(weights_h5)
                self.is_trained = True
                logger.info("Successfully loaded NeuMF recommender from %s", version_dir)
                return True
        except Exception as e:
            logger.error("Failed to load artifacts from %s: %s", version_dir, e)

        return False
