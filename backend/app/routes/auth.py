from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db_models import User
from app.schemas.auth import (
    RegisterRequest, LoginRequest, RefreshTokenRequest,
    UpdateProfileRequest, ChangePasswordRequest
)
from app.services.auth_service import AuthService
from app.security.jwt import get_current_user

router = APIRouter(tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    """Register a new student, faculty, staff, or admin user account."""
    admin_key = request.headers.get("X-Admin-Provision-Key") or payload.admin_provision_key
    data = payload.model_dump()
    res, code = AuthService.register_user(db, data, admin_provision_key=admin_key)
    if code >= 400:
        raise HTTPException(status_code=code, detail=res.get("message", "Registration failed"))
    return res


@router.post("/login", status_code=status.HTTP_200_OK)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate using institutional email and password."""
    res, code = AuthService.authenticate_user(db, payload.email, payload.password)
    if code >= 400:
        raise HTTPException(status_code=code, detail=res.get("message", "Authentication failed"))
    return res


@router.post("/refresh", status_code=status.HTTP_200_OK)
def refresh(payload: RefreshTokenRequest, request: Request, db: Session = Depends(get_db)):
    """Rotate and refresh access token using a valid refresh token."""
    refresh_token = payload.refresh_token or request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refresh token is required.")

    res, code = AuthService.refresh_access_token(db, refresh_token)
    if code >= 400:
        raise HTTPException(status_code=code, detail=res.get("message", "Token refresh failed"))
    return res


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(current_user: User = Depends(get_current_user)):
    """Terminate active authenticated user session."""
    return {
        "status": 200,
        "message": "Successfully logged out. Active session terminated."
    }


@router.get("/me", status_code=status.HTTP_200_OK)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Fetch profile of currently authenticated user."""
    return {
        "status": 200,
        "user": current_user.to_dict()
    }


@router.put("/profile", status_code=status.HTTP_200_OK)
def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile attributes (name, department)."""
    res, code = AuthService.update_profile(db, current_user.id, payload.model_dump(exclude_unset=True))
    if code >= 400:
        raise HTTPException(status_code=code, detail=res.get("message", "Profile update failed"))
    return res


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password and revoke all older session tokens."""
    res, code = AuthService.change_password(
        db, current_user.id, payload.current_password, payload.new_password
    )
    if code >= 400:
        raise HTTPException(status_code=code, detail=res.get("message", "Password change failed"))
    return res
