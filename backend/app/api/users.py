import logging
from flask import Blueprint, request, g
from app.services.auth_service import AuthService
from app.middleware.authentication import jwt_required
from app.middleware.authorization import roles_required, check_owner_or_admin
from app.utils.responses import success_response, error_response, paginated_response
from app.utils.validators import parse_pagination

logger = logging.getLogger(__name__)

users_bp = Blueprint('users', __name__, url_prefix='/api/v1/users')

@users_bp.route('', methods=['GET'])
@jwt_required
@roles_required('admin', 'faculty', 'staff')
def get_users():
    """
    GET /api/users (and /api/v1/users)
    Retrieve paginated user directory.
    Allowed for admin, faculty, and staff.
    """
    role = request.args.get('role', '').strip()
    status_filter = request.args.get('status', '').strip()
    search = request.args.get('search', '').strip()
    limit, skip = parse_pagination(request.args.get('limit'), request.args.get('skip'), default_limit=20)

    result, status_code = AuthService.list_users(
        role=role,
        status=status_filter,
        search=search,
        limit=limit,
        skip=skip
    )

    if status_code != 200:
        return error_response(
            message=result.get('message', 'Failed to retrieve users.'),
            error_code=result.get('error', 'BAD_REQUEST'),
            status_code=status_code
        )

    return paginated_response(
        items=result['users'],
        total=result['total'],
        limit=result['limit'],
        skip=result['skip'],
        message="Users retrieved successfully.",
        item_key="users"
    )

@users_bp.route('/<user_id>', methods=['GET'])
@jwt_required
def get_user_detail(user_id: str):
    """
    GET /api/users/<id> (and /api/v1/users/<id>)
    Retrieve details for a specific user.
    Owner or Admin/Faculty/Staff.
    """
    is_authorized = check_owner_or_admin(user_id) or g.current_user.get('role') in ('faculty', 'staff')
    if not is_authorized:
        return error_response(
            message="Access denied. You do not have permission to view this profile.",
            error_code="FORBIDDEN",
            status_code=403
        )

    result, status_code = AuthService.get_user_by_id(user_id)
    if status_code != 200:
        return error_response(
            message=result.get('message', 'User not found.'),
            error_code=result.get('error', 'NOT_FOUND'),
            status_code=status_code
        )

    return success_response(
        data=result['user'],
        message="User details retrieved successfully.",
        user=result['user']
    )

@users_bp.route('/<user_id>', methods=['PUT'])
@jwt_required
def update_user(user_id: str):
    """
    PUT /api/users/<id> (and /api/v1/users/<id>)
    Update user profile attributes. Accessible by self or administrator.
    """
    if not check_owner_or_admin(user_id):
        return error_response(
            message="Access forbidden. You may only update your own user record.",
            error_code="FORBIDDEN",
            status_code=403
        )

    data = request.get_json(silent=True) or {}
    result, status_code = AuthService.update_profile(user_id, data)

    if status_code != 200:
        return error_response(
            message=result.get('message', 'Failed to update user profile.'),
            error_code=result.get('error', 'BAD_REQUEST'),
            status_code=status_code
        )

    return success_response(
        data=result['user'],
        message=result.get('message', 'User updated successfully.'),
        user=result['user']
    )

@users_bp.route('/<user_id>', methods=['DELETE'])
@jwt_required
@roles_required('admin')
def delete_user(user_id: str):
    """
    DELETE /api/users/<id> (and /api/v1/users/<id>)
    Delete a user account. Admin only, protected by sole-admin safeguard.
    """
    result, status_code = AuthService.delete_user(user_id, g.current_user)

    if status_code != 200:
        return error_response(
            message=result.get('message', 'Failed to delete user.'),
            error_code=result.get('error', 'BAD_REQUEST'),
            status_code=status_code
        )

    return success_response(
        message=result.get('message', 'User deleted successfully.')
    )
