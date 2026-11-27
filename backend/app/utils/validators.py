import re
from typing import Tuple, Optional, Any, Dict, List

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')
VALID_ROLES = {'student', 'faculty', 'staff', 'admin'}
VALID_STATUSES = {'active', 'suspended'}
VALID_RESOURCE_STATUSES = {'approved', 'pending_approval', 'archived', 'rejected'}

def validate_email_format(email: Any) -> Tuple[bool, Optional[str]]:
    """Validate email string structure."""
    if not email or not isinstance(email, str):
        return False, "Email address is required."
    clean = email.strip().lower()
    if not EMAIL_REGEX.match(clean):
        return False, "Invalid email address format."
    return True, None

def validate_password_complexity(password: Any) -> Tuple[bool, Optional[str]]:
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

def validate_role(role: Any) -> Tuple[bool, Optional[str]]:
    """Validate user role against permitted RBAC tiers."""
    if not role or not isinstance(role, str):
        return False, "Role is required."
    clean_role = role.strip().lower()
    if clean_role not in VALID_ROLES:
        return False, f"Invalid role '{role}'. Allowed roles: {', '.join(sorted(VALID_ROLES))}."
    return True, None

def parse_pagination(limit_raw: Any, skip_raw: Any, default_limit: int = 20, max_limit: int = 100) -> Tuple[int, int]:
    """Safely sanitize limit and skip parameters."""
    try:
        limit = int(limit_raw) if limit_raw is not None else default_limit
        if limit <= 0:
            limit = default_limit
        limit = min(limit, max_limit)
    except (ValueError, TypeError):
        limit = default_limit

    try:
        skip = int(skip_raw) if skip_raw is not None else 0
        if skip < 0:
            skip = 0
    except (ValueError, TypeError):
        skip = 0

    return limit, skip

def validate_resource_payload(data: Dict[str, Any], is_update: bool = False) -> Tuple[bool, Optional[str]]:
    """Validate resource fields."""
    if not is_update:
        if not data.get('title') or not str(data['title']).strip():
            return False, "Resource title is required."
        if not data.get('description') or not str(data['description']).strip():
            return False, "Resource description is required."
    if 'status' in data and data['status'] not in VALID_RESOURCE_STATUSES:
        return False, f"Invalid status '{data['status']}'. Allowed: {', '.join(VALID_RESOURCE_STATUSES)}."
    return True, None

def validate_event_payload(data: Dict[str, Any], is_update: bool = False) -> Tuple[bool, Optional[str]]:
    """Validate event fields."""
    if not is_update:
        if not data.get('title') or not str(data['title']).strip():
            return False, "Event title is required."
        if not data.get('description') or not str(data['description']).strip():
            return False, "Event description is required."
        if not data.get('date') or not str(data['date']).strip():
            return False, "Event date is required."
    return True, None

def validate_service_payload(data: Dict[str, Any], is_update: bool = False) -> Tuple[bool, Optional[str]]:
    """Validate service fields."""
    if not is_update:
        if not data.get('name') or not str(data['name']).strip():
            return False, "Service name is required."
        if not data.get('description') or not str(data['description']).strip():
            return False, "Service description is required."
    return True, None
