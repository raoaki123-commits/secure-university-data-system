from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db_models import User
from app.schemas.catalog import BookmarkCreate
from app.services.catalog_service import CatalogService
from app.security.jwt import get_current_user

router = APIRouter(tags=["User Bookmarks"])


@router.get("", status_code=status.HTTP_200_OK)
@router.get("/", status_code=status.HTTP_200_OK)
def get_bookmarks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all saved bookmarks for the current authenticated user."""
    bookmarks = CatalogService.get_user_bookmarks(db, current_user.id)
    return {
        "status": 200,
        "count": len(bookmarks),
        "bookmarks": bookmarks
    }


@router.post("", status_code=status.HTTP_200_OK)
@router.post("/", status_code=status.HTTP_200_OK)
def toggle_bookmark(
    payload: BookmarkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or un-save an academic item from the user's personal vault."""
    res = CatalogService.toggle_bookmark(
        db,
        user_id=current_user.id,
        item_id=payload.item_id,
        item_type=payload.item_type,
        snapshot=payload.item_snapshot
    )
    return {
        "status": 200,
        **res
    }


@router.delete("/{item_id}", status_code=status.HTTP_200_OK)
def delete_bookmark(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove an item from saved bookmarks by item ID."""
    deleted = CatalogService.delete_bookmark(db, current_user.id, item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found")
    return {
        "status": 200,
        "message": "Bookmark removed successfully."
    }
