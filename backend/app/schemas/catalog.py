from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# --- Resources ---
class ResourceCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str = ""
    category: str = "general"
    department: str = ""
    author_or_source: str = ""
    tags: List[str] = []
    format: str = "PDF Document"
    access_level: str = "Public"
    rating: float = 4.5
    url: str = ""
    status: str = "Approved"


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    author_or_source: Optional[str] = None
    tags: Optional[List[str]] = None
    format: Optional[str] = None
    access_level: Optional[str] = None
    rating: Optional[float] = None
    url: Optional[str] = None
    status: Optional[str] = None


# --- Events ---
class EventCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str = ""
    category: str = "General"
    department_or_host: str = ""
    date: str = ""
    time: str = ""
    location: str = ""
    is_virtual: bool = False
    registration_required: bool = False
    registration_deadline: str = ""
    tags: List[str] = []
    attendees_count: int = 0
    status: str = "Approved"


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    department_or_host: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    is_virtual: Optional[bool] = None
    registration_required: Optional[bool] = None
    registration_deadline: Optional[str] = None
    tags: Optional[List[str]] = None
    attendees_count: Optional[int] = None
    status: Optional[str] = None


# --- Services ---
class ServiceCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: str = ""
    category: str = "Student Support"
    contact_email: str = ""
    location: str = ""
    hours: str = ""
    confidentiality_tier: str = "Standard FERPA"
    is_active: bool = True
    tags: List[str] = []


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    contact_email: Optional[str] = None
    location: Optional[str] = None
    hours: Optional[str] = None
    confidentiality_tier: Optional[str] = None
    is_active: Optional[bool] = None
    tags: Optional[List[str]] = None


# --- Bookmarks ---
class BookmarkCreate(BaseModel):
    item_id: str
    item_type: str = "resource"  # resource, event, service
    item_snapshot: Optional[Dict[str, Any]] = None
