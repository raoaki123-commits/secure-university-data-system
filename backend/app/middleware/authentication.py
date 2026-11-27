from functools import wraps
from flask import request, jsonify, g, current_app
from app.core.security import JWTSecurity, PasswordSecurity, jwt_required

def jwt_optional(f):
    """Decorator that parses JWT if present, but does not abort if absent."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        token = None
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        elif 'access_token' in request.cookies:
            token = request.cookies.get('access_token')

        if token:
            try:
                payload = JWTSecurity.decode_token(token, expected_type='access')
                from app.core.database import DatabaseManager
                from bson import ObjectId
                db = DatabaseManager.get_db()
                user = db['users'].find_one({'_id': ObjectId(payload['sub'])})
                if user and user.get('account_status') != 'suspended':
                    if user.get('token_version', 1) == payload.get('token_version', 1):
                        g.current_user = {
                            'id': str(user['_id']),
                            'email': user['email'],
                            'full_name': user.get('full_name', ''),
                            'role': user['role'].lower(),
                            'department': user.get('department', ''),
                            'account_status': user.get('account_status', 'active')
                        }
            except Exception:
                g.current_user = None
        else:
            g.current_user = None
        return f(*args, **kwargs)
    return decorated

__all__ = ['JWTSecurity', 'PasswordSecurity', 'jwt_required', 'jwt_optional']
