from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class UserStatusUpdate(BaseModel):
    status: str  # active, suspended


class UserRoleUpdate(BaseModel):
    role: str  # student, faculty, staff, admin


class ResourceStatusUpdate(BaseModel):
    status: str  # Approved, Pending, Archived


class ServiceStatusUpdate(BaseModel):
    is_active: bool
