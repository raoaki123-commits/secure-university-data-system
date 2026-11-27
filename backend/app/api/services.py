from flask import Blueprint, request, g
from datetime import datetime, timezone
from app.core.database import DatabaseManager
from app.models.service import ServiceModel
from app.middleware.authentication import jwt_required
from app.middleware.authorization import roles_required
from app.utils.responses import success_response, error_response, paginated_response
from app.utils.validators import parse_pagination, validate_service_payload
from app.services.audit_service import AuditService

services_bp = Blueprint('services', __name__, url_prefix='/api/v1/services')

@services_bp.route('', methods=['GET'])
def get_services():
    """
    GET /api/services (and /api/v1/services)
    Retrieve campus services with optional category, search, and pagination.
    """
    db = DatabaseManager.get_db()
    col = db['services']

    category = request.args.get('category', '').strip()
    search = request.args.get('search', '').strip()
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
    limit, skip = parse_pagination(request.args.get('limit'), request.args.get('skip'), default_limit=20)

    query = {}
    if not include_inactive:
        query['is_active'] = True
    if category and category != 'all':
        query['category'] = category
    if search:
        regex = {'$regex': search, '$options': 'i'}
        query['$or'] = [
            {'name': regex},
            {'description': regex},
            {'tags': regex},
            {'location': regex}
        ]

    total = col.count_documents(query)
    cursor = col.find(query).sort('name', 1).skip(skip).limit(limit)

    services = [ServiceModel.to_dict(doc) for doc in cursor]

    return paginated_response(
        items=services,
        total=total,
        limit=limit,
        skip=skip,
        message="Campus services retrieved successfully.",
        item_key="services"
    )

@services_bp.route('', methods=['POST'])
@jwt_required
@roles_required('admin', 'staff')
def create_service():
    """
    POST /api/services (and /api/v1/services)
    Register a new university support service.
    """
    data = request.get_json(silent=True) or {}
    is_valid, err_msg = validate_service_payload(data, is_update=False)
    if not is_valid:
        return error_response(message=err_msg, error_code="VALIDATION_ERROR", status_code=400)

    tags = data.get('tags', ['Support'])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(',') if t.strip()]

    doc = ServiceModel.create_document(
        name=data['name'],
        description=data['description'],
        category=data.get('category', 'Student Support'),
        contact_email=data.get('contact_email', 'support@university.edu'),
        location=data.get('location', 'Student Center'),
        hours=data.get('hours', 'Mon-Fri: 09:00 - 17:00'),
        confidentiality_tier=data.get('confidentiality_tier', 'Standard Academic'),
        is_active=data.get('is_active', True),
        tags=tags,
        created_by=g.current_user.get('id')
    )

    db = DatabaseManager.get_db()
    db['services'].insert_one(doc)

    formatted = ServiceModel.to_dict(doc)
    AuditService.log_action(
        action='SERVICE_CREATED',
        admin_id=g.current_user['id'],
        admin_email=g.current_user['email'],
        target_id=formatted['id'],
        target_type='service',
        details={'name': formatted['name']}
    )

    return success_response(
        data=formatted,
        message="Service registered successfully.",
        status_code=201,
        service=formatted
    )

@services_bp.route('/<service_id>', methods=['GET'])
def get_service_detail(service_id):
    """
    GET /api/services/<id> (and /api/v1/services/<id>)
    Retrieve details for a specific university service.
    """
    db = DatabaseManager.get_db()
    col = db['services']

    doc = col.find_one({'$or': [{'_id': service_id}, {'id': service_id}]})
    if not doc:
        return error_response(
            message=f"Service with ID '{service_id}' was not found.",
            error_code="NOT_FOUND",
            status_code=404
        )

    formatted = ServiceModel.to_dict(doc)
    return success_response(
        data=formatted,
        message="Service details retrieved successfully.",
        service=formatted
    )

@services_bp.route('/<service_id>', methods=['PUT'])
@jwt_required
@roles_required('admin', 'staff')
def update_service(service_id):
    """
    PUT /api/services/<id> (and /api/v1/services/<id>)
    Update configuration of a university service.
    """
    data = request.get_json(silent=True) or {}
    db = DatabaseManager.get_db()
    col = db['services']

    target = col.find_one({'$or': [{'_id': service_id}, {'id': service_id}]})
    if not target:
        return error_response(
            message=f"Service with ID '{service_id}' was not found.",
            error_code="NOT_FOUND",
            status_code=404
        )

    update_fields = {}
    for key in ('name', 'description', 'category', 'contact_email', 'location', 'hours', 'confidentiality_tier', 'is_active'):
        if key in data:
            update_fields[key] = data[key]
    if 'tags' in data:
        tags = data['tags']
        update_fields['tags'] = tags if isinstance(tags, list) else [t.strip() for t in tags.split(',') if t.strip()]

    update_fields['updated_at'] = datetime.now(timezone.utc).isoformat()
    col.update_one({'_id': target['_id']}, {'$set': update_fields})

    updated = col.find_one({'_id': target['_id']})
    formatted = ServiceModel.to_dict(updated)

    AuditService.log_action(
        action='SERVICE_UPDATED',
        admin_id=g.current_user['id'],
        admin_email=g.current_user['email'],
        target_id=service_id,
        target_type='service',
        details={'name': formatted['name']}
    )

    return success_response(
        data=formatted,
        message="Service updated successfully.",
        service=formatted
    )

@services_bp.route('/<service_id>', methods=['DELETE'])
@jwt_required
@roles_required('admin')
def delete_service(service_id):
    """
    DELETE /api/services/<id> (and /api/v1/services/<id>)
    Delete a university service. Admin only.
    """
    db = DatabaseManager.get_db()
    col = db['services']

    target = col.find_one({'$or': [{'_id': service_id}, {'id': service_id}]})
    if not target:
        return error_response(
            message=f"Service with ID '{service_id}' was not found.",
            error_code="NOT_FOUND",
            status_code=404
        )

    col.delete_one({'_id': target['_id']})
    AuditService.log_action(
        action='SERVICE_DELETED',
        admin_id=g.current_user['id'],
        admin_email=g.current_user['email'],
        target_id=service_id,
        target_type='service',
        details={'name': target.get('name')}
    )

    return success_response(
        message="Service deleted successfully."
    )
