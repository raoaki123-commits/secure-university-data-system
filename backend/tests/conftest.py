import pytest
from app import create_app
from app.config import TestingConfig
from app.core.database import DatabaseManager

@pytest.fixture
def app():
    """Create testing application with mocked in-memory database."""
    test_app = create_app(TestingConfig)
    yield test_app

@pytest.fixture
def client(app):
    """Test HTTP client."""
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()

@pytest.fixture(autouse=True)
def clean_db(app):
    """Clean transient MongoDB collections before each test and ensure catalog is seeded."""
    db = DatabaseManager.get_db()
    for col_name in ('users', 'bookmarks', 'recommendation_feedback', 'recommendations', 'privacy_preferences', 'privacy_operations', 'audit_logs'):
        if col_name in db.list_collection_names():
            db[col_name].delete_many({})
    
    # Ensure catalogs remain seeded for test runs
    from app.core.seeder import seed_database
    seed_database(db)
    yield

