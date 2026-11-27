from flask import Blueprint, request, jsonify, g
from app.services.auth_service import AuthService
from app.core.security import jwt_required, rate_limit_auth

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/register', methods=['POST'])
@rate_limit_auth(max_attempts=15, window_seconds=60)
def register():
    """Register a new user account with role-based validation."""
    data = request.get_json(silent=True) or {}
    admin_key = request.headers.get('X-Admin-Provision-Key') or data.get('admin_provision_key')
    response, status = AuthService.register_user(data, admin_provision_key=admin_key)
    return jsonify(response), status

@auth_bp.route('/login', methods=['POST'])
@rate_limit_auth(max_attempts=10, window_seconds=60)
def login():
    """Authenticate with institutional email and password."""
    data = request.get_json(silent=True) or {}
    email = data.get('email', '')
    password = data.get('password', '')
    response, status = AuthService.authenticate_user(email, password)
    return jsonify(response), status

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """Rotate and refresh access token using a valid refresh token."""
    data = request.get_json(silent=True) or {}
    refresh_token = data.get('refresh_token') or request.cookies.get('refresh_token')
    if not refresh_token:
        return jsonify({
            'error': 'Bad Request',
            'message': 'Refresh token is required.'
        }), 400
    response, status = AuthService.refresh_access_token(refresh_token)
    return jsonify(response), status

@auth_bp.route('/logout', methods=['POST'])
@jwt_required
def logout():
    """Terminates active session."""
    # In stateless JWTs with rotation, client discards tokens.
    # For full multi-device invalidation, call change-password or invalidate token_version.
    return jsonify({
        'status': 200,
        'message': 'Successfully logged out. Active session terminated.'
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required
def get_current_user_profile():
    """Fetch authenticated user profile."""
    return jsonify({
        'status': 200,
        'user': g.current_user
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required
def update_profile():
    """Update permitted personal profile fields."""
    data = request.get_json(silent=True) or {}
    user_id = g.current_user['id']
    response, status = AuthService.update_profile(user_id, data)
    return jsonify(response), status

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required
def change_password():
    """Change user password and invalidate previous session tokens."""
    data = request.get_json(silent=True) or {}
    user_id = g.current_user['id']
    current_pw = data.get('current_password', '')
    new_pw = data.get('new_password', '')

    if not current_pw or not new_pw:
        return jsonify({
            'error': 'Bad Request',
            'message': 'Both current_password and new_password are required.'
        }), 400

    response, status = AuthService.change_password(user_id, current_pw, new_pw)
    return jsonify(response), status

