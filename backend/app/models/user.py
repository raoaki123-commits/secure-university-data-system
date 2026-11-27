import re
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional
from app.core.security import PasswordSecurity

VALID_ROLES = {'student', 'faculty', 'staff', 'admin'}
VALID_STATUSES = {'active', 'suspended'}
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

def validate_email(email: str) -> Tuple[bool, Optional[str]]:
    """Validate format and basic institutional domain sanity."""
    if not email or not isinstance(email, str):
        return False, "Email address is required."
    clean_email = email.strip().lower()
    if not EMAIL_REGEX.match(clean_email):
        return False, "Invalid email address format."
    return True, None

def validate_password_strength(password: str) -> Tuple[bool, Optional[str]]:
    """Enforces institutional password complexity."""
    if not password or not isinstance(password, str):
        return False, "Password is required."
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one numerical digit."
    if not re.search(r'[^A-Za-z0-9]', password):
        return False, "Password must contain at least one special symbol (e.g. !@#$%^&*)."
    return True, None

class UserModel:
    """Document schema and transformation for the 'users' MongoDB collection."""

    @staticmethod
    def create_document(
        email: str,
        full_name: str,
        password: str,
        role: str = 'student',
        department: str = '',
        account_status: str = 'active'
    ) -> Dict[str, Any]:
        """Construct a validated MongoDB user document with Argon2id password hash."""
        now = datetime.now(timezone.utc)
        return {
            'email': email.strip().lower(),
            'full_name': full_name.strip(),
            'password_hash': PasswordSecurity.hash_password(password),
            'role': role.strip().lower(),
            'department': department.strip() if department else '',
            'account_status': account_status,
            'token_version': 1,
            'created_at': now.isoformat(),
            'updated_at': now.isoformat(),
            'last_login': None
        }

    @staticmethod
    def to_dict(user_doc: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize MongoDB user document for safe API consumption (never returns password_hash)."""
        created = user_doc.get('created_at')
        if isinstance(created, datetime):
            created = created.isoformat()
        last_login = user_doc.get('last_login')
        if isinstance(last_login, datetime):
            last_login = last_login.isoformat()

        return {
            'id': str(user_doc.get('_id', user_doc.get('id', ''))),
            'full_name': user_doc.get('full_name', ''),
            'name': user_doc.get('full_name', ''),
            'email': user_doc.get('email', ''),
            'role': user_doc.get('role', 'student').lower(),
            'department': user_doc.get('department', ''),
            'account_status': user_doc.get('account_status', 'active'),
            'is_active': user_doc.get('account_status') != 'suspended',
            'token_version': user_doc.get('token_version', 1),
            'created_at': created,
            'last_login': last_login
        }

user_to_response = UserModel.to_dict
