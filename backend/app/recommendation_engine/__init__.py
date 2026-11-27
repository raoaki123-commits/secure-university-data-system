"""
TensorFlow 2.x Privacy-Preserving Recommendation Engine Package.
Modules:
- preprocessing: feature normalization, categorical indexers, pseudonymous hashing
- synthetic_data: realistic dataset generator across users, items, and interactions
- content_based: TF-IDF vectorization and cosine similarity
- collaborative: Neural Matrix Factorization (NeuMF) in TensorFlow 2.x
- hybrid_ranker: Dynamic hybrid ranking, availability checks, privacy-safe explanations
- evaluator: Offline IR evaluation (Precision@K, Recall@K, HitRate@K, NDCG@K)
- model_manager: Production coordinator for training, persistence, and inference
"""

from .preprocessing import (
    pseudonymize_user_id,
    clean_text,
    extract_tags,
    FeatureExtractor,
    CategoricalVocabulary
)
from .synthetic_data import (
    generate_synthetic_users,
    generate_synthetic_catalog,
    generate_synthetic_interactions,
    train_test_split
)
from .content_based import ContentBasedRecommender
from .collaborative import (
    NeuralCollaborativeRecommender,
    build_neumf_model
)
from .hybrid_ranker import HybridRanker
from .evaluator import (
    RecommendationEvaluator,
    precision_at_k,
    recall_at_k,
    hit_rate_at_k,
    ndcg_at_k
)
from .model_manager import (
    RecommendationModelManager
)

__all__ = [
    "pseudonymize_user_id",
    "clean_text",
    "extract_tags",
    "FeatureExtractor",
    "CategoricalVocabulary",
    "generate_synthetic_users",
    "generate_synthetic_catalog",
    "generate_synthetic_interactions",
    "train_test_split",
    "ContentBasedRecommender",
    "NeuralCollaborativeRecommender",
    "build_neumf_model",
    "HybridRanker",
    "RecommendationEvaluator",
    "precision_at_k",
    "recall_at_k",
    "hit_rate_at_k",
    "ndcg_at_k",
    "RecommendationModelManager"
]
