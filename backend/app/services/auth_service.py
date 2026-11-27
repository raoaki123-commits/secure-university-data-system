import re
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session

from app.models.db_models import User, PrivacyPreference
from app.core.security import PasswordSecurity
from app.security.jwt import JWTSecurity
from app.config import Config

logger = logging.getLogger(__name__)

VALID_ROLES = {"student", "faculty", "staff", "admin"}
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def validate_email(email: str) -> Tuple[bool, Optional[str]]:
    if not email or not isinstance(email, str):
        return False, "Email address is required."
    clean_email = email.strip().lower()
    if not EMAIL_REGEX.match(clean_email):
        return False, "Invalid institutional email address format."
    return True, None


def validate_password_strength(password: str) -> Tuple[bool, Optional[str]]:
    if not password or not isinstance(password, str):
        return False, "Password is required."
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one numerical digit."
    if not re.search(r"[^A-Za-z0-9]", password):
        return False, "Password must contain at least one special symbol (e.g. !@#$%^&*)."
    return True, None


class AuthService:
    """Core Authentication & Account Lifecycle Service using SQLAlchemy."""

    @classmethod
    def register_user(
        cls,
        db: Session,
        data: Dict[str, Any],
        admin_provision_key: Optional[str] = None
    ) -> Tuple[Dict[str, Any], int]:
        name = (data.get("name") or data.get("full_name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        confirm_password = data.get("confirm_password") or password
        role = (data.get("role") or "student").strip().lower()
        department = (data.get("department") or "Computer Science").strip()

        # 1. Validation
        if not name or not email or not password:
            return {"error": "Bad Request", "message": "Name, email, and password are required."}, 400

        is_valid_email, email_err = validate_email(email)
        if not is_valid_email:
            return {"error": "Bad Request", "message": email_err}, 400

        if password != confirm_password:
            return {"error": "Bad Request", "message": "Passwords do not match."}, 400

        is_valid_pw, pw_err = validate_password_strength(password)
        if not is_valid_pw:
            return {"error": "Bad Request", "message": pw_err}, 400

        if role not in VALID_ROLES:
            return {"error": "Bad Request", "message": f"Invalid role. Must be one of {list(VALID_ROLES)}."}, 400

        # 2. RBAC Safeguard for Admin Provisioning
        if role == "admin":
            expected_key = Config.ADMIN_PROVISION_KEY
            provided_key = admin_provision_key or data.get("admin_provision_key")
            if not provided_key or provided_key != expected_key:
                logger.warning(f"Unauthorized attempt to provision admin role for email: {email}")
                return {
                    "error": "Forbidden",
                    "message": "Privileged role 'admin' requires valid X-Admin-Provision-Key authentication header."
                }, 403

        # 3. Check for existing user
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return {"error": "Conflict", "message": "An account with this email address already exists."}, 409

        # 4. Create User
        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        now = datetime.now(timezone.utc)
        hashed_pw = PasswordSecurity.hash_password(password)

        new_user = User(
            id=user_id,
            name=name,
            email=email,
            password_hash=hashed_pw,
            role=role,
            department=department,
            account_status="active",
            is_active=True,
            token_version=1,
            created_at=now,
            updated_at=now
        )
        db.add(new_user)

        # Default Privacy Preference
        new_pref = PrivacyPreference(
            id=f"pref_{user_id}",
            user_id=user_id,
            share_department_with_recommender=True,
            collect_interaction_history=True,
            homomorphic_noise_scale=0.05,
            differential_privacy_epsilon=0.5,
            zero_knowledge_audit_logging=True,
            anonymize_bookmarks=True,
            last_consent_at=now,
            updated_at=now
        )
        db.add(new_pref)
        db.commit()
        db.refresh(new_user)

        # 5. Generate Tokens
        tokens = JWTSecurity.generate_tokens(new_user.id, new_user.email, new_user.role, new_user.token_version)

        logger.info(f"Successfully registered user {email} with role {role}")
        return {
            "status": 201,
            "message": "User account created successfully.",
            "user": new_user.to_dict(),
            "tokens": tokens
        }, 201

    @classmethod
    def authenticate_user(
        cls,
        db: Session,
        email: str,
        password: str
    ) -> Tuple[Dict[str, Any], int]:
        clean_email = (email or "").strip().lower()
        if not clean_email or not password:
            return {"error": "Bad Request", "message": "Email and password are required."}, 400

        user = db.query(User).filter(User.email == clean_email).first()
        generic_error = {"error": "Unauthorized", "message": "Invalid email or password."}

        if not user:
            return generic_error, 401

        if not PasswordSecurity.verify_password(password, user.password_hash):
            return generic_error, 401

        if user.account_status == "suspended":
            return {
                "error": "Forbidden",
                "message": "Account has been suspended. Please contact institutional administration."
            }, 403

        # Update last login
        user.last_login = datetime.now(timezone.utc)
        db.commit()

        tokens = JWTSecurity.generate_tokens(user.id, user.email, user.role, user.token_version)

        logger.info(f"User authenticated successfully: {user.email} (Role: {user.role})")
        return {
            "status": 200,
            "message": "Authentication successful.",
            "user": user.to_dict(),
            "tokens": tokens
        }, 200

    @classmethod
    def refresh_access_token(cls, db: Session, refresh_token: str) -> Tuple[Dict[str, Any], int]:
        try:
            payload = JWTSecurity.decode_token(refresh_token, expected_type="refresh")
        except Exception as e:
            return {"error": "Unauthorized", "message": str(e)}, 401

        user_id = payload.get("sub")
        token_version = payload.get("token_version", 1)

        user = db.query(User).filter(User.id == user_id).first()
        if not user or user.account_status == "suspended":
            return {"error": "Unauthorized", "message": "User session is invalid or suspended."}, 401

        if user.token_version != token_version:
            return {"error": "Unauthorized", "message": "Token version revoked. Please log in again."}, 401

        new_tokens = JWTSecurity.generate_tokens(user.id, user.email, user.role, user.token_version)
        return {
            "status": 200,
            "message": "Access token refreshed successfully.",
            "tokens": new_tokens
        }, 200

    @classmethod
    def update_profile(cls, db: Session, user_id: str, data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "Not Found", "message": "User not found."}, 404

        if "name" in data and data["name"]:
            user.name = data["name"].strip()
        elif "full_name" in data and data["full_name"]:
            user.name = data["full_name"].strip()

        if "department" in data and data["department"] is not None:
            user.department = data["department"].strip()

        user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)

        return {
            "status": 200,
            "message": "Profile updated successfully.",
            "user": user.to_dict()
        }, 200

    @classmethod
    def change_password(cls, db: Session, user_id: str, current_pw: str, new_pw: str) -> Tuple[Dict[str, Any], int]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "Not Found", "message": "User not found."}, 404

        if not PasswordSecurity.verify_password(current_pw, user.password_hash):
            return {"error": "Unauthorized", "message": "Current password is incorrect."}, 401

        is_valid, err = validate_password_strength(new_pw)
        if not is_valid:
            return {"error": "Bad Request", "message": err}, 400

        user.password_hash = PasswordSecurity.hash_password(new_pw)
        user.token_version += 1  # Invalidate all existing tokens
        user.updated_at = datetime.now(timezone.utc)
        db.commit()

        logger.info(f"Password changed and active sessions invalidated for user ID: {user_id}")
        return {"status": 200, "message": "Password changed successfully. Please log in again."}, 200
