"""
Recommendation Model Lifecycle & Production Manager.
Coordinates training pipelines, artifact persistence, offline evaluation,
and serving multi-modal recommendations across resources, events, and services.
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional

from .content_based import ContentBasedRecommender
from .collaborative import NeuralCollaborativeRecommender
from .hybrid_ranker import HybridRanker
from .evaluator import RecommendationEvaluator
from .synthetic_data import (
    generate_synthetic_users,
    generate_synthetic_catalog,
    generate_synthetic_interactions,
    train_test_split
)

logger = logging.getLogger(__name__)


class RecommendationModelManager:
    """
    Manages end-to-end model training, evaluation, loading, and real-time inference.
    """

    _instance: Optional["RecommendationModelManager"] = None

    def __init__(self, artifacts_dir: Optional[str] = None):
        self.artifacts_dir = artifacts_dir or os.path.join(os.path.dirname(__file__), "artifacts")
        os.makedirs(self.artifacts_dir, exist_ok=True)

        self.content_engine = ContentBasedRecommender()
        self.collab_engine = NeuralCollaborativeRecommender(artifacts_dir=self.artifacts_dir)
        self.hybrid_ranker = HybridRanker(
            content_engine=self.content_engine,
            collab_engine=self.collab_engine,
            default_alpha=0.5
        )

        self.latest_evaluation_report: Dict[str, Any] = {}
        self.is_initialized: bool = False

        # Attempt to load existing pre-trained artifacts if present
        self.load_active_model()

    @classmethod
    def get_instance(cls) -> "RecommendationModelManager":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_active_model(self, version: str = "v1") -> bool:
        """Attempt to load saved model artifacts from disk."""
        eval_path = os.path.join(self.artifacts_dir, version, "evaluation_report.json")
        if os.path.exists(eval_path):
            try:
                with open(eval_path, "r", encoding="utf-8") as f:
                    self.latest_evaluation_report = json.load(f)
            except Exception as e:
                logger.warning("Could not read evaluation report: %s", e)

        loaded = self.collab_engine.load_artifacts(version)
        if loaded:
            self.is_initialized = True
        return loaded

    def train_and_evaluate(
        self,
        users: Optional[List[Dict[str, Any]]] = None,
        resources: Optional[List[Dict[str, Any]]] = None,
        events: Optional[List[Dict[str, Any]]] = None,
        services: Optional[List[Dict[str, Any]]] = None,
        interactions: Optional[List[Dict[str, Any]]] = None,
        epochs: int = 15,
        batch_size: int = 32,
        version: str = "v1"
    ) -> Dict[str, Any]:
        """
        Execute full training and evaluation workflow:
        1. Prepares datasets (using provided catalog or generating realistic synthetic data).
        2. Fits Content-Based TF-IDF indices.
        3. Trains TensorFlow 2.x NeuMF Collaborative Filtering model.
        4. Runs strict offline evaluation (Precision@K, Recall@K, HitRate@K, NDCG@K) on test holdout.
        5. Saves versioned artifacts.
        """
        # If no catalog passed, generate realistic synthetic university corpus
        if not resources or not events or not services:
            syn_res, syn_evt, syn_srv = generate_synthetic_catalog()
            resources = resources or syn_res
            events = events or syn_evt
            services = services or syn_srv

        if not users:
            users = generate_synthetic_users(n_students=50, n_faculty=10, n_staff=5)

        # Merge all items for content index
        all_catalog = list(resources) + list(events) + list(services)
        self.content_engine.fit(all_catalog)

        # Interactions
        if not interactions:
            interactions = generate_synthetic_interactions(users, all_catalog)

        # Split train / test holdout without leakage
        train_interactions, test_interactions = train_test_split(interactions, test_ratio=0.2, seed=42)

        # Train Collaborative Model with TensorFlow
        train_result = self.collab_engine.fit_from_interactions(
            interactions=train_interactions,
            epochs=epochs,
            batch_size=batch_size
        )

        # Evaluate on test holdout
        test_ground_truth: Dict[str, set] = {}
        for r in test_interactions:
            # Positive interaction: rating >= 3.5 or interaction_type in save/rating
            if float(r.get("rating", 3.0)) >= 3.5:
                u_id = str(r["user_id"])
                i_id = str(r["item_id"])
                if u_id not in test_ground_truth:
                    test_ground_truth[u_id] = set()
                test_ground_truth[u_id].add(i_id)

        # Generate top-10 hybrid recommendations for all test users
        predictions_map: Dict[str, List[str]] = {}
        user_lookup = {u["pseudonymous_id"]: u for u in users}

        for u_id in test_ground_truth:
            user_doc = user_lookup.get(u_id, {"_id": u_id, "department": "Computer Science"})
            ranked = self.hybrid_ranker.rank(
                user_doc=user_doc,
                candidate_items=all_catalog,
                top_k=10
            )
            predictions_map[u_id] = [r["item_id"] for r in ranked]

        # Compute offline metrics
        eval_metrics = RecommendationEvaluator.evaluate(
            ground_truth_map=test_ground_truth,
            predictions_map=predictions_map,
            k_values=[5, 10]
        )

        self.latest_evaluation_report = {
            "model_version": version,
            "architecture": "Hybrid NeuMF (TF 2.x) + TF-IDF Cosine Similarity",
            "training_summary": train_result,
            "evaluation_metrics": eval_metrics["metrics"],
            "test_users_evaluated": eval_metrics["test_users_count"],
            "total_catalog_size": len(all_catalog),
            "status": "ready"
        }

        # Save evaluation report to version dir
        version_dir = os.path.join(self.artifacts_dir, version)
        os.makedirs(version_dir, exist_ok=True)
        report_path = os.path.join(version_dir, "evaluation_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(self.latest_evaluation_report, f, indent=2)

        self.is_initialized = True
        return self.latest_evaluation_report

    def get_recommendations(
        self,
        user_doc: Dict[str, Any],
        candidate_items: List[Dict[str, Any]],
        item_type: str = "resource",
        top_k: int = 10,
        baseline_mode: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Produce ranked recommendations for a university member.
        """
        # Ensure content index is fitted if candidates exist
        if not self.content_engine.is_fitted and candidate_items:
            self.content_engine.fit(candidate_items, item_type=item_type)

        return self.hybrid_ranker.rank(
            user_doc=user_doc,
            candidate_items=candidate_items,
            item_type=item_type,
            top_k=top_k,
            baseline_mode=baseline_mode
        )

    def score_candidates_oblivious_he(
        self,
        encrypted_user_vector_b64: str,
        candidate_items: List[Dict[str, Any]],
        user_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Obliviously score candidate items using Homomorphic Encryption (CKKS).
        The server receives [[User_Vector]] and computes [[Score]] = [[User_Vector]] · Item_Vector
        without ever decrypting or learning the user's vector.
        """
        from app.services.encryption_service import HomomorphicEncryptionService
        from app.recommendation_engine.preprocessing import FeatureExtractor

        scored_items = []
        for item in candidate_items:
            item_id = str(item.get("_id", item.get("id", "")))
            item_type = item.get("item_type", "resource")
            features = FeatureExtractor.extract_item_features(item, item_type)

            # Build normalized numerical feature representation
            feature_vec = [
                features["norm_rating"],
                features["norm_popularity"],
                1.0 if features.get("is_active", True) else 0.0,
                0.85
            ]

            # Homomorphic dot product
            dot_res = HomomorphicEncryptionService.compute_oblivious_dot_product(
                ciphertext_b64=encrypted_user_vector_b64,
                plaintext_vector=feature_vec,
                user_id=user_id
            )

            scored_items.append({
                "item_id": item_id,
                "title": features["title"],
                "category": features["category"],
                "department": features["department"],
                "encrypted_score": dot_res["encrypted_result"],
                "size_bytes": dot_res.get("size_bytes", 0),
                "computation_time_ms": dot_res.get("computation_time_ms", 0.0),
                "is_encrypted": True
            })

        return scored_items

    def aggregate_cohort_ratings_mpc(
        self,
        item_id: str,
        cohort_ratings: List[float],
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Compute privacy-preserving cohort rating for an item using 3-Party MPC.
        """
        from app.services.mpc_service import MPCService
        return MPCService.execute_multi_party_rating_aggregation(
            ratings_by_parties=cohort_ratings,
            user_id=user_id
        )

