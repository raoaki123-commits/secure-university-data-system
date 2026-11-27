import time
import logging
from functools import wraps
from datetime import datetime, timezone, timedelta
from flask import request, jsonify, g, current_app
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
import bcrypt

logger = logging.getLogger(__name__)

# Initialize Argon2id password hasher with recommended OWASP parameters
# memory_cost=65536 (64MB), time_cost=3, parallelism=4
try:
    hasher = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=4, hash_len=32, salt_len=16)
    USE_ARGON2 = True
except Exception as e:
    logger.warning(f"Argon2 initialization warning: {e}. Falling back to bcrypt.")
    USE_ARGON2 = False

class PasswordSecurity:
    """Handles secure password hashing and verification using Argon2id with bcrypt fallback."""

    @staticmethod
    def hash_password(password: str) -> str:
        if not password or not isinstance(password, str):
            raise ValueError("Password must be a non-empty string.")
        if USE_ARGON2:
            return hasher.hash(password)
        else:
            salt = bcrypt.gensalt(rounds=12)
            return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        if not plain_password or not hashed_password:
            return False
        try:
            if hashed_password.startswith('$argon2'):
                return hasher.verify(hashed_password, plain_password)
            elif hashed_password.startswith('$2b$') or hashed_password.startswith('$2a$'):
                return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
            else:
                return False
        except (VerifyMismatchError, VerificationError, Exception):
            return False

class JWTSecurity:
    """Issues and verifies short-lived Access and long-lived Refresh JWTs."""

    @staticmethod
    def generate_tokens(user_id: str, email: str, role: str, token_version: int = 1) -> dict:
        secret = current_app.config['JWT_SECRET_KEY']
        now = datetime.now(timezone.utc)
        
        access_exp = now + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        refresh_exp = now + current_app.config['JWT_REFRESH_TOKEN_EXPIRES']

        access_payload = {
            'sub': str(user_id),
            'email': email,
            'role': role.lower(),
            'token_version': token_version,
            'type': 'access',
            'iat': int(now.timestamp()),
            'exp': int(access_exp.timestamp())
        }

        refresh_payload = {
            'sub': str(user_id),
            'token_version': token_version,
            'type': 'refresh',
            'iat': int(now.timestamp()),
            'exp': int(refresh_exp.timestamp())
        }

        access_token = jwt.encode(access_payload, secret, algorithm='HS256')
        refresh_token = jwt.encode(refresh_payload, secret, algorithm='HS256')

        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': int(current_app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds()),
            'token_type': 'Bearer'
        }

    @staticmethod
    def decode_token(token: str, expected_type: str = 'access') -> dict:
        secret = current_app.config['JWT_SECRET_KEY']
        try:
            payload = jwt.decode(token, secret, algorithms=['HS256'])
            if payload.get('type') != expected_type:
                raise jwt.InvalidTokenError(f"Invalid token type. Expected {expected_type}, got {payload.get('type')}")
            return payload
        except jwt.ExpiredSignatureError:
            raise jwt.ExpiredSignatureError("Authentication token has expired.")
        except jwt.InvalidTokenError as e:
            raise jwt.InvalidTokenError(f"Invalid authentication token: {str(e)}")

# Sliding-window in-memory rate limiter for login / register attempts per IP
_rate_limit_cache = {}

def reset_rate_limits():
    """Clear in-memory rate limiter cache (useful for testing)."""
    global _rate_limit_cache
    _rate_limit_cache.clear()

def rate_limit_auth(max_attempts: int = 10, window_seconds: int = 60):
    """Decorator to protect sensitive authentication endpoints from brute-force attempts."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if current_app.config.get('TESTING') and not current_app.config.get('ENFORCE_TEST_RATE_LIMIT'):
                return f(*args, **kwargs)

            ip = request.remote_addr or '127.0.0.1'
            now = time.time()
            attempts = _rate_limit_cache.get(ip, [])
            
            # Filter attempts within active window
            attempts = [t for t in attempts if now - t < window_seconds]
            if len(attempts) >= max_attempts:
                logger.warning(f"Rate limit exceeded for IP {ip}")
                return jsonify({
                    'status': 429,
                    'error': 'Too Many Requests',
                    'message': 'Too many authentication attempts. Please wait a minute before trying again.'
                }), 429

            attempts.append(now)
            _rate_limit_cache[ip] = attempts
            return f(*args, **kwargs)
        return wrapper
    return decorator

def jwt_required(f):
    """Decorator ensuring that request has a valid, non-expired Bearer JWT."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        token = None

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        elif 'access_token' in request.cookies:
            token = request.cookies.get('access_token')

        if not token:
            return jsonify({
                'status': 401,
                'error': 'Unauthorized',
                'message': 'Authentication token is missing. Please provide Authorization: Bearer <token>.'
            }), 401

        try:
            payload = JWTSecurity.decode_token(token, expected_type='access')
        except jwt.ExpiredSignatureError:
            return jsonify({
                'status': 401,
                'error': 'Unauthorized',
                'message': 'Authentication token has expired. Please refresh your session.'
            }), 401
        except jwt.InvalidTokenError as e:
            return jsonify({
                'status': 401,
                'error': 'Unauthorized',
                'message': str(e)
            }), 401

        # Check token_version against current user record in database
        from app.core.database import DatabaseManager
        from bson import ObjectId
        db = DatabaseManager.get_db()
        try:
            user = db['users'].find_one({'_id': ObjectId(payload['sub'])})
            if not user:
                return jsonify({
                    'status': 401,
                    'error': 'Unauthorized',
                    'message': 'User belonging to this token no longer exists.'
                }), 401
            
            if user.get('account_status') == 'suspended':
                return jsonify({
                    'status': 403,
                    'error': 'Forbidden',
                    'message': 'Account has been suspended. Please contact campus IT administration.'
                }), 403

            if user.get('token_version', 1) != payload.get('token_version', 1):
                return jsonify({
                    'status': 401,
                    'error': 'Unauthorized',
                    'message': 'Session has been invalidated. Please log in again.'
                }), 401

            g.current_user = {
                'id': str(user['_id']),
                'email': user['email'],
                'full_name': user.get('full_name', ''),
                'role': user['role'].lower(),
                'department': user.get('department', ''),
                'account_status': user.get('account_status', 'active')
            }
        except Exception as e:
            logger.error(f"Error checking user session: {e}")
            return jsonify({'status': 500, 'error': 'Internal Server Error'}), 500

        return f(*args, **kwargs)
    return decorated

def roles_required(*allowed_roles):
    """Enforces Role-Based Access Control (RBAC) on endpoints."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not hasattr(g, 'current_user') or not g.current_user:
                return jsonify({
                    'status': 401,
                    'error': 'Unauthorized',
                    'message': 'Authentication required.'
                }), 401

            user_role = g.current_user.get('role', '').lower()
            normalized_allowed = [r.lower() for r in allowed_roles]

            if user_role not in normalized_allowed:
                logger.warning(f"RBAC Access Denied: User {g.current_user['email']} (role: {user_role}) attempted to access resource requiring {normalized_allowed}")
                return jsonify({
                    'status': 403,
                    'error': 'Forbidden',
                    'message': f"Access denied. Required role: {', '.join(normalized_allowed)}. Your role: {user_role}."
                }), 403

            return f(*args, **kwargs)
        return wrapper
    return decorator
