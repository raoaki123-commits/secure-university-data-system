"""
Recommendation System Offline Evaluation Pipeline.
Computes standard information retrieval metrics: Precision@K, Recall@K,
HitRate@K, and NDCG@K on holdout test interactions without data leakage.
"""
import math
from typing import List, Dict, Any, Set


def precision_at_k(recommended: List[str], ground_truth: Set[str], k: int) -> float:
    """
    Compute Precision@K: fraction of top-K recommendations that are relevant.
    """
    if k <= 0 or not ground_truth:
        return 0.0
    rec_k = recommended[:k]
    hits = sum(1 for item in rec_k if item in ground_truth)
    return hits / float(k)


def recall_at_k(recommended: List[str], ground_truth: Set[str], k: int) -> float:
    """
    Compute Recall@K: fraction of relevant items that are captured in top-K.
    """
    if not ground_truth or k <= 0:
        return 0.0
    rec_k = recommended[:k]
    hits = sum(1 for item in rec_k if item in ground_truth)
    return hits / float(len(ground_truth))


def hit_rate_at_k(recommended: List[str], ground_truth: Set[str], k: int) -> float:
    """
    Compute HitRate@K: 1.0 if at least one relevant item appears in top-K, else 0.0.
    """
    if not ground_truth or k <= 0:
        return 0.0
    rec_k = recommended[:k]
    for item in rec_k:
        if item in ground_truth:
            return 1.0
    return 0.0


def ndcg_at_k(recommended: List[str], ground_truth: Set[str], k: int) -> float:
    """
    Compute Normalized Discounted Cumulative Gain (NDCG@K) with binary relevance.
    """
    if not ground_truth or k <= 0:
        return 0.0

    rec_k = recommended[:k]
    dcg = 0.0
    for rank, item in enumerate(rec_k, start=1):
        if item in ground_truth:
            dcg += 1.0 / math.log2(rank + 1.0)

    # Ideal DCG: top min(k, len(ground_truth)) ranks filled with hits
    idcg = sum(1.0 / math.log2(r + 1.0) for r in range(1, min(k, len(ground_truth)) + 1))
    if idcg <= 0.0:
        return 0.0

    return dcg / idcg


class RecommendationEvaluator:
    """
    Runs systematic offline evaluation across a population of test users.
    """

    @staticmethod
    def evaluate(
        ground_truth_map: Dict[str, Set[str]],
        predictions_map: Dict[str, List[str]],
        k_values: List[int] = [5, 10]
    ) -> Dict[str, Any]:
        """
        Evaluate recommendations for all test users across multiple K thresholds.
        """
        evaluated_users = 0
        metrics = {
            f"precision@{k}": 0.0 for k in k_values
        }
        for k in k_values:
            metrics[f"recall@{k}"] = 0.0
            metrics[f"hit_rate@{k}"] = 0.0
            metrics[f"ndcg@{k}"] = 0.0

        for user_id, ground_truth in ground_truth_map.items():
            if not ground_truth:
                continue

            recommended = predictions_map.get(user_id, [])
            evaluated_users += 1

            for k in k_values:
                metrics[f"precision@{k}"] += precision_at_k(recommended, ground_truth, k)
                metrics[f"recall@{k}"] += recall_at_k(recommended, ground_truth, k)
                metrics[f"hit_rate@{k}"] += hit_rate_at_k(recommended, ground_truth, k)
                metrics[f"ndcg@{k}"] += ndcg_at_k(recommended, ground_truth, k)

        if evaluated_users > 0:
            for key in metrics:
                metrics[key] = round(metrics[key] / evaluated_users, 4)

        return {
            "test_users_count": evaluated_users,
            "metrics": metrics
        }
