"""
Hybrid Recommendation and Post-Processing Ranking Engine.
Combines Content-Based similarity with TensorFlow NeuMF Collaborative Filtering.
Applies availability filtering (events freshness, service status), diversity boosting,
and privacy-preserving explanation generation.
"""
import time
from datetime import datetime, date
from typing import List, Dict, Any, Optional

from .content_based import ContentBasedRecommender
from .collaborative import NeuralCollaborativeRecommender
from .preprocessing import FeatureExtractor, pseudonymize_user_id


class HybridRanker:
    """
    Hybrid scoring and ranking layer:
    Score = (alpha * Content_Score) + ((1 - alpha) * Collaborative_Score)
    with dynamic cold-start fallbacks and temporal filtering.
    """

    def __init__(
        self,
        content_engine: Optional[ContentBasedRecommender] = None,
        collab_engine: Optional[NeuralCollaborativeRecommender] = None,
        default_alpha: float = 0.5
    ):
        self.content_engine = content_engine or ContentBasedRecommender()
        self.collab_engine = collab_engine or NeuralCollaborativeRecommender()
        self.default_alpha = default_alpha

    def is_item_available(self, item: Dict[str, Any], item_type: str) -> bool:
        """
        Availability filtering:
        - Drops past events.
        - Drops inactive services or unapproved resources.
        """
        # Active status check
        if item.get("is_active") is False or item.get("active") is False:
            return False

        if item.get("status") in ["rejected", "suspended", "archived"]:
            return False

        if item.get("availability_status") in ["Inactive", "Suspended", "Maintenance"]:
            return False

        # Date freshness for events
        if item_type == "event" or "date" in item:
            date_str = item.get("date")
            if date_str:
                try:
                    # Accepts 'YYYY-MM-DD' or ISO formats
                    event_dt = datetime.strptime(str(date_str)[:10], "%Y-%m-%d").date()
                    if event_dt < date.today():
                        return False
                except Exception:
                    pass  # If date format is non-standard, do not drop

        return True

    def rank(
        self,
        user_doc: Dict[str, Any],
        candidate_items: List[Dict[str, Any]],
        item_type: str = "resource",
        interaction_history: Optional[List[Dict[str, Any]]] = None,
        privacy_prefs: Optional[Dict[str, Any]] = None,
        alpha: Optional[float] = None,
        top_k: int = 10,
        baseline_mode: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Execute full hybrid ranking pipeline:
        1. Availability filtering
        2. Content-based similarity scoring
        3. TensorFlow NeuMF collaborative scoring
        4. Dynamic alpha blend (shifts to content when cold-start)
        5. Privacy explanation generation
        """
        # Filter available items
        available_items = [
            item for item in candidate_items
            if self.is_item_available(item, item_type)
        ]

        if not available_items:
            return []

        user_features = FeatureExtractor.extract_user_features(user_doc, privacy_prefs)
        pseudo_user_id = user_features["pseudonymous_id"]

        # If baseline mode is explicitly active (e.g. cold-start baseline test), use content with baseline prefix
        effective_alpha = 1.0 if baseline_mode else (alpha if alpha is not None else self.default_alpha)

        # 1. Content-based scoring
        content_results = self.content_engine.rank_candidates(
            user_features=user_features,
            candidate_items=available_items,
            interaction_history=interaction_history,
            top_k=len(available_items)
        )
        content_score_map = {r["item_id"]: r for r in content_results}

        # 2. Collaborative filtering scoring
        is_user_cold = False
        collab_scores = {}

        if not baseline_mode and self.collab_engine.is_trained:
            item_ids = [str(it.get("_id", it.get("id"))) for it in available_items]
            # Check user familiarity
            if self.collab_engine.vocab.encode_user(pseudo_user_id) == 0:
                is_user_cold = True
            else:
                collab_scores = self.collab_engine.predict_user_item_scores(pseudo_user_id, item_ids)
        else:
            is_user_cold = True

        # Dynamic fallback: if user is cold, fallback 100% to content
        if is_user_cold:
            effective_alpha = 1.0

        ranked_items = []
        for item in available_items:
            item_id = str(item.get("_id", item.get("id")))
            c_info = content_score_map.get(item_id, {})
            c_score = c_info.get("score", 0.5)

            # Check if item is cold in collaborative model
            is_item_cold = (self.collab_engine.vocab.encode_item(item_id) == 0) if self.collab_engine.is_trained else True

            if is_user_cold or is_item_cold:
                collab_score = c_score
                final_score = c_score
                source = "content"
            else:
                collab_score = collab_scores.get(item_id, 0.5)
                final_score = (effective_alpha * c_score) + ((1.0 - effective_alpha) * collab_score)
                source = "hybrid"

            # Formulate transparent explanation
            base_exp = c_info.get("explanation", "Matches campus interests")
            if baseline_mode:
                explanation = f"[Baseline Heuristic] {base_exp}"
            elif source == "hybrid":
                explanation = f"[Hybrid NeuMF] {base_exp} & peer interaction pattern"
            else:
                explanation = f"[Content Engine] {base_exp}"

            # Format item output for downstream consumers & backward compatibility
            rec_entry = {
                "id": item_id,
                "item_id": item_id,
                "resource_id": item_id,  # backward compatibility with tests
                "title": item.get("title") or item.get("name") or "Resource",
                "category": item.get("category", "General"),
                "department": item.get("department") or item.get("department_or_host") or "General",
                "score": round(final_score, 4),
                "content_score": round(c_score, 4),
                "collaborative_score": round(collab_score, 4),
                "source": source,
                "explanation": explanation,
                "rating": item.get("rating", 4.5),
                "tags": item.get("tags", []),
                "date": item.get("date"),
                "location": item.get("location"),
                "availability_status": item.get("availability_status", "Active"),
                "raw_item": item
            }
            ranked_items.append(rec_entry)

        # Sort descending by final score
        ranked_items.sort(key=lambda x: x["score"], reverse=True)
        return ranked_items[:top_k]
