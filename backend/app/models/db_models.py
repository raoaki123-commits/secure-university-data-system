import json
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), default="student", index=True, nullable=False)  # student, faculty, staff, admin
    department = Column(String(128), default="")
    account_status = Column(String(32), default="active", index=True)  # active, suspended
    is_active = Column(Boolean, default=True)
    token_version = Column(Integer, default=1)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    last_login = Column(DateTime, nullable=True)

    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("RecommendationFeedback", back_populates="user", cascade="all, delete-orphan")
    privacy_pref = relationship("PrivacyPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "full_name": self.name,
            "email": self.email,
            "role": self.role.lower(),
            "department": self.department or "",
            "account_status": self.account_status,
            "is_active": self.account_status != "suspended" and self.is_active,
            "token_version": self.token_version,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    category = Column(String(64), index=True, default="general")
    department = Column(String(128), index=True, default="")
    author_or_source = Column(String(255), default="")
    tags_json = Column(Text, default="[]")
    format = Column(String(64), default="PDF Document")
    access_level = Column(String(64), default="Public")
    rating = Column(Float, default=4.5)
    saves_count = Column(Integer, default=0)
    url = Column(String(512), default="")
    status = Column(String(32), default="Approved", index=True)  # Approved, Pending, Archived
    created_at = Column(DateTime, default=utc_now)

    def get_tags(self):
        try:
            return json.loads(self.tags_json) if self.tags_json else []
        except Exception:
            return []

    def set_tags(self, tags_list):
        self.tags_json = json.dumps(tags_list if isinstance(tags_list, list) else [])

    def to_dict(self):
        return {
            "id": self.id,
            "_id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "department": self.department,
            "author_or_source": self.author_or_source,
            "tags": self.get_tags(),
            "format": self.format,
            "access_level": self.access_level,
            "rating": round(float(self.rating or 0.0), 2),
            "saves_count": int(self.saves_count or 0),
            "url": self.url,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Event(Base):
    __tablename__ = "events"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    category = Column(String(64), index=True, default="General")
    department_or_host = Column(String(128), index=True, default="")
    date = Column(String(32), default="")
    time = Column(String(64), default="")
    location = Column(String(255), default="")
    is_virtual = Column(Boolean, default=False)
    registration_required = Column(Boolean, default=False)
    registration_deadline = Column(String(32), default="")
    tags_json = Column(Text, default="[]")
    attendees_count = Column(Integer, default=0)
    status = Column(String(32), default="Approved", index=True)
    created_at = Column(DateTime, default=utc_now)

    def get_tags(self):
        try:
            return json.loads(self.tags_json) if self.tags_json else []
        except Exception:
            return []

    def set_tags(self, tags_list):
        self.tags_json = json.dumps(tags_list if isinstance(tags_list, list) else [])

    def to_dict(self):
        return {
            "id": self.id,
            "_id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "department_or_host": self.department_or_host,
            "date": self.date,
            "time": self.time,
            "location": self.location,
            "is_virtual": bool(self.is_virtual),
            "registration_required": bool(self.registration_required),
            "registration_deadline": self.registration_deadline,
            "tags": self.get_tags(),
            "attendees_count": int(self.attendees_count or 0),
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Service(Base):
    __tablename__ = "services"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    category = Column(String(64), index=True, default="Student Support")
    contact_email = Column(String(255), default="")
    location = Column(String(255), default="")
    hours = Column(String(128), default="")
    confidentiality_tier = Column(String(64), default="Standard FERPA")
    is_active = Column(Boolean, default=True, index=True)
    tags_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=utc_now)

    def get_tags(self):
        try:
            return json.loads(self.tags_json) if self.tags_json else []
        except Exception:
            return []

    def set_tags(self, tags_list):
        self.tags_json = json.dumps(tags_list if isinstance(tags_list, list) else [])

    def to_dict(self):
        return {
            "id": self.id,
            "_id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "contact_email": self.contact_email,
            "location": self.location,
            "hours": self.hours,
            "confidentiality_tier": self.confidentiality_tier,
            "is_active": bool(self.is_active),
            "tags": self.get_tags(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    item_id = Column(String(64), index=True, nullable=False)
    item_type = Column(String(32), default="resource")  # resource, event, service
    title = Column(String(255), default="")
    category = Column(String(64), default="")
    department = Column(String(128), default="")
    saved_at = Column(DateTime, default=utc_now)
    metadata_json = Column(Text, default="{}")

    user = relationship("User", back_populates="bookmarks")

    __table_args__ = (
        Index("idx_user_item_unique", "user_id", "item_id", unique=True),
    )

    def get_metadata(self):
        try:
            return json.loads(self.metadata_json) if self.metadata_json else {}
        except Exception:
            return {}

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "item_id": self.item_id,
            "item_type": self.item_type,
            "title": self.title,
            "category": self.category,
            "department": self.department,
            "saved_at": self.saved_at.isoformat() if self.saved_at else None,
            "metadata": self.get_metadata()
        }


class RecommendationFeedback(Base):
    __tablename__ = "recommendation_feedback"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    item_id = Column(String(64), index=True, nullable=False)
    item_type = Column(String(32), default="resource")
    title = Column(String(255), default="")
    category = Column(String(64), default="")
    feedback = Column(String(32), nullable=False)  # useful, not_relevant, saved
    timestamp = Column(DateTime, default=utc_now, index=True)

    user = relationship("User", back_populates="feedbacks")

    def to_dict(self):
        return {
            "id": self.id,
            "item_id": self.item_id,
            "item_type": self.item_type,
            "title": self.title,
            "category": self.category,
            "feedback": self.feedback,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }


class PrivacyPreference(Base):
    __tablename__ = "privacy_preferences"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), unique=True, index=True, nullable=False)
    share_department_with_recommender = Column(Boolean, default=True)
    collect_interaction_history = Column(Boolean, default=True)
    homomorphic_noise_scale = Column(Float, default=0.05)
    differential_privacy_epsilon = Column(Float, default=0.5)
    zero_knowledge_audit_logging = Column(Boolean, default=True)
    anonymize_bookmarks = Column(Boolean, default=True)
    last_consent_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="privacy_pref")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "share_department_with_recommender": bool(self.share_department_with_recommender),
            "collect_interaction_history": bool(self.collect_interaction_history),
            "homomorphic_noise_scale": float(self.homomorphic_noise_scale or 0.05),
            "differential_privacy_epsilon": float(self.differential_privacy_epsilon or 0.5),
            "zero_knowledge_audit_logging": bool(self.zero_knowledge_audit_logging),
            "anonymize_bookmarks": bool(self.anonymize_bookmarks),
            "last_consent_at": self.last_consent_at.isoformat() if self.last_consent_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PrivacyOperation(Base):
    __tablename__ = "privacy_operations"

    id = Column(String(64), primary_key=True, index=True)
    operation_type = Column(String(64), index=True, nullable=False)
    user_id = Column(String(64), nullable=True, index=True)
    algorithm = Column(String(128), default="CKKS")
    parameters_json = Column(Text, default="{}")
    computation_time_ms = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=utc_now, index=True)

    def to_dict(self):
        params = {}
        try:
            params = json.loads(self.parameters_json) if self.parameters_json else {}
        except Exception:
            pass

        return {
            "id": self.id,
            "operation_type": self.operation_type,
            "user_id": self.user_id,
            "algorithm": self.algorithm,
            "parameters": params,
            "computation_time_ms": round(float(self.computation_time_ms or 0.0), 3),
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    action = Column(String(128), index=True, nullable=False)
    admin_id = Column(String(64), default="")
    admin_email = Column(String(255), index=True, default="")
    target_id = Column(String(64), nullable=True)
    target_type = Column(String(64), nullable=True)
    details_json = Column(Text, default="{}")
    ip_address = Column(String(64), nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)

    def to_dict(self):
        details = {}
        try:
            details = json.loads(self.details_json) if self.details_json else {}
        except Exception:
            pass

        return {
            "id": self.id,
            "action": self.action,
            "admin_id": self.admin_id,
            "admin_email": self.admin_email,
            "target_id": self.target_id,
            "target_type": self.target_type,
            "details": details,
            "ip_address": self.ip_address,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
