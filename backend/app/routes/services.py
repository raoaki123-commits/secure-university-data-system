from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.catalog_service import CatalogService

router = APIRouter(tags=["University Services"])


@router.get("", status_code=status.HTTP_200_OK)
@router.get("/", status_code=status.HTTP_200_OK)
def get_services(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """List active student support, accessibility, and counseling services."""
    services, total = CatalogService.get_services(
        db, category=category, search=search, limit=limit, skip=skip
    )
    return {
        "status": 200,
        "total": total,
        "count": len(services),
        "services": services
    }


@router.get("/{service_id}", status_code=status.HTTP_200_OK)
def get_service(service_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a specific university support service."""
    service = CatalogService.get_service_by_id(db, service_id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return {
        "status": 200,
        "service": service
    }
