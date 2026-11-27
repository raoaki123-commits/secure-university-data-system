import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config, DevelopmentConfig
from app.core.database import DatabaseManager
from app.core.errors import register_error_handlers
from app.api.auth import auth_bp
from app.api.users import users_bp
from app.api.rbac_demo import rbac_bp
from app.api.resources import resources_bp
from app.api.events import events_bp
from app.api.services import services_bp
from app.api.bookmarks import bookmarks_bp
from app.api.recommendations import recommendations_bp
from app.api.privacy import privacy_bp
from app.api.admin import admin_bp

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)

def create_app(config_class=None):
    """Application factory for the Flask backend."""
    app = Flask(__name__)

    if config_class is None:
        env = os.getenv('FLASK_ENV', 'development')
        if env == 'testing':
            from app.config import TestingConfig
            app.config.from_object(TestingConfig)
        elif env == 'production':
            from app.config import ProductionConfig
            app.config.from_object(ProductionConfig)
        else:
            app.config.from_object(DevelopmentConfig)
    else:
        app.config.from_object(config_class)

    # Initialize CORS
    CORS(
        app,
        origins=app.config.get('CORS_ORIGINS', ['http://localhost:5173', 'http://127.0.0.1:5173']),
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization', 'X-Admin-Provision-Key']
    )

    # Initialize MongoDB Connection
    DatabaseManager.init_app(app)

    # Register Blueprints for /api/v1/* (versioned for frontend compatibility)
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(rbac_bp)
    app.register_blueprint(resources_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(bookmarks_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(privacy_bp)
    app.register_blueprint(admin_bp)

    # Register Blueprints for /api/* (unversioned for general REST clients)
    app.register_blueprint(auth_bp, url_prefix='/api/auth', name='auth_unversioned')
    app.register_blueprint(users_bp, url_prefix='/api/users', name='users_unversioned')
    app.register_blueprint(resources_bp, url_prefix='/api/resources', name='resources_unversioned')
    app.register_blueprint(events_bp, url_prefix='/api/events', name='events_unversioned')
    app.register_blueprint(services_bp, url_prefix='/api/services', name='services_unversioned')
    app.register_blueprint(bookmarks_bp, url_prefix='/api/bookmarks', name='bookmarks_unversioned')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations', name='recommendations_unversioned')
    app.register_blueprint(privacy_bp, url_prefix='/api/privacy', name='privacy_unversioned')
    app.register_blueprint(admin_bp, url_prefix='/api/admin', name='admin_unversioned')

    # Register RFC 7807 Error Handlers
    register_error_handlers(app)

    # Healthcheck Route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Secure University Recommender API',
            'database': 'in-memory-mongomock' if DatabaseManager.is_mock() else 'connected-mongodb',
            'version': '1.0.0'
        }), 200

    logger.info("Flask application initialized successfully.")
    return app

