import os
import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db_models import User
from app.config import Config

security_bearer = HTTPBearer(auto_error=False)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", Config.JWT_SECRET_KEY)
JWT_ACCESS_EXP_MINUTES = int(os.getenv("JWT_ACCESS_EXP_MINUTES", 15))
JWT_REFRESH_EXP_DAYS = int(os.getenv("JWT_REFRESH_EXP_DAYS", 7))


class JWTSecurity:
    """Issues and verifies cryptographic JWT access and refresh tokens."""

    @staticmethod
    def generate_tokens(user_id: str, email: str, role: str, token_version: int = 1) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        access_exp = now + timedelta(minutes=JWT_ACCESS_EXP_MINUTES)
        refresh_exp = now + timedelta(days=JWT_REFRESH_EXP_DAYS)

        access_payload = {
            "sub": str(user_id),
            "email": email,
            "role": role.lower(),
            "token_version": token_version,
            "type": "access",
            "iat": int(now.timestamp()),
            "exp": int(access_exp.timestamp())
        }

        refresh_payload = {
            "sub": str(user_id),
            "token_version": token_version,
            "type": "refresh",
            "iat": int(now.timestamp()),
            "exp": int(refresh_exp.timestamp())
        }

        access_token = jwt.encode(access_payload, JWT_SECRET_KEY, algorithm="HS256")
        refresh_token = jwt.encode(refresh_payload, JWT_SECRET_KEY, algorithm="HS256")

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": JWT_ACCESS_EXP_MINUTES * 60,
            "token_type": "Bearer"
        }

    @staticmethod
    def decode_token(token: str, expected_type: str = "access") -> Dict[str, Any]:
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
            if payload.get("type") != expected_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid token type. Expected {expected_type}, got {payload.get('type')}"
                )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired."
            )
        except jwt.InvalidTokenError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication token: {str(e)}"
            )


def get_current_user(
    request: Request,
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    """Dependency that authenticates the user via JWT Bearer token and checks status."""
    token = None
    if auth and auth.credentials:
        token = auth.credentials
    else:
        # Fallback to cookies or headers directly
        auth_hdr = request.headers.get("Authorization")
        if auth_hdr and auth_hdr.startswith("Bearer "):
            token = auth_hdr.split(" ", 1)[1]
        elif "access_token" in request.cookies:
            token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer authentication token."
        )

    payload = JWTSecurity.decode_token(token, expected_type="access")
    user_id = payload.get("sub")
    token_version = payload.get("token_version", 1)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists."
        )

    if user.account_status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended. Please contact institutional administration."
        )

    if user.token_version != token_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked. Please log in again."
        )

    return user


def get_optional_current_user(
    request: Request,
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Dependency that returns current user if authenticated, or None if guest."""
    try:
        return get_current_user(request=request, auth=auth, db=db)
    except HTTPException:
        return None


def roles_required(allowed_roles: List[str]):
    """Role-Based Access Control (RBAC) dependency factory."""
    def role_checker(user: User = Depends(get_current_user)) -> User:
        user_role = (user.role or "").lower()
        normalized_allowed = [r.lower() for r in allowed_roles]
        if user_role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Access requires one of roles {allowed_roles}, but you have role '{user_role}'."
            )
        return user
    return role_checker
