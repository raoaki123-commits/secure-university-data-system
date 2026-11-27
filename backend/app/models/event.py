from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

class EventModel:
    """Document schema and transformation for the 'events' MongoDB collection."""

    @staticmethod
    def create_document(
        title: str,
        description: str,
        category: str = 'Workshops',
        department_or_host: str = 'Campus Events',
        date: str = '',
        time: str = '14:00 - 16:00',
        location: str = 'Main Campus',
        is_virtual: bool = False,
        registration_required: bool = False,
        registration_deadline: Optional[str] = None,
        tags: Optional[List[str]] = None,
        status: str = 'approved',
        created_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """Construct a validated event document."""
        now = datetime.now(timezone.utc).isoformat()
        evt_id = f"evt_{int(datetime.now(timezone.utc).timestamp() * 1000)}"
        return {
            '_id': evt_id,
            'id': evt_id,
            'title': title.strip(),
            'description': description.strip(),
            'category': category.strip(),
            'department_or_host': department_or_host.strip(),
            'date': date.strip(),
            'time': time.strip(),
            'location': location.strip(),
            'is_virtual': bool(is_virtual),
            'registration_required': bool(registration_required),
            'registration_deadline': registration_deadline.strip() if registration_deadline else None,
            'tags': tags or ['Campus'],
            'status': status,
            'attendees_count': 0,
            'created_by': created_by,
            'created_at': now,
            'updated_at': now
        }

    @staticmethod
    def to_dict(doc: Dict[str, Any]) -> Dict[str, Any]:
        """Format event document for API response."""
        evt_id = str(doc.get('_id', doc.get('id', '')))
        created = doc.get('created_at')
        if isinstance(created, datetime):
            created = created.isoformat()
        updated = doc.get('updated_at')
        if isinstance(updated, datetime):
            updated = updated.isoformat()

        return {
            'id': evt_id,
            'title': doc.get('title', ''),
            'description': doc.get('description', ''),
            'category': doc.get('category', 'General'),
            'department_or_host': doc.get('department_or_host', ''),
            'date': doc.get('date', ''),
            'time': doc.get('time', ''),
            'location': doc.get('location', ''),
            'is_virtual': doc.get('is_virtual', False),
            'registration_required': doc.get('registration_required', False),
            'registration_deadline': doc.get('registration_deadline'),
            'tags': doc.get('tags', []),
            'status': doc.get('status', 'approved'),
            'attendees_count': doc.get('attendees_count', 0),
            'created_by': doc.get('created_by'),
            'created_at': created,
            'updated_at': updated
        }
