"""
Content-Based Recommendation Engine for University Communities.
Implements TF-IDF vectorization and cosine similarity over university catalog items
(Resources, Events, Services) matching user profile preferences and department affinity.
"""
import math
from typing import List, Dict, Any, Optional, Tuple
from collections import Counter
from .preprocessing import clean_text, extract_tags, FeatureExtractor


class ContentBasedRecommender:
    """
    Computes content similarity between candidate university entities and user interest profiles.
    Supports academic resources, campus events, and research services.
    """

    def __init__(self):
        self.item_corpus: List[Dict[str, Any]] = []
        self.item_vectors: Dict[str, Dict[str, float]] = {}
        self.idf_weights: Dict[str, float] = {}
        self.is_fitted: bool = False

    def fit(self, catalog_items: List[Dict[str, Any]], item_type: str = "generic"):
        """
        Fit TF-IDF vocabulary across all catalog items.
        Can ingest raw items (resources, events, services) and extract features.
        """
        self.item_corpus = []
        doc_count = len(catalog_items)
        if doc_count == 0:
            return

        doc_frequencies: Counter = Counter()

        # Step 1: Preprocess and extract content tokens for each item
        for raw_item in catalog_items:
            features = FeatureExtractor.extract_item_features(raw_item, raw_item.get("item_type", item_type))
            tokens = features["content_text"].split()
            unique_tokens = set(tokens)
            for token in unique_tokens:
                doc_frequencies[token] += 1

            self.item_corpus.append({
                "features": features,
                "tokens": tokens,
                "item_id": features["item_id"]
            })

        # Step 2: Compute Inverse Document Frequency (IDF)
        self.idf_weights = {}
        for token, count in doc_frequencies.items():
            # Standard smoothed IDF: ln((1 + N) / (1 + df)) + 1
            self.idf_weights[token] = math.log((1.0 + doc_count) / (1.0 + count)) + 1.0

        # Step 3: Compute normalized TF-IDF vector for each item
        self.item_vectors = {}
        for doc in self.item_corpus:
            item_id = doc["item_id"]
            tf = Counter(doc["tokens"])
            total_tokens = len(doc["tokens"]) or 1

            tfidf_vec: Dict[str, float] = {}
            squared_norm = 0.0

            for word, count in tf.items():
                val = (count / total_tokens) * self.idf_weights.get(word, 1.0)
                tfidf_vec[word] = val
                squared_norm += val * val

            # Unit-length normalization for fast cosine dot product
            norm = math.sqrt(squared_norm) or 1.0
            self.item_vectors[item_id] = {w: v / norm for w, v in tfidf_vec.items()}

        self.is_fitted = True

    def _build_user_vector(self, user_features: Dict[str, Any], interaction_history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, float]:
        """
        Construct a normalized TF-IDF vector representing user interests, department,
        and optionally recent interaction content.
        """
        user_tokens: List[str] = []

        # Department tokens
        if user_features.get("share_department", True) and user_features.get("department"):
            dept_tokens = clean_text(user_features["department"]).split()
            user_tokens.extend(dept_tokens * 3)  # Department emphasis

        # Academic interests / tags
        for interest in user_features.get("interests", []):
            interest_tokens = clean_text(interest).split()
            user_tokens.extend(interest_tokens * 2)

        # Interacted items content (weighted history)
        if interaction_history:
            for item in interaction_history[-5:]:  # Recent 5 items
                raw_text = item.get("title", "") + " " + item.get("category", "")
                user_tokens.extend(clean_text(raw_text).split())

        if not user_tokens:
            return {}

        tf = Counter(user_tokens)
        total_tokens = len(user_tokens)

        user_vec: Dict[str, float] = {}
        squared_norm = 0.0

        for word, count in tf.items():
            idf = self.idf_weights.get(word, 1.0)
            val = (count / total_tokens) * idf
            user_vec[word] = val
            squared_norm += val * val

        norm = math.sqrt(squared_norm) or 1.0
        return {w: v / norm for w, v in user_vec.items()}

    def _cosine_similarity(self, vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
        """Compute cosine similarity between two unit-normalized sparse vectors."""
        if not vec_a or not vec_b:
            return 0.0

        # Dot product over intersection
        if len(vec_a) < len(vec_b):
            dot = sum(val * vec_b.get(term, 0.0) for term, val in vec_a.items())
        else:
            dot = sum(val * vec_a.get(term, 0.0) for term, val in vec_b.items())

        return max(0.0, min(1.0, dot))

    def _generate_explanation(self, user_features: Dict[str, Any], item_features: Dict[str, Any], similarity: float) -> str:
        """Generate privacy-preserving, transparent rationale for recommendation."""
        reasons = []

        # Department match
        u_dept = user_features.get("department", "").lower()
        i_dept = item_features.get("department", "").lower()
        if u_dept and i_dept and u_dept in i_dept:
            reasons.append(f"Department affinity ({item_features.get('department')})")

        # Interest matches
        u_interests = {clean_text(x) for x in user_features.get("interests", [])}
        i_tags = {clean_text(x) for x in item_features.get("tags", [])}
        common = u_interests.intersection(i_tags)
        if common:
            reasons.append(f"Matches interests: {', '.join(list(common)[:2])}")

        if item_features.get("norm_rating", 0.0) >= 0.8:
            reasons.append("Highly rated by university peers")

        if not reasons:
            if similarity > 0.3:
                reasons.append(f"Curated for {user_features.get('role', 'student').capitalize()} curriculum")
            else:
                reasons.append("Campus community trend")

        return " | ".join(reasons)

    def rank_candidates(
        self,
        user_features: Dict[str, Any],
        candidate_items: List[Dict[str, Any]],
        interaction_history: Optional[List[Dict[str, Any]]] = None,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Rank candidate items for a user using content-based similarity.
        Returns scored and explained items.
        """
        if not self.is_fitted:
            self.fit(candidate_items)

        user_vec = self._build_user_vector(user_features, interaction_history)
        scored_items = []

        for item in candidate_items:
            features = FeatureExtractor.extract_item_features(item, item.get("item_type", "resource"))
            item_id = features["item_id"]
            item_vec = self.item_vectors.get(item_id, {})

            sim_score = self._cosine_similarity(user_vec, item_vec)

            # Combined content score: 70% textual relevance, 20% rating, 10% engagement
            rating_score = features["norm_rating"]
            popularity_score = features["norm_popularity"]
            content_score = (0.70 * sim_score) + (0.20 * rating_score) + (0.10 * popularity_score)

            explanation = self._generate_explanation(user_features, features, sim_score)

            scored_items.append({
                "item_id": item_id,
                "item_type": features["item_type"],
                "title": features["title"],
                "category": features["category"],
                "department": features["department"],
                "score": round(content_score, 4),
                "similarity_score": round(sim_score, 4),
                "explanation": explanation,
                "raw_item": item
            })

        # Sort descending by score
        scored_items.sort(key=lambda x: x["score"], reverse=True)
        return scored_items[:top_k]
