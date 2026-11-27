from datetime import datetime, timezone
from typing import Dict, Any, Optional

class PrivacyOperationModel:
    """Document schema for the 'privacy_operations' MongoDB collection."""

    @staticmethod
    def create_document(
        operation_type: str,
        user_id: Optional[str] = None,
        scheme: str = 'CKKS Homomorphic Encryption',
        parameters: Optional[Dict[str, Any]] = None,
        status: str = 'SUCCESS',
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Record a privacy-preserving operation without exposing raw cleartext attributes.
        """
        now = datetime.now(timezone.utc).isoformat()
        return {
            'operation_type': operation_type,
            'user_id': str(user_id) if user_id else None,
            'scheme': scheme,
            'parameters': parameters or {},
            'status': status,
            'ip_address': ip_address or '127.0.0.1',
            'timestamp': now
        }

    @staticmethod
    def to_dict(doc: Dict[str, Any]) -> Dict[str, Any]:
        """Format privacy operation record for API response."""
        return {
            'id': str(doc.get('_id', doc.get('id', ''))),
            'operation_type': doc.get('operation_type', ''),
            'user_id': doc.get('user_id'),
            'scheme': doc.get('scheme', ''),
            'parameters': doc.get('parameters', {}),
            'status': doc.get('status', 'SUCCESS'),
            'ip_address': doc.get('ip_address'),
            'timestamp': doc.get('timestamp')
        }
