import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.models.db_models import Resource, Event, Service, Bookmark, User


class CatalogService:
    """Service layer managing Academic Resources, Campus Events, Services, and Bookmarks."""

    # --- Resources ---
    @staticmethod
    def get_resources(
        db: Session,
        category: Optional[str] = None,
        department: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        limit: int = 100,
        skip: int = 0
    ) -> Tuple[List[Dict[str, Any]], int]:
        query = db.query(Resource).filter(Resource.status == "Approved")

        if category and category.lower() != "all":
            query = query.filter(Resource.category.ilike(f"%{category}%"))
        if department and department.lower() != "all":
            query = query.filter(Resource.department.ilike(f"%{department}%"))
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Resource.title.ilike(search_term),
                    Resource.description.ilike(search_term),
                    Resource.author_or_source.ilike(search_term),
                    Resource.tags_json.ilike(search_term)
                )
            )

        total = query.count()

        if sort_by == "rating":
            query = query.order_by(desc(Resource.rating))
        elif sort_by == "saves":
            query = query.order_by(desc(Resource.saves_count))
        elif sort_by == "oldest":
            query = query.order_by(asc(Resource.created_at))
        else:
            query = query.order_by(desc(Resource.created_at))

        items = query.offset(skip).limit(limit).all()
        return [r.to_dict() for r in items], total

    @staticmethod
    def get_resource_by_id(db: Session, resource_id: str) -> Optional[Dict[str, Any]]:
        res = db.query(Resource).filter(Resource.id == resource_id).first()
        return res.to_dict() if res else None

    @staticmethod
    def create_resource(db: Session, data: Dict[str, Any]) -> Dict[str, Any]:
        res_id = data.get("id") or f"res_{uuid.uuid4().hex[:8]}"
        tags = data.get("tags", [])
        now = datetime.now(timezone.utc)

        new_res = Resource(
            id=res_id,
            title=data["title"],
            description=data.get("description", ""),
            category=data.get("category", "general"),
            department=data.get("department", ""),
            author_or_source=data.get("author_or_source", ""),
            tags_json=json.dumps(tags),
            format=data.get("format", "PDF Document"),
            access_level=data.get("access_level", "Public"),
            rating=float(data.get("rating", 4.5)),
            saves_count=int(data.get("saves_count", 0)),
            url=data.get("url", ""),
            status=data.get("status", "Approved"),
            created_at=now
        )
        db.add(new_res)
        db.commit()
        db.refresh(new_res)
        return new_res.to_dict()

    @staticmethod
    def update_resource(db: Session, resource_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        res = db.query(Resource).filter(Resource.id == resource_id).first()
        if not res:
            return None

        if "title" in data and data["title"] is not None:
            res.title = data["title"]
        if "description" in data and data["description"] is not None:
            res.description = data["description"]
        if "category" in data and data["category"] is not None:
            res.category = data["category"]
        if "department" in data and data["department"] is not None:
            res.department = data["department"]
        if "author_or_source" in data and data["author_or_source"] is not None:
            res.author_or_source = data["author_or_source"]
        if "tags" in data and data["tags"] is not None:
            res.set_tags(data["tags"])
        if "format" in data and data["format"] is not None:
            res.format = data["format"]
        if "access_level" in data and data["access_level"] is not None:
            res.access_level = data["access_level"]
        if "rating" in data and data["rating"] is not None:
            res.rating = float(data["rating"])
        if "url" in data and data["url"] is not None:
            res.url = data["url"]
        if "status" in data and data["status"] is not None:
            res.status = data["status"]

        db.commit()
        db.refresh(res)
        return res.to_dict()

    @staticmethod
    def delete_resource(db: Session, resource_id: str) -> bool:
        res = db.query(Resource).filter(Resource.id == resource_id).first()
        if not res:
            return False
        db.delete(res)
        db.commit()
        return True

    # --- Events ---
    @staticmethod
    def get_events(
        db: Session,
        category: Optional[str] = None,
        search: Optional[str] = None,
        virtual_only: bool = False,
        limit: int = 100,
        skip: int = 0
    ) -> Tuple[List[Dict[str, Any]], int]:
        query = db.query(Event).filter(Event.status == "Approved")

        if category and category.lower() != "all":
            query = query.filter(Event.category.ilike(f"%{category}%"))
        if virtual_only:
            query = query.filter(Event.is_virtual == True)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Event.title.ilike(search_term),
                    Event.description.ilike(search_term),
                    Event.department_or_host.ilike(search_term),
                    Event.location.ilike(search_term),
                    Event.tags_json.ilike(search_term)
                )
            )

        total = query.count()
        items = query.order_by(asc(Event.date)).offset(skip).limit(limit).all()
        return [e.to_dict() for e in items], total

    @staticmethod
    def get_event_by_id(db: Session, event_id: str) -> Optional[Dict[str, Any]]:
        evt = db.query(Event).filter(Event.id == event_id).first()
        return evt.to_dict() if evt else None

    @staticmethod
    def create_event(db: Session, data: Dict[str, Any]) -> Dict[str, Any]:
        evt_id = data.get("id") or f"evt_{uuid.uuid4().hex[:8]}"
        tags = data.get("tags", [])
        now = datetime.now(timezone.utc)

        new_evt = Event(
            id=evt_id,
            title=data["title"],
            description=data.get("description", ""),
            category=data.get("category", "General"),
            department_or_host=data.get("department_or_host", ""),
            date=data.get("date", ""),
            time=data.get("time", ""),
            location=data.get("location", ""),
            is_virtual=bool(data.get("is_virtual", False)),
            registration_required=bool(data.get("registration_required", False)),
            registration_deadline=data.get("registration_deadline", ""),
            tags_json=json.dumps(tags),
            attendees_count=int(data.get("attendees_count", 0)),
            status=data.get("status", "Approved"),
            created_at=now
        )
        db.add(new_evt)
        db.commit()
        db.refresh(new_evt)
        return new_evt.to_dict()

    @staticmethod
    def update_event(db: Session, event_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        evt = db.query(Event).filter(Event.id == event_id).first()
        if not evt:
            return None

        for k, v in data.items():
            if v is not None:
                if k == "tags":
                    evt.set_tags(v)
                elif hasattr(evt, k):
                    setattr(evt, k, v)

        db.commit()
        db.refresh(evt)
        return evt.to_dict()

    @staticmethod
    def delete_event(db: Session, event_id: str) -> bool:
        evt = db.query(Event).filter(Event.id == event_id).first()
        if not evt:
            return False
        db.delete(evt)
        db.commit()
        return True

    # --- Services ---
    @staticmethod
    def get_services(
        db: Session,
        category: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        skip: int = 0
    ) -> Tuple[List[Dict[str, Any]], int]:
        query = db.query(Service).filter(Service.is_active == True)

        if category and category.lower() != "all":
            query = query.filter(Service.category.ilike(f"%{category}%"))
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Service.name.ilike(search_term),
                    Service.description.ilike(search_term),
                    Service.contact_email.ilike(search_term),
                    Service.location.ilike(search_term),
                    Service.tags_json.ilike(search_term)
                )
            )

        total = query.count()
        items = query.order_by(asc(Service.name)).offset(skip).limit(limit).all()
        return [s.to_dict() for s in items], total

    @staticmethod
    def get_service_by_id(db: Session, service_id: str) -> Optional[Dict[str, Any]]:
        srv = db.query(Service).filter(Service.id == service_id).first()
        return srv.to_dict() if srv else None

    @staticmethod
    def create_service(db: Session, data: Dict[str, Any]) -> Dict[str, Any]:
        srv_id = data.get("id") or f"srv_{uuid.uuid4().hex[:8]}"
        tags = data.get("tags", [])
        now = datetime.now(timezone.utc)

        new_srv = Service(
            id=srv_id,
            name=data["name"],
            description=data.get("description", ""),
            category=data.get("category", "Student Support"),
            contact_email=data.get("contact_email", ""),
            location=data.get("location", ""),
            hours=data.get("hours", ""),
            confidentiality_tier=data.get("confidentiality_tier", "Standard FERPA"),
            is_active=bool(data.get("is_active", True)),
            tags_json=json.dumps(tags),
            created_at=now
        )
        db.add(new_srv)
        db.commit()
        db.refresh(new_srv)
        return new_srv.to_dict()

    @staticmethod
    def update_service(db: Session, service_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        srv = db.query(Service).filter(Service.id == service_id).first()
        if not srv:
            return None

        for k, v in data.items():
            if v is not None:
                if k == "tags":
                    srv.set_tags(v)
                elif hasattr(srv, k):
                    setattr(srv, k, v)

        db.commit()
        db.refresh(srv)
        return srv.to_dict()

    @staticmethod
    def delete_service(db: Session, service_id: str) -> bool:
        srv = db.query(Service).filter(Service.id == service_id).first()
        if not srv:
            return False
        db.delete(srv)
        db.commit()
        return True

    # --- Bookmarks ---
    @staticmethod
    def get_user_bookmarks(db: Session, user_id: str) -> List[Dict[str, Any]]:
        bookmarks = db.query(Bookmark).filter(Bookmark.user_id == user_id).order_by(desc(Bookmark.saved_at)).all()
        return [bm.to_dict() for bm in bookmarks]

    @staticmethod
    def toggle_bookmark(
        db: Session,
        user_id: str,
        item_id: str,
        item_type: str = "resource",
        snapshot: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        existing = db.query(Bookmark).filter(
            Bookmark.user_id == user_id,
            Bookmark.item_id == item_id
        ).first()

        if existing:
            db.delete(existing)
            # Decrement saves count if resource
            if item_type == "resource":
                res = db.query(Resource).filter(Resource.id == item_id).first()
                if res and res.saves_count > 0:
                    res.saves_count -= 1
            db.commit()
            return {"action": "removed", "is_bookmarked": False, "message": "Item removed from saved bookmarks."}
        else:
            snap = snapshot or {}
            title = snap.get("title") or snap.get("name") or "Saved Academic Item"
            category = snap.get("category", "General")
            department = snap.get("department") or snap.get("department_or_host") or ""

            bm_id = f"bm_{uuid.uuid4().hex[:10]}"
            new_bm = Bookmark(
                id=bm_id,
                user_id=user_id,
                item_id=item_id,
                item_type=item_type,
                title=title,
                category=category,
                department=department,
                saved_at=datetime.now(timezone.utc),
                metadata_json=json.dumps(snap)
            )
            db.add(new_bm)

            if item_type == "resource":
                res = db.query(Resource).filter(Resource.id == item_id).first()
                if res:
                    res.saves_count += 1

            db.commit()
            return {"action": "added", "is_bookmarked": True, "message": "Item saved successfully."}

    @staticmethod
    def delete_bookmark(db: Session, user_id: str, item_id: str) -> bool:
        bm = db.query(Bookmark).filter(
            Bookmark.user_id == user_id,
            Bookmark.item_id == item_id
        ).first()
        if not bm:
            return False
        db.delete(bm)
        res = db.query(Resource).filter(Resource.id == item_id).first()
        if res and res.saves_count > 0:
            res.saves_count -= 1
        db.commit()
        return True
