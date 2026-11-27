from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

class ServiceModel:
    """Document schema and transformation for the 'services' MongoDB collection."""

    @staticmethod
    def create_document(
        name: str,
        description: str,
        category: str = 'Student Support',
        contact_email: str = 'support@university.edu',
        location: str = 'Student Center',
        hours: str = 'Mon-Fri: 09:00 - 17:00',
        confidentiality_tier: str = 'Standard Academic',
        is_active: bool = True,
        tags: Optional[List[str]] = None,
        created_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """Construct a validated service document."""
        now = datetime.now(timezone.utc).isoformat()
        srv_id = f"srv_{int(datetime.now(timezone.utc).timestamp() * 1000)}"
        return {
            '_id': srv_id,
            'id': srv_id,
            'name': name.strip(),
            'description': description.strip(),
            'category': category.strip(),
            'contact_email': contact_email.strip(),
            'location': location.strip(),
            'hours': hours.strip(),
            'confidentiality_tier': confidentiality_tier.strip(),
            'is_active': bool(is_active),
            'tags': tags or ['Support'],
            'created_by': created_by,
            'created_at': now,
            'updated_at': now
        }

    @staticmethod
    def to_dict(doc: Dict[str, Any]) -> Dict[str, Any]:
        """Format service document for API response."""
        srv_id = str(doc.get('_id', doc.get('id', '')))
        created = doc.get('created_at')
        if isinstance(created, datetime):
            created = created.isoformat()
        updated = doc.get('updated_at')
        if isinstance(updated, datetime):
            updated = updated.isoformat()

        return {
            'id': srv_id,
            'name': doc.get('name', ''),
            'description': doc.get('description', ''),
            'category': doc.get('category', 'Support'),
            'contact_email': doc.get('contact_email', ''),
            'location': doc.get('location', ''),
            'hours': doc.get('hours', ''),
            'confidentiality_tier': doc.get('confidentiality_tier', 'Standard FERPA'),
            'is_active': doc.get('is_active', True),
            'tags': doc.get('tags', []),
            'created_by': doc.get('created_by'),
            'created_at': created,
            'updated_at': updated
        }
