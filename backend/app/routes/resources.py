from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.catalog_service import CatalogService

router = APIRouter(tags=["Academic Resources"])


@router.get("", status_code=status.HTTP_200_OK)
@router.get("/", status_code=status.HTTP_200_OK)
def get_resources(
    category: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieve catalog of academic resources with category, department, and keyword filters."""
    resources, total = CatalogService.get_resources(
        db, category=category, department=department, search=search, sort_by=sort, limit=limit, skip=skip
    )
    return {
        "status": 200,
        "total": total,
        "count": len(resources),
        "resources": resources
    }


@router.get("/{resource_id}", status_code=status.HTTP_200_OK)
def get_resource(resource_id: str, db: Session = Depends(get_db)):
    """Fetch details of an individual academic resource."""
    resource = CatalogService.get_resource_by_id(db, resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return {
        "status": 200,
        "resource": resource
    }
