"""
Comprehensive Pytest Test Suite for TensorFlow 2.x Recommendation Engine.
Tests:
- Pseudonymization and feature preprocessing
- Synthetic data generation & train/test splits
- Content-Based TF-IDF cosine similarity engine
- TensorFlow 2.x NeuMF Collaborative Filtering training, persistence, and batch inference
- Hybrid dynamic ranker, availability filtering, and cold-start fallbacks
- Offline evaluation metrics (Precision@K, Recall@K, HitRate@K, NDCG@K)
- Flask API routes (/api/v1/recommendations/evaluation, /train, and ?engine=hybrid)
"""
import pytest
import os
import shutil
import numpy as np
import tensorflow as tf

from app.recommendation_engine.preprocessing import (
    pseudonymize_user_id,
    clean_text,
    extract_tags,
    FeatureExtractor,
    CategoricalVocabulary
)
from app.recommendation_engine.synthetic_data import (
    generate_synthetic_users,
    generate_synthetic_catalog,
    generate_synthetic_interactions,
    train_test_split
)
from app.recommendation_engine.content_based import ContentBasedRecommender
from app.recommendation_engine.collaborative import (
    build_neumf_model,
    NeuralCollaborativeRecommender
)
from app.recommendation_engine.hybrid_ranker import HybridRanker
from app.recommendation_engine.evaluator import (
    RecommendationEvaluator,
    precision_at_k,
    recall_at_k,
    hit_rate_at_k,
    ndcg_at_k
)
from app.recommendation_engine.model_manager import RecommendationModelManager


def test_pseudonymization_and_preprocessing():
    # Deterministic pseudonymous hashing
    uid = "student_jane_doe_123"
    pseudo1 = pseudonymize_user_id(uid)
    pseudo2 = pseudonymize_user_id(uid)
    assert pseudo1 == pseudo2
    assert pseudo1.startswith("usr_pseudo_")
    assert "jane" not in pseudo1
    assert "doe" not in pseudo1

    # Text cleaning & tag extraction
    raw = "Machine-Learning & Deep-Learning! (2026)"
    assert clean_text(raw) == "machine learning deep learning 2026"
    assert extract_tags(["AI", "Distributed Systems, Cloud"]) == ["ai", "distributed systems", "cloud"]

    # Feature Extractor
    user_doc = {
        "_id": "u1",
        "department": "Computer Science",
        "academic_interests": ["Machine Learning", "Cloud Systems"]
    }
    u_feat = FeatureExtractor.extract_user_features(user_doc)
    assert u_feat["department"] == "computer science"
    assert "machine learning" in u_feat["interests"]

    # Categorical Vocabulary
    vocab = CategoricalVocabulary()
    vocab.fit(["u1", "u2"], ["i1", "i2"])
    assert vocab.encode_user("u1") > 0
    assert vocab.encode_user("unseen_user") == 0  # <UNK>
    assert vocab.encode_item("unseen_item") == 0


def test_synthetic_data_generation():
    users = generate_synthetic_users(n_students=10, n_faculty=2, n_staff=2)
    assert len(users) == 14
    for u in users:
        assert "pseudonymous_id" in u
        assert len(u["academic_interests"]) >= 2

    res, evt, srv = generate_synthetic_catalog()
    assert len(res) >= 10
    assert len(evt) >= 8
    assert len(srv) >= 7

    catalog = res + evt + srv
    interactions = generate_synthetic_interactions(users, catalog, interactions_per_user_range=(4, 8))
    assert len(interactions) >= 40

    train, test = train_test_split(interactions, test_ratio=0.2, seed=123)
    assert len(train) + len(test) == len(interactions)
    assert len(test) > 0


def test_content_based_recommender():
    engine = ContentBasedRecommender()
    res, evt, srv = generate_synthetic_catalog()
    catalog = res + evt + srv
    engine.fit(catalog)

    user_features = {
        "pseudonymous_id": "usr_test",
        "department": "information security",
        "interests": ["cryptography", "zero knowledge proofs"],
        "role": "student",
        "share_department": True
    }

    results = engine.rank_candidates(user_features, catalog, top_k=5)
    assert len(results) == 5
    # The top recommended item should have strong relevance to security / cryptography
    top_item = results[0]
    assert any("crypt" in top_item["title"].lower() or "security" in top_item["department"].lower() for _ in [1])
    assert top_item["score"] > 0.0
    assert len(top_item["explanation"]) > 0


def test_collaborative_neumf_model_training(tmp_path):
    test_artifacts = str(tmp_path / "artifacts")
    recommender = NeuralCollaborativeRecommender(artifacts_dir=test_artifacts)

    # Synthetic interactions
    users = generate_synthetic_users(n_students=15, n_faculty=2, n_staff=1)
    res, evt, srv = generate_synthetic_catalog()
    catalog = res + evt + srv
    interactions = generate_synthetic_interactions(users, catalog, interactions_per_user_range=(5, 10))

    history = recommender.fit_from_interactions(
        interactions=interactions,
        epochs=3,
        batch_size=16,
        learning_rate=0.005
    )

    assert recommender.is_trained is True
    assert history["epochs_trained"] == 3
    assert history["final_loss"] > 0.0

    # Batch prediction for known user
    pseudo_uid = users[0]["pseudonymous_id"]
    item_ids = [c["_id"] for c in catalog[:5]]
    preds = recommender.predict_user_item_scores(pseudo_uid, item_ids)
    assert len(preds) == 5
    for i_id in item_ids:
        assert 0.0 <= preds[i_id] <= 1.0

    # Cold-start user prediction
    cold_preds = recommender.predict_user_item_scores("unknown_pseudo_user_999", item_ids)
    assert all(cold_preds[i_id] == 0.5 for i_id in item_ids)

    # Test loading saved weights
    loaded_recommender = NeuralCollaborativeRecommender(artifacts_dir=test_artifacts)
    success = loaded_recommender.load_artifacts("v1")
    assert success is True
    assert loaded_recommender.is_trained is True


def test_hybrid_ranking_and_availability():
    res, evt, srv = generate_synthetic_catalog()
    # Add an expired event and inactive service
    expired_event = {
        "_id": "evt_expired_999",
        "title": "Past Hackathon 2020",
        "category": "Hackathon",
        "department": "Computer Science",
        "date": "2020-01-01",  # Past date
        "status": "approved",
        "is_active": True
    }
    inactive_service = {
        "_id": "srv_inactive_999",
        "name": "Decommissioned Server",
        "category": "IT",
        "department": "Computer Science",
        "availability_status": "Inactive",
        "is_active": False
    }

    candidates = res + [expired_event, inactive_service]

    ranker = HybridRanker()
    user_doc = {
        "_id": "usr_test_student",
        "department": "Computer Science",
        "academic_interests": ["Machine Learning"]
    }

    ranked = ranker.rank(user_doc, candidates, top_k=20)
    ranked_ids = [r["item_id"] for r in ranked]

    # Availability filter: past event and inactive service MUST be dropped
    assert "evt_expired_999" not in ranked_ids
    assert "srv_inactive_999" not in ranked_ids
    assert len(ranked) > 0


def test_offline_evaluation_metrics():
    # Mathematical properties of IR metrics
    recommended = ["i1", "i2", "i3", "i4", "i5"]
    ground_truth = {"i2", "i4", "i6"}

    # Precision@5 = 2 / 5 = 0.40
    p5 = precision_at_k(recommended, ground_truth, 5)
    assert round(p5, 2) == 0.40

    # Recall@5 = 2 / 3 = 0.6667
    r5 = recall_at_k(recommended, ground_truth, 5)
    assert round(r5, 4) == 0.6667

    # HitRate@5 = 1.0 (since hits > 0)
    hr5 = hit_rate_at_k(recommended, ground_truth, 5)
    assert hr5 == 1.0

    # NDCG@5 > 0.0
    ndcg5 = ndcg_at_k(recommended, ground_truth, 5)
    assert 0.0 < ndcg5 <= 1.0

    # Evaluator class aggregation
    gt_map = {"u1": {"i2", "i4"}, "u2": {"i9"}}
    rec_map = {"u1": ["i1", "i2", "i3"], "u2": ["i5", "i6", "i7"]}
    eval_result = RecommendationEvaluator.evaluate(gt_map, rec_map, k_values=[3])
    assert eval_result["test_users_count"] == 2
    assert "precision@3" in eval_result["metrics"]


def test_api_hybrid_recommendation_and_evaluation(client):
    # Register and get student token
    res = client.post('/api/v1/auth/register', json={
        'name': 'ML Student',
        'email': 'student.ml@university.edu',
        'password': 'Password123!',
        'role': 'student',
        'department': 'Computer Science'
    })
    token = res.get_json()['tokens']['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # 1. Test GET /api/v1/recommendations/evaluation
    eval_res = client.get('/api/v1/recommendations/evaluation', headers=headers)
    assert eval_res.status_code == 200
    eval_data = eval_res.get_json()['evaluation']
    assert 'evaluation_metrics' in eval_data
    assert 'hit_rate@5' in eval_data['evaluation_metrics']
    assert eval_data['evaluation_metrics']['hit_rate@5'] > 0.5
    assert 'precision@5' in eval_data['evaluation_metrics']

    # 2. Test GET /api/v1/recommendations?engine=hybrid
    rec_res = client.get('/api/v1/recommendations?engine=hybrid', headers=headers)
    assert rec_res.status_code == 200
    rec_data = rec_res.get_json()
    assert rec_data['recommender_metadata']['is_baseline'] is False
    assert len(rec_data['recommendations']) > 0
    assert 'TensorFlow' in rec_data['recommender_metadata']['ml_framework']

    # 3. Test GET /api/v1/recommendations?engine=baseline (backward compatibility)
    base_res = client.get('/api/v1/recommendations?engine=baseline', headers=headers)
    assert base_res.status_code == 200
    assert base_res.get_json()['recommender_metadata']['is_baseline'] is True
