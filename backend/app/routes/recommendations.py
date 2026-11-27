from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db_models import User
from app.schemas.recommendations import FeedbackCreate
from app.services.recommendation_service import RecommendationService
from app.security.jwt import get_current_user

router = APIRouter(tags=["Recommendations"])


@router.get("/student", status_code=status.HTTP_200_OK)
@router.get("", status_code=status.HTTP_200_OK)
@router.get("/", status_code=status.HTTP_200_OK)
def get_student_recommendations(
    item_type: str = Query(None),
    limit: int = Query(12, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate privacy-preserving recommendations tailored to student department and interests."""
    recommendations, metadata = RecommendationService.get_student_recommendations(
        db, user=current_user, item_type_filter=item_type, limit=limit
    )
    return {
        "status": 200,
        "recommender_metadata": metadata,
        "count": len(recommendations),
        "recommendations": recommendations
    }


@router.post("/feedback", status_code=status.HTTP_200_OK)
def submit_recommendation_feedback(
    payload: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit implicit or explicit feedback (useful, not_relevant, saved) to improve ranker."""
    RecommendationService.record_feedback(
        db,
        user_id=current_user.id,
        item_id=payload.item_id,
        item_type=payload.item_type,
        feedback=payload.feedback,
        title=payload.title,
        category=payload.category
    )
    return {
        "status": 200,
        "message": "Feedback recorded successfully."
    }


@router.get("/history", status_code=status.HTTP_200_OK)
def get_recommendation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve interaction history and feedback events for the authenticated student."""
    history = RecommendationService.get_feedback_history(db, current_user.id)
    return {
        "status": 200,
        "count": len(history),
        "history": history
    }
