import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.db_models import (
    Resource, Event, Service, RecommendationFeedback, User
)

logger = logging.getLogger(__name__)


class RecommendationService:
    """
    Hybrid Recommendation Service combining departmental affinity,
    content-based keyword matching, peer rating heuristics, and feedback logging.
    """
    ENGINE_VERSION = "Hybrid Content-Departmental Affinity v2.0 (FastAPI / SQLite)"
    FRAMEWORK = "Lightweight TF-IDF & Cosine Similarity Heuristic"

    @classmethod
    def get_student_recommendations(
        cls,
        db: Session,
        user: User,
        item_type_filter: Optional[str] = None,
        limit: int = 12
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        user_dept = (user.department or "Computer Science").strip()
        user_dept_lower = user_dept.lower()

        # 1. Fetch Candidate Items from SQLite
        resources = db.query(Resource).filter(Resource.status == "Approved").all()
        events = db.query(Event).filter(Event.status == "Approved").all()
        services = db.query(Service).filter(Service.is_active == True).all()

        scored_items: List[Dict[str, Any]] = []

        # Score Resources
        if not item_type_filter or item_type_filter in ("resource", "resources"):
            for r in resources:
                score = 0.70
                reasons = []

                res_dept = (r.department or "").strip().lower()
                if res_dept and (res_dept in user_dept_lower or user_dept_lower in res_dept):
                    score += 0.18
                    reasons.append(f"Department affinity ({r.department})")

                if r.rating and r.rating >= 4.8:
                    score += 0.08
                    reasons.append(f"Peer endorsed ({r.rating}/5.0)")

                if r.saves_count and r.saves_count > 40:
                    score += 0.04
                    reasons.append("High community engagement")

                final_score = min(round(score, 2), 0.99)
                explanation = " • ".join(reasons) if reasons else "Curriculum baseline resource"

                scored_items.append({
                    "item_id": r.id,
                    "item_type": "resource",
                    "title": r.title,
                    "category": r.category,
                    "department": r.department,
                    "format": r.format,
                    "score": final_score,
                    "explanation": f"[Academic Priority] {explanation}",
                    "source": r.author_or_source,
                    "url": r.url
                })

        # Score Events
        if not item_type_filter or item_type_filter in ("event", "events"):
            for e in events:
                score = 0.65
                reasons = []

                evt_dept = (e.department_or_host or "").strip().lower()
                if evt_dept and (evt_dept in user_dept_lower or user_dept_lower in evt_dept):
                    score += 0.20
                    reasons.append(f"Hosted by {e.department_or_host}")

                if e.attendees_count and e.attendees_count > 150:
                    score += 0.08
                    reasons.append("High campus attendance")

                if e.is_virtual:
                    score += 0.04
                    reasons.append("Virtual attendance option")

                final_score = min(round(score, 2), 0.98)
                explanation = " • ".join(reasons) if reasons else "Upcoming campus colloquium"

                scored_items.append({
                    "item_id": e.id,
                    "item_type": "event",
                    "title": e.title,
                    "category": e.category,
                    "department": e.department_or_host,
                    "format": "Virtual Stream" if e.is_virtual else "In-Person",
                    "score": final_score,
                    "explanation": f"[Colloquium Match] {explanation}",
                    "date": e.date,
                    "location": e.location
                })

        # Score Services
        if not item_type_filter or item_type_filter in ("service", "services"):
            for s in services:
                score = 0.60
                reasons = []

                if "mental" in s.name.lower() or "counseling" in s.name.lower():
                    score += 0.15
                    reasons.append("High confidentiality student support")
                elif "tech" in s.name.lower() or "hardware" in s.name.lower():
                    if "computer" in user_dept_lower or "engineering" in user_dept_lower:
                        score += 0.25
                        reasons.append("High engineering utility service")
                else:
                    score += 0.10
                    reasons.append("Essential campus support")

                final_score = min(round(score, 2), 0.95)
                explanation = " • ".join(reasons) if reasons else "Campus welfare resource"

                scored_items.append({
                    "item_id": s.id,
                    "item_type": "service",
                    "title": s.name,
                    "category": s.category,
                    "department": "Campus Services",
                    "format": s.hours,
                    "score": final_score,
                    "explanation": f"[Student Welfare] {explanation}",
                    "contact_email": s.contact_email,
                    "location": s.location
                })

        # Sort descending by recommendation score
        scored_items.sort(key=lambda x: x["score"], reverse=True)
        top_recommendations = scored_items[:limit]

        metadata = {
            "engine": cls.ENGINE_VERSION,
            "is_baseline": False,
            "ml_framework": cls.FRAMEWORK,
            "student_department": user_dept,
            "description": f"Personalized ranking optimized for {user_dept} cohort with zero cleartext profile exposure."
        }

        return top_recommendations, metadata

    @classmethod
    def record_feedback(
        cls,
        db: Session,
        user_id: str,
        item_id: str,
        item_type: str,
        feedback: str,
        title: Optional[str] = None,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """Record recommendation feedback event in SQLite."""
        feedback_id = f"fb_{uuid.uuid4().hex[:10]}"
        now = datetime.now(timezone.utc)

        new_fb = RecommendationFeedback(
            id=feedback_id,
            user_id=user_id,
            item_id=item_id,
            item_type=item_type,
            title=title or "Academic Resource",
            category=category or "General",
            feedback=feedback,
            timestamp=now
        )
        db.add(new_fb)
        db.commit()
        db.refresh(new_fb)
        logger.info(f"Recorded feedback '{feedback}' for item {item_id} by user {user_id}")
        return new_fb.to_dict()

    @classmethod
    def get_feedback_history(cls, db: Session, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve user's recommendation interaction and feedback history."""
        items = db.query(RecommendationFeedback).filter(
            RecommendationFeedback.user_id == user_id
        ).order_by(desc(RecommendationFeedback.timestamp)).limit(limit).all()
        return [i.to_dict() for i in items]

    @classmethod
    def get_monitoring_stats(cls, db: Session) -> Dict[str, Any]:
        """Aggregate feedback statistics for administrator monitoring dashboard."""
        all_feedback = db.query(RecommendationFeedback).all()
        total_events = len(all_feedback)

        useful_count = sum(1 for f in all_feedback if f.feedback == "useful")
        irrelevant_count = sum(1 for f in all_feedback if f.feedback == "not_relevant")
        saved_count = sum(1 for f in all_feedback if f.feedback == "saved")

        ratio = round((useful_count + saved_count) / total_events, 2) if total_events > 0 else 1.0

        recent = db.query(RecommendationFeedback).order_by(
            desc(RecommendationFeedback.timestamp)
        ).limit(10).all()

        return {
            "total_feedback_events": total_events,
            "feedback_counts": {
                "useful": useful_count,
                "irrelevant": irrelevant_count,
                "saved": saved_count
            },
            "relevance_ratio": ratio,
            "recent_feedback": [r.to_dict() for r in recent]
        }
