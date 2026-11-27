import logging
import pymongo
import mongomock

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages MongoDB connections with automatic fallback to mongomock for local development."""
    _client = None
    _db = None
    _is_mock = False

    @classmethod
    def init_app(cls, app):
        config = app.config
        use_mock = config.get('USE_MOCK_DB', False) or config.get('TESTING', False)

        if not use_mock:
            try:
                uri = config.get('MONGO_URI', 'mongodb://localhost:27017/university_recommender')
                client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=1500)
                # Verify live connectivity
                client.admin.command('ping')
                cls._client = client
                cls._db = client[config.get('MONGO_DB_NAME', 'university_recommender')]
                cls._is_mock = False
                logger.info("Successfully connected to live MongoDB cluster.")
            except Exception as e:
                logger.warning(f"Could not connect to live MongoDB ({e}). Falling back to in-memory mongomock.")
                cls._init_mock(config)
        else:
            cls._init_mock(config)

        # Setup indexes on collections
        cls._setup_indexes()

        # Seed initial authentic dataset if empty
        from app.core.seeder import seed_database
        seed_database(cls._db)

    @classmethod
    def _init_mock(cls, config):
        cls._client = mongomock.MongoClient()
        cls._db = cls._client[config.get('MONGO_DB_NAME', 'university_recommender')]
        cls._is_mock = True
        logger.info("Initialized in-memory mongomock database instance.")

    @classmethod
    def _setup_indexes(cls):
        """Ensure unique constraints and query indexes on MongoDB collections."""
        try:
            users_col = cls._db['users']
            users_col.create_index([("email", pymongo.ASCENDING)], unique=True)
            users_col.create_index([("role", pymongo.ASCENDING)])
            users_col.create_index([("account_status", pymongo.ASCENDING)])

            # Resources indexes
            resources_col = cls._db['resources']
            resources_col.create_index([("category", pymongo.ASCENDING)])
            resources_col.create_index([("department", pymongo.ASCENDING)])
            resources_col.create_index([("status", pymongo.ASCENDING)])
            resources_col.create_index([("created_at", pymongo.DESCENDING)])

            # Events indexes
            events_col = cls._db['events']
            events_col.create_index([("date", pymongo.ASCENDING)])
            events_col.create_index([("category", pymongo.ASCENDING)])
            events_col.create_index([("status", pymongo.ASCENDING)])

            # Services indexes
            services_col = cls._db['services']
            services_col.create_index([("category", pymongo.ASCENDING)])
            services_col.create_index([("is_active", pymongo.ASCENDING)])

            # Recommendations indexes
            recs_col = cls._db['recommendations']
            recs_col.create_index([("user_id", pymongo.ASCENDING), ("timestamp", pymongo.DESCENDING)])
            recs_col.create_index([("item_id", pymongo.ASCENDING)])

            # Privacy operations indexes
            privacy_ops_col = cls._db['privacy_operations']
            privacy_ops_col.create_index([("timestamp", pymongo.DESCENDING)])
            privacy_ops_col.create_index([("operation_type", pymongo.ASCENDING)])
            privacy_ops_col.create_index([("user_id", pymongo.ASCENDING)])

            bookmarks_col = cls._db['bookmarks']
            bookmarks_col.create_index([("user_id", pymongo.ASCENDING), ("item_id", pymongo.ASCENDING)], unique=True)

            feedback_col = cls._db['recommendation_feedback']
            feedback_col.create_index([("user_id", pymongo.ASCENDING), ("timestamp", pymongo.DESCENDING)])

            audit_col = cls._db['audit_logs']
            audit_col.create_index([("timestamp", pymongo.DESCENDING)])
            audit_col.create_index([("action", pymongo.ASCENDING)])
            audit_col.create_index([("admin_email", pymongo.ASCENDING)])

            logger.info("MongoDB indexes verified on all active collections.")
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")

    @classmethod
    def get_db(cls):
        if cls._db is None:
            raise RuntimeError("DatabaseManager has not been initialized. Call init_app() first.")
        return cls._db

    @classmethod
    def is_mock(cls):
        return cls._is_mock

