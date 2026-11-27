from functools import wraps
from flask import request
from typing import List, Callable, Optional, Dict, Any, Tuple
from app.utils.responses import error_response

def validate_json_body(required_fields: Optional[List[str]] = None, custom_validator: Optional[Callable[[Dict[str, Any]], Tuple[bool, Optional[str]]]] = None):
    """
    Decorator validating JSON payload presence, required fields, and optional custom validator logic.
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if request.method in ('POST', 'PUT', 'PATCH'):
                data = request.get_json(silent=True)
                if data is None:
                    return error_response(
                        message="Invalid or missing JSON request body.",
                        error_code="VALIDATION_ERROR",
                        status_code=400
                    )

                if required_fields:
                    missing = [field for field in required_fields if field not in data or data[field] is None or (isinstance(data[field], str) and not data[field].strip())]
                    if missing:
                        return error_response(
                            message=f"Missing required fields: {', '.join(missing)}.",
                            error_code="VALIDATION_ERROR",
                            status_code=400,
                            details={"missing_fields": missing}
                        )

                if custom_validator:
                    is_valid, err_msg = custom_validator(data)
                    if not is_valid:
                        return error_response(
                            message=err_msg or "Validation failed.",
                            error_code="VALIDATION_ERROR",
                            status_code=400
                        )

            return f(*args, **kwargs)
        return wrapper
    return decorator
