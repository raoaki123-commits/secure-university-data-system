from app.routes.auth import router as auth_router
from app.routes.resources import router as resources_router
from app.routes.events import router as events_router
from app.routes.services import router as services_router
from app.routes.bookmarks import router as bookmarks_router
from app.routes.recommendations import router as recommendations_router
from app.routes.privacy import router as privacy_router
from app.routes.admin import router as admin_router

__all__ = [
    "auth_router",
    "resources_router",
    "events_router",
    "services_router",
    "bookmarks_router",
    "recommendations_router",
    "privacy_router",
    "admin_router"
]
