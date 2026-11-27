from typing import Any, Dict, Optional, Tuple
from flask import jsonify, Response

def success_response(
    data: Any = None,
    message: str = "Request completed successfully",
    status_code: int = 200,
    **extra: Any
) -> Tuple[Response, int]:
    """
    Standardized API success response helper.
    Adheres to the official format:
    {
        "success": True,
        "message": "...",
        "data": {...}
    }
    Includes extra keyword arguments and 'status' for backward-compatibility with existing clients.
    """
    payload: Dict[str, Any] = {
        "success": True,
        "message": message,
        "data": data if data is not None else {},
        "status": status_code,
        **extra
    }
    return jsonify(payload), status_code

def error_response(
    message: str = "Invalid request",
    error_code: str = "BAD_REQUEST",
    status_code: int = 400,
    details: Optional[Any] = None,
    **extra: Any
) -> Tuple[Response, int]:
    """
    Standardized API error response helper.
    Adheres to the official format:
    {
        "success": False,
        "message": "...",
        "error_code": "..."
    }
    Includes extra keyword arguments and 'status' for backward-compatibility with existing clients.
    """
    payload: Dict[str, Any] = {
        "success": False,
        "message": message,
        "error_code": error_code,
        "status": status_code,
        **extra
    }
    if details is not None:
        payload["details"] = details
    return jsonify(payload), status_code

def paginated_response(
    items: list,
    total: int,
    limit: int,
    skip: int,
    message: str = "Data retrieved successfully",
    item_key: str = "items",
    **extra: Any
) -> Tuple[Response, int]:
    """Helper for paginated collections."""
    data = {
        item_key: items,
        "total": total,
        "limit": limit,
        "skip": skip,
        "count": len(items)
    }
    return success_response(
        data=data,
        message=message,
        status_code=200,
        total=total,
        count=len(items),
        limit=limit,
        skip=skip,
        **{item_key: items},
        **extra
    )
