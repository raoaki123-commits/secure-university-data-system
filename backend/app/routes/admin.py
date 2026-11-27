from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.db_models import (
    User, Resource, Event, Service, RecommendationFeedback, AuditLog
)
from app.schemas.catalog import (
    ResourceCreate, ResourceUpdate, EventCreate, EventUpdate,
    ServiceCreate, ServiceUpdate
)
from app.schemas.admin import (
    UserStatusUpdate, UserRoleUpdate, ResourceStatusUpdate, ServiceStatusUpdate
)
from app.services.catalog_service import CatalogService
from app.services.recommendation_service import RecommendationService
from app.services.audit_service import AuditService
from app.services.encryption_service import HomomorphicEncryptionService
from app.services.mpc_service import MPCService
from app.security.jwt import get_current_user, roles_required

router = APIRouter(tags=["Admin Control Center"])


@router.get("/stats", status_code=status.HTTP_200_OK)
def get_admin_stats(
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    """Aggregate high-level platform health, user tallies, catalog counts, and audit feeds."""
    users = db.query(User).all()
    total_users = len(users)
    students = sum(1 for u in users if u.role == "student")
    faculty = sum(1 for u in users if u.role == "faculty")
    staff = sum(1 for u in users if u.role == "staff")
    admins = sum(1 for u in users if u.role == "admin")
    active_users = sum(1 for u in users if u.account_status != "suspended" and u.is_active)
    suspended_users = total_users - active_users

    res_total = db.query(Resource).count()
    res_pending = db.query(Resource).filter(Resource.status == "Pending").count()

    evt_total = db.query(Event).count()
    evt_pending = db.query(Event).filter(Event.status == "Pending").count()

    srv_total = db.query(Service).count()
    srv_active = db.query(Service).filter(Service.is_active == True).count()

    total_feedback = db.query(RecommendationFeedback).count()
    recent_logs = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(8).all()

    return {
        "status": 200,
        "stats": {
            "users": {
                "total": total_users,
                "students": students,
                "faculty": faculty,
                "staff": staff,
                "admins": admins,
                "active": active_users,
                "suspended": suspended_users
            },
            "resources": {
                "total": res_total,
                "pending_approval": res_pending
            },
            "events": {
                "total": evt_total,
                "pending_approval": evt_pending
            },
            "services": {
                "total": srv_total,
                "active": srv_active
            },
            "recommendations": {
                "total_feedback_events": total_feedback
            },
            "pending_approval_total": res_pending + evt_pending,
            "recent_activities": [l.to_dict() for l in recent_logs]
        }
    }


# --- User Management ---
@router.get("/users", status_code=status.HTTP_200_OK)
def list_admin_users(
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    """List registered users with status, role, and search filters."""
    query = db.query(User)

    if role and role.lower() != "all":
        query = query.filter(User.role == role.lower())
    if status and status.lower() != "all":
        query = query.filter(User.account_status == status.lower())
    if department and department.lower() != "all":
        query = query.filter(User.department.ilike(f"%{department}%"))
    if search:
        search_term = f"%{search}%"
        query = query.filter((User.name.ilike(search_term)) | (User.email.ilike(search_term)))

    total = query.count()
    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()

    return {
        "status": 200,
        "total": total,
        "limit": limit,
        "skip": skip,
        "users": [u.to_dict() for u in users]
    }


@router.get("/users/{user_id}", status_code=status.HTTP_200_OK)
def get_user_details(
    user_id: str,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": 200, "user": user.to_dict()}


@router.patch("/users/{user_id}/status", status_code=status.HTTP_200_OK)
def update_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_st = payload.status.lower()
    if new_st not in ("active", "suspended"):
        raise HTTPException(status_code=400, detail="Status must be 'active' or 'suspended'.")

    user.account_status = new_st
    user.is_active = (new_st == "active")
    user.updated_at = datetime.now(timezone.utc)
    if new_st == "suspended":
        user.token_version += 1  # Invalidate active sessions immediately

    AuditService.log_action(
        action=f"USER_STATUS_CHANGE_{new_st.upper()}",
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        target_id=user.id,
        target_type="User",
        details={"previous_status": user.account_status, "new_status": new_st},
        db=db
    )
    db.commit()

    return {
        "status": 200,
        "message": f"User account status changed to {new_st}.",
        "account_status": new_st
    }


@router.patch("/users/{user_id}/role", status_code=status.HTTP_200_OK)
def update_user_role(
    user_id: str,
    payload: UserRoleUpdate,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_role = payload.role.lower()
    if new_role not in ("student", "faculty", "staff", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    prev_role = user.role
    user.role = new_role
    user.token_version += 1
    user.updated_at = datetime.now(timezone.utc)

    AuditService.log_action(
        action="USER_ROLE_ELEVATION" if new_role == "admin" else "USER_ROLE_CHANGE",
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        target_id=user.id,
        target_type="User",
        details={"previous_role": prev_role, "new_role": new_role},
        db=db
    )
    db.commit()

    return {
        "status": 200,
        "message": f"User role successfully updated to {new_role}.",
        "role": new_role
    }


# --- Resource Admin ---
@router.get("/resources", status_code=status.HTTP_200_OK)
def list_admin_resources(
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    resources = db.query(Resource).order_by(desc(Resource.created_at)).all()
    return {
        "status": 200,
        "count": len(resources),
        "resources": [r.to_dict() for r in resources]
    }


@router.post("/resources", status_code=status.HTTP_201_CREATED)
def create_admin_resource(
    payload: ResourceCreate,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    created = CatalogService.create_resource(db, payload.model_dump())
    AuditService.log_action(
        action="RESOURCE_CREATE",
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        target_id=created["id"],
        target_type="Resource",
        details={"title": created["title"]},
        db=db
    )
    return {
        "status": 201,
        "message": "Academic resource created successfully.",
        "resource": created
    }


@router.put("/resources/{resource_id}", status_code=status.HTTP_200_OK)
def update_admin_resource(
    resource_id: str,
    payload: ResourceUpdate,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    updated = CatalogService.update_resource(db, resource_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found")

    AuditService.log_action(
        action="RESOURCE_UPDATE",
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        target_id=resource_id,
        target_type="Resource",
        details={"updated_fields": list(payload.model_dump(exclude_unset=True).keys())},
        db=db
    )
    return {
        "status": 200,
        "message": "Resource updated successfully.",
        "resource": updated
    }


@router.delete("/resources/{resource_id}", status_code=status.HTTP_200_OK)
def delete_admin_resource(
    resource_id: str,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    deleted = CatalogService.delete_resource(db, resource_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Resource not found")

    AuditService.log_action(
        action="RESOURCE_DELETE",
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        target_id=resource_id,
        target_type="Resource",
        db=db
    )
    return {"status": 200, "message": "Resource deleted successfully."}


@router.patch("/resources/{resource_id}/status", status_code=status.HTTP_200_OK)
def update_resource_status(
    resource_id: str,
    payload: ResourceStatusUpdate,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    updated = CatalogService.update_resource(db, resource_id, {"status": payload.status})
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found")

    return {
        "status": 200,
        "message": f"Resource status changed to {payload.status}.",
        "new_status": payload.status
    }


# --- Event Admin ---
@router.get("/events", status_code=status.HTTP_200_OK)
def list_admin_events(
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    events = db.query(Event).order_by(desc(Event.created_at)).all()
    return {
        "status": 200,
        "count": len(events),
        "events": [e.to_dict() for e in events]
    }


@router.post("/events", status_code=status.HTTP_201_CREATED)
def create_admin_event(
    payload: EventCreate,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    created = CatalogService.create_event(db, payload.model_dump())
    return {
        "status": 201,
        "message": "Campus event created successfully.",
        "event": created
    }


@router.put("/events/{event_id}", status_code=status.HTTP_200_OK)
def update_admin_event(
    event_id: str,
    payload: EventUpdate,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    updated = CatalogService.update_event(db, event_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"status": 200, "message": "Event updated successfully.", "event": updated}


@router.delete("/events/{event_id}", status_code=status.HTTP_200_OK)
def delete_admin_event(
    event_id: str,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    deleted = CatalogService.delete_event(db, event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"status": 200, "message": "Event deleted successfully."}


# --- Services Admin ---
@router.get("/services", status_code=status.HTTP_200_OK)
def list_admin_services(
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    services = db.query(Service).order_by(desc(Service.created_at)).all()
    return {
        "status": 200,
        "count": len(services),
        "services": [s.to_dict() for s in services]
    }


@router.post("/services", status_code=status.HTTP_201_CREATED)
def create_admin_service(
    payload: ServiceCreate,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    created = CatalogService.create_service(db, payload.model_dump())
    return {
        "status": 201,
        "message": "Support service created successfully.",
        "service": created
    }


@router.put("/services/{service_id}", status_code=status.HTTP_200_OK)
def update_admin_service(
    service_id: str,
    payload: ServiceUpdate,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    updated = CatalogService.update_service(db, service_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"status": 200, "message": "Service updated successfully.", "service": updated}


@router.delete("/services/{service_id}", status_code=status.HTTP_200_OK)
def delete_admin_service(
    service_id: str,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    deleted = CatalogService.delete_service(db, service_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"status": 200, "message": "Service deleted successfully."}


@router.patch("/services/{service_id}/status", status_code=status.HTTP_200_OK)
def update_service_status(
    service_id: str,
    payload: ServiceStatusUpdate,
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    updated = CatalogService.update_service(db, service_id, {"is_active": payload.is_active})
    if not updated:
        raise HTTPException(status_code=404, detail="Service not found")
    return {
        "status": 200,
        "message": f"Service active state set to {payload.is_active}.",
        "is_active": payload.is_active
    }


# --- Security Center Status ---
@router.get("/security/status", status_code=status.HTTP_200_OK)
def get_security_center_status(
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    """Retrieve security enclave configuration, cryptographic schemes, and recent audit events."""
    recent_logs = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(10).all()

    he_status = HomomorphicEncryptionService.get_status()
    mpc_status = MPCService.get_status()

    security_status = {
        "authentication": {
            "algorithm": "Argon2id ($argon2id$v=19$m=65536,t=3,p=4)",
            "parameters": {
                "memory_cost": "65536 KB (64 MB)",
                "time_cost": 3,
                "parallelism": 4,
                "salt_length": "16 bytes"
            },
            "status": "OPERATIONAL"
        },
        "session_tokens": {
            "type": "Cryptographic JWT (HMAC-SHA256)",
            "access_expiry": "15 minutes",
            "refresh_expiry": "7 days",
            "rotation_enforcement": "Active (token_version increment on logout/password change)",
            "status": "ACTIVE"
        },
        "homomorphic_encryption": he_status,
        "multi_party_computation": mpc_status,
        "access_control": {
            "rbac_enforced_backend": True,
            "roles_registered": ["student", "faculty", "staff", "admin"],
            "admin_provision_safeguard": "X-Admin-Provision-Key Header Enforced"
        },
        "recent_security_events": [l.to_dict() for l in recent_logs]
    }

    return {
        "status": 200,
        "security_status": security_status
    }


# --- Recommendation Monitoring ---
@router.get("/recommendations/monitoring", status_code=status.HTTP_200_OK)
def get_recommendation_monitoring(
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    """Monitor live recommendation engagement and quality metrics."""
    data = RecommendationService.get_monitoring_stats(db)
    return {
        "status": 200,
        "monitoring": data
    }


# --- Audit Logs ---
@router.get("/audit-logs", status_code=status.HTTP_200_OK)
def get_admin_audit_logs(
    action: Optional[str] = Query(None),
    admin_email: Optional[str] = Query(None),
    target_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_admin: User = Depends(roles_required(["admin"])),
    db: Session = Depends(get_db)
):
    """Retrieve immutable security audit trail."""
    logs, total = AuditService.get_logs(
        db, action=action, admin_email=admin_email, target_type=target_type, limit=limit, skip=skip
    )
    return {
        "status": 200,
        "total": total,
        "limit": limit,
        "skip": skip,
        "logs": logs
    }
