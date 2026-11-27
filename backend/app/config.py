import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base application configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'sovereign-university-dev-secret-key-32b-min')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-cryptographic-signing-key-university-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv('JWT_ACCESS_EXP_MINUTES', 15)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.getenv('JWT_REFRESH_EXP_DAYS', 7)))
    
    # MongoDB Config
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/university_recommender')
    MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'university_recommender')
    USE_MOCK_DB = os.getenv('USE_MOCK_DB', 'false').lower() == 'true'

    # Admin Provisioning Protection Secret
    # Required when bootstrapping or provisioning an account with role 'admin'
    ADMIN_PROVISION_KEY = os.getenv('ADMIN_PROVISION_KEY', 'sovereign-admin-provision-token-26O2227')

    # Security & CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173').split(',')
    
    # Rate Limiting (In-Memory Sliding Window for Auth Endpoints)
    MAX_LOGIN_ATTEMPTS_PER_MINUTE = int(os.getenv('MAX_LOGIN_ATTEMPTS_PER_MINUTE', 10))

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    USE_MOCK_DB = True
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    SECRET_KEY = 'test-secret-key-at-least-32-bytes-long-for-testing'
    JWT_SECRET_KEY = 'test-jwt-secret-key-at-least-32-bytes-long-testing'

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    USE_MOCK_DB = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    @classmethod
    def validate_production_secrets(cls):
        """Strict validation of production secrets before starting up."""
        insecure_defaults = [
            'sovereign-university-dev-secret-key-32b-min',
            'jwt-cryptographic-signing-key-university-2026',
            'sovereign-admin-provision-token-26O2227'
        ]
        if cls.SECRET_KEY in insecure_defaults or len(cls.SECRET_KEY) < 32:
            raise ValueError("PRODUCTION ERROR: SECRET_KEY must be a unique, cryptographically strong key >= 32 bytes.")
        if cls.JWT_SECRET_KEY in insecure_defaults or len(cls.JWT_SECRET_KEY) < 32:
            raise ValueError("PRODUCTION ERROR: JWT_SECRET_KEY must be a unique, cryptographically strong key >= 32 bytes.")
        if cls.ADMIN_PROVISION_KEY in insecure_defaults or len(cls.ADMIN_PROVISION_KEY) < 24:
            raise ValueError("PRODUCTION ERROR: ADMIN_PROVISION_KEY must be securely rotated in production.")

