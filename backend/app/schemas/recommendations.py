from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class FeedbackCreate(BaseModel):
    item_id: str
    item_type: str = "resource"
    feedback: str = Field(..., pattern="^(useful|not_relevant|saved)$")
    title: Optional[str] = ""
    category: Optional[str] = ""


class RecommendationItem(BaseModel):
    item_id: str
    item_type: str
    title: str
    category: str
    department: str
    score: float
    explanation: str
    format: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    contact_email: Optional[str] = None


class RecommendationMetadata(BaseModel):
    engine: str
    is_baseline: bool
    ml_framework: str
    student_department: str
    description: str
