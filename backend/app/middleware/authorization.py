from functools import wraps
from flask import g, jsonify, request
import logging
from app.core.security import roles_required
from app.utils.responses import error_response

logger = logging.getLogger(__name__)

def check_owner_or_admin(target_user_id: str) -> bool:
    """Check if the currently authenticated user is either the target user or an admin."""
    if not hasattr(g, 'current_user') or not g.current_user:
        return False
    current_id = str(g.current_user.get('id', ''))
    is_admin = g.current_user.get('role', '').lower() == 'admin'
    return is_admin or current_id == str(target_user_id)

def owner_or_admin_required(user_id_param_name: str = 'user_id'):
    """Decorator ensuring that only the resource owner or an admin can proceed."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not hasattr(g, 'current_user') or not g.current_user:
                return error_response(
                    message="Authentication required.",
                    error_code="UNAUTHORIZED",
                    status_code=401
                )

            target_id = kwargs.get(user_id_param_name) or kwargs.get('id')
            if not target_id:
                return error_response(
                    message="Target user ID not specified.",
                    error_code="BAD_REQUEST",
                    status_code=400
                )

            if not check_owner_or_admin(target_id):
                logger.warning(f"Ownership violation: user {g.current_user.get('email')} attempted to access/modify record of {target_id}")
                return error_response(
                    message="Access forbidden. You do not have permission to modify this profile.",
                    error_code="FORBIDDEN",
                    status_code=403
                )

            return f(*args, **kwargs)
        return wrapper
    return decorator

__all__ = ['roles_required', 'check_owner_or_admin', 'owner_or_admin_required']
