"""
Production WSGI Entrypoint for Gunicorn / uWSGI / Waitress.
Usage:
    gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
"""
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.config import ProductionConfig, Config

# Select configuration based on FLASK_ENV
env = os.getenv('FLASK_ENV', 'production').lower()
if env == 'production':
    try:
        ProductionConfig.validate_production_secrets()
    except ValueError as e:
        import logging
        logging.getLogger("production").warning(f"Production Configuration Warning: {e}")
    config_class = ProductionConfig
else:
    config_class = Config

app = create_app(config_class)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

