from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.catalog_service import CatalogService

router = APIRouter(tags=["University Events"])


@router.get("", status_code=status.HTTP_200_OK)
@router.get("/", status_code=status.HTTP_200_OK)
def get_events(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    virtual_only: bool = Query(False),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """List upcoming university colloquia, hackathons, and workshops."""
    events, total = CatalogService.get_events(
        db, category=category, search=search, virtual_only=virtual_only, limit=limit, skip=skip
    )
    return {
        "status": 200,
        "total": total,
        "count": len(events),
        "events": events
    }


@router.get("/{event_id}", status_code=status.HTTP_200_OK)
def get_event(event_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a specific campus event."""
    event = CatalogService.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return {
        "status": 200,
        "event": event
    }
