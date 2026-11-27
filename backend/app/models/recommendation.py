from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

class RecommendationModel:
    """Document schema and transformation for recommendation feedback and cached recommendations."""

    @staticmethod
    def create_feedback_document(
        user_id: str,
        item_id: str,
        item_type: str,
        feedback: str,
        title: str = '',
        category: str = ''
    ) -> Dict[str, Any]:
        """Construct feedback interaction record."""
        return {
            'user_id': user_id,
            'item_id': item_id,
            'item_type': item_type.lower(),
            'feedback': feedback.lower(),
            'title': title,
            'category': category,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

    @staticmethod
    def create_recommendation_item(
        item_id: str,
        item_type: str,
        title: str,
        category: str,
        department: str,
        score: float,
        explanation: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Format an individual recommendation candidate item."""
        res = {
            'item_id': str(item_id),
            'item_type': item_type,
            'title': title,
            'category': category,
            'department': department,
            'score': round(float(score), 4),
            'explanation': explanation,
            **(metadata or {})
        }
        return res
