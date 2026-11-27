from typing import Optional, Any, Dict, List
from pydantic import BaseModel, Field


class GenericResponse(BaseModel):
    status: int = 200
    message: str


class ErrorDetail(BaseModel):
    error: str
    message: str
    status: int = 400
    details: Optional[Dict[str, Any]] = None
