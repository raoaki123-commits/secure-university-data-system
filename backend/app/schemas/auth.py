from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=8)
    confirm_password: Optional[str] = None
    role: str = Field(default="student")
    department: Optional[str] = Field(default="Computer Science")
    admin_provision_key: Optional[str] = None


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1)


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: Optional[str] = ""
    account_status: str = "active"
    is_active: bool = True
    token_version: int = 1
    created_at: Optional[str] = None
    last_login: Optional[str] = None


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int


class AuthResponse(BaseModel):
    status: int = 200
    message: str
    user: Dict[str, Any]
    tokens: Dict[str, Any]
