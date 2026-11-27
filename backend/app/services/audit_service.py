import json
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import SessionLocal
from app.models.db_models import AuditLog

logger = logging.getLogger(__name__)


class AuditService:
    """Service to record and query immutable administrative and security audit logs using SQLite."""

    @staticmethod
    def log_action(
        action: str,
        admin_id: str,
        admin_email: str,
        target_id: Optional[str] = None,
        target_type: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        status: str = "success",
        ip_address: Optional[str] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """Record an administrative or security audit log in SQLite."""
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            log_id = f"audit_{uuid.uuid4().hex[:10]}"
            now = datetime.now(timezone.utc)
            detail_dict = details or {}
            if status != "success":
                detail_dict["status"] = status

            new_log = AuditLog(
                id=log_id,
                action=action,
                admin_id=str(admin_id or "system"),
                admin_email=admin_email or "system",
                target_id=str(target_id) if target_id else None,
                target_type=target_type,
                details_json=json.dumps(detail_dict),
                ip_address=ip_address or "127.0.0.1",
                timestamp=now
            )
            db.add(new_log)
            db.commit()
            db.refresh(new_log)
            logger.info(f"Audit log recorded: {action} by {admin_email} on {target_type}:{target_id}")
            return new_log.to_dict()
        except Exception as e:
            logger.error(f"Failed to record audit log: {e}")
            return {}
        finally:
            if close_session:
                db.close()

    @staticmethod
    def get_logs(
        db: Session,
        action: Optional[str] = None,
        admin_email: Optional[str] = None,
        target_type: Optional[str] = None,
        limit: int = 50,
        skip: int = 0
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Query paginated audit logs with optional filters."""
        query = db.query(AuditLog)

        if action and action != "all":
            query = query.filter(AuditLog.action == action)
        if admin_email:
            query = query.filter(AuditLog.admin_email.ilike(f"%{admin_email}%"))
        if target_type and target_type != "all":
            query = query.filter(AuditLog.target_type == target_type)

        total = query.count()
        logs = query.order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit).all()
        return [l.to_dict() for l in logs], total
