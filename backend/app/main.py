import os
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, HTMLResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal, get_db_path, get_db
from app.core.seeder_sqlite import seed_sqlite_database
from app.core.key_manager import CryptographicKeyManager
from app.routes.auth import router as auth_router
from app.routes.resources import router as resources_router
from app.routes.events import router as events_router
from app.routes.services import router as services_router
from app.routes.bookmarks import router as bookmarks_router
from app.routes.recommendations import router as recommendations_router
from app.routes.privacy import router as privacy_router
from app.routes.admin import router as admin_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("recommender_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events: initialize SQLite database, seed tables, and verify crypto keys."""
    logger.info("Initializing Secure University Recommender SQLite Database...")
    Base.metadata.create_all(bind=engine)

    # Seed demonstration dataset and sync to database/*.json
    db = SessionLocal()
    try:
        seed_sqlite_database(db)
        from app.services.database_sync_service import DatabaseSyncService
        counts = DatabaseSyncService.sync_to_json_files(db)
        logger.info(f"Database synced to readable files in /database: {counts}")
    except Exception as e:
        logger.error(f"Error during database seeding/sync: {e}")
    finally:
        db.close()

    # Initialize Homomorphic Encryption Keystore (CKKS)
    try:
        km = CryptographicKeyManager.get_instance()
        km.get_public_context()
        logger.info("Cryptographic key manager verified.")
    except Exception as e:
        logger.warning(f"Key manager initialization notice: {e}")

    logger.info(f"FastAPI Server ready! Database active at: {get_db_path()}")
    yield
    logger.info("FastAPI Server shutting down.")


app = FastAPI(
    title="Secure Resource Recommendation System for University Communities",
    description="Privacy-Preserving Campus Discovery Platform using FastAPI, SQLite, and Homomorphic Encryption",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": exc.status_code,
            "error": "HTTP Error",
            "message": exc.detail
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = errors[0].get("msg") if errors else "Request validation error"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": 422,
            "error": "Validation Error",
            "message": f"Invalid request body: {msg}",
            "details": errors
        }
    )


# Healthcheck Endpoint
@app.get("/api/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Secure University Recommender FastAPI Engine",
        "version": "2.0.0",
        "database": "SQLite (data/university_system.db)",
        "docs_url": "/docs"
    }


# Silent Handlers for Injected Browser Extension Telemetry
@app.get("/hybridaction/{action_name:path}", include_in_schema=False)
@app.post("/hybridaction/{action_name:path}", include_in_schema=False)
async def handle_hybrid_extension_action(action_name: str, request: Request):
    """
    Handle client-side browser extension telemetry (e.g., ZYB tracker / translation / downloader plugins)
    that poll /hybridaction/zybTrackerStatisticsAction. Returns 200 OK JSONP to silence 404 errors.
    """
    callback = request.query_params.get("__callback__")
    if callback:
        return Response(content=f"{callback}({{}});", media_type="application/javascript")
    return Response(content="{}", media_type="application/json")


# Interactive Database Explorer Endpoints for Live Teacher Demonstrations
@app.get("/database", response_class=HTMLResponse, tags=["Database Explorer"])
@app.get("/api/v1/database/viewer", response_class=HTMLResponse, tags=["Database Explorer"])
def database_viewer(db: Session = Depends(get_db)):
    """Interactive visual browser-based database explorer for teachers."""
    from app.services.database_sync_service import DatabaseSyncService
    data = DatabaseSyncService.get_all_records(db)
    DatabaseSyncService.generate_html_viewer(data)
    viewer_file = Path(__file__).resolve().parent.parent.parent / "database" / "DATABASE_VIEWER.html"
    if viewer_file.exists():
        return HTMLResponse(content=viewer_file.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Database Viewer Active</h1><p>Open /database/*.json to view tables.</p>")


@app.get("/api/v1/database/records", tags=["Database Explorer"])
def get_all_database_records(db: Session = Depends(get_db)):
    """Retrieve all stored database tables as clean JSON records."""
    from app.services.database_sync_service import DatabaseSyncService
    return DatabaseSyncService.get_all_records(db)


# Mount Routers under /api/v1/* (versioned for frontend compatibility)
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(resources_router, prefix="/api/v1/resources")
app.include_router(events_router, prefix="/api/v1/events")
app.include_router(services_router, prefix="/api/v1/services")
app.include_router(bookmarks_router, prefix="/api/v1/bookmarks")
app.include_router(recommendations_router, prefix="/api/v1/recommendations")
app.include_router(privacy_router, prefix="/api/v1/privacy")
app.include_router(admin_router, prefix="/api/v1/admin")

# Mount Routers under /api/* (unversioned aliases for general REST clients)
app.include_router(auth_router, prefix="/api/auth", include_in_schema=False)
app.include_router(resources_router, prefix="/api/resources", include_in_schema=False)
app.include_router(events_router, prefix="/api/events", include_in_schema=False)
app.include_router(services_router, prefix="/api/services", include_in_schema=False)
app.include_router(bookmarks_router, prefix="/api/bookmarks", include_in_schema=False)
app.include_router(recommendations_router, prefix="/api/recommendations", include_in_schema=False)
app.include_router(privacy_router, prefix="/api/privacy", include_in_schema=False)
app.include_router(admin_router, prefix="/api/admin", include_in_schema=False)
