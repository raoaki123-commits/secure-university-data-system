from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

VALID_RESOURCE_STATUSES = {'approved', 'pending_approval', 'archived', 'rejected'}

class ResourceModel:
    """Document schema and transformation for the 'resources' MongoDB collection."""

    @staticmethod
    def create_document(
        title: str,
        description: str,
        category: str = 'Computer Science',
        department: str = 'Computer Science & Engineering',
        author_or_source: str = 'Academic Dept',
        tags: Optional[List[str]] = None,
        format: str = 'PDF',
        access_level: str = 'All Students',
        url: str = '',
        status: str = 'approved',
        created_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """Construct a validated MongoDB resource document."""
        now = datetime.now(timezone.utc).isoformat()
        res_id = f"res_{int(datetime.now(timezone.utc).timestamp() * 1000)}"
        return {
            '_id': res_id,
            'id': res_id,
            'title': title.strip(),
            'description': description.strip(),
            'category': category.strip(),
            'department': department.strip(),
            'author_or_source': author_or_source.strip(),
            'tags': tags or ['Academic'],
            'format': format.strip(),
            'access_level': access_level.strip(),
            'url': url.strip(),
            'status': status if status in VALID_RESOURCE_STATUSES else 'approved',
            'rating': 4.5,
            'saves_count': 0,
            'created_by': created_by,
            'created_at': now,
            'updated_at': now
        }

    @staticmethod
    def to_dict(doc: Dict[str, Any]) -> Dict[str, Any]:
        """Format resource for API response."""
        res_id = str(doc.get('_id', doc.get('id', '')))
        created = doc.get('created_at')
        if isinstance(created, datetime):
            created = created.isoformat()
        updated = doc.get('updated_at')
        if isinstance(updated, datetime):
            updated = updated.isoformat()

        return {
            'id': res_id,
            'title': doc.get('title', ''),
            'description': doc.get('description', ''),
            'category': doc.get('category', 'General'),
            'department': doc.get('department', ''),
            'author_or_source': doc.get('author_or_source', ''),
            'tags': doc.get('tags', []),
            'format': doc.get('format', 'PDF'),
            'access_level': doc.get('access_level', 'All Students'),
            'rating': doc.get('rating', 0.0),
            'saves_count': doc.get('saves_count', 0),
            'url': doc.get('url', ''),
            'status': doc.get('status', 'approved'),
            'created_by': doc.get('created_by'),
            'created_at': created,
            'updated_at': updated
        }
