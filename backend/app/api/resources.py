from flask import Blueprint, request, g
from datetime import datetime, timezone
from app.core.database import DatabaseManager
from app.models.resource import ResourceModel
from app.middleware.authentication import jwt_required
from app.middleware.authorization import roles_required
from app.utils.responses import success_response, error_response, paginated_response
from app.utils.validators import parse_pagination, validate_resource_payload
from app.services.audit_service import AuditService

resources_bp = Blueprint('resources', __name__, url_prefix='/api/v1/resources')

@resources_bp.route('', methods=['GET'])
def get_resources():
    """
    GET /api/resources (and /api/v1/resources)
    Retrieve filtered, sorted, paginated academic resources.
    """
    db = DatabaseManager.get_db()
    col = db['resources']

    category = request.args.get('category', '').strip()
    department = request.args.get('department', '').strip()
    search = request.args.get('search', '').strip()
    sort_by = request.args.get('sort', 'newest').strip()
    status_filter = request.args.get('status', '').strip()
    limit, skip = parse_pagination(request.args.get('limit'), request.args.get('skip'), default_limit=20)

    query = {}
    if category and category != 'all':
        query['category'] = category
    if department and department != 'all':
        query['department'] = department
    if status_filter and status_filter != 'all':
        query['status'] = status_filter
    else:
        # Default public listing shows approved resources
        query['status'] = {'$ne': 'rejected'}

    if search:
        regex = {'$regex': search, '$options': 'i'}
        query['$or'] = [
            {'title': regex},
            {'description': regex},
            {'tags': regex},
            {'author_or_source': regex}
        ]

    # Sorting
    sort_spec = [('created_at', -1)]
    if sort_by == 'saves':
        sort_spec = [('saves_count', -1)]
    elif sort_by == 'rating':
        sort_spec = [('rating', -1)]
    elif sort_by == 'title':
        sort_spec = [('title', 1)]

    total = col.count_documents(query)
    cursor = col.find(query).sort(sort_spec).skip(skip).limit(limit)

    results = [ResourceModel.to_dict(doc) for doc in cursor]

    return paginated_response(
        items=results,
        total=total,
        limit=limit,
        skip=skip,
        message="Academic resources retrieved successfully.",
        item_key="resources"
    )

@resources_bp.route('', methods=['POST'])
@jwt_required
@roles_required('admin', 'faculty', 'staff')
def create_resource():
    """
    POST /api/resources (and /api/v1/resources)
    Publish a new academic resource.
    """
    data = request.get_json(silent=True) or {}
    is_valid, err_msg = validate_resource_payload(data, is_update=False)
    if not is_valid:
        return error_response(message=err_msg, error_code="VALIDATION_ERROR", status_code=400)

    tags = data.get('tags', ['Academic'])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(',') if t.strip()]

    doc = ResourceModel.create_document(
        title=data['title'],
        description=data['description'],
        category=data.get('category', 'Computer Science'),
        department=data.get('department', 'Computer Science & Engineering'),
        author_or_source=data.get('author_or_source', g.current_user.get('full_name', 'Faculty Member')),
        tags=tags,
        format=data.get('format', 'PDF'),
        access_level=data.get('access_level', 'All Students'),
        url=data.get('url', ''),
        status=data.get('status', 'approved' if g.current_user.get('role') == 'admin' else 'pending_approval'),
        created_by=g.current_user.get('id')
    )

    db = DatabaseManager.get_db()
    db['resources'].insert_one(doc)

    formatted = ResourceModel.to_dict(doc)
    AuditService.log_action(
        action='RESOURCE_CREATED',
        admin_id=g.current_user['id'],
        admin_email=g.current_user['email'],
        target_id=formatted['id'],
        target_type='resource',
        details={'title': formatted['title']}
    )

    return success_response(
        data=formatted,
        message="Resource created successfully.",
        status_code=201,
        resource=formatted
    )

@resources_bp.route('/<resource_id>', methods=['GET'])
def get_resource_detail(resource_id):
    """
    GET /api/resources/<id> (and /api/v1/resources/<id>)
    Retrieve details of a specific academic resource.
    """
    db = DatabaseManager.get_db()
    col = db['resources']

    doc = col.find_one({'$or': [{'_id': resource_id}, {'id': resource_id}]})
    if not doc:
        return error_response(
            message=f"Resource with ID '{resource_id}' was not found.",
            error_code="NOT_FOUND",
            status_code=404
        )

    formatted = ResourceModel.to_dict(doc)
    return success_response(
        data=formatted,
        message="Resource details retrieved successfully.",
        resource=formatted
    )

@resources_bp.route('/<resource_id>', methods=['PUT'])
@jwt_required
@roles_required('admin', 'faculty', 'staff')
def update_resource(resource_id):
    """
    PUT /api/resources/<id> (and /api/v1/resources/<id>)
    Update an existing academic resource.
    """
    data = request.get_json(silent=True) or {}
    db = DatabaseManager.get_db()
    col = db['resources']

    target = col.find_one({'$or': [{'_id': resource_id}, {'id': resource_id}]})
    if not target:
        return error_response(
            message=f"Resource with ID '{resource_id}' was not found.",
            error_code="NOT_FOUND",
            status_code=404
        )

    # Permission check: admin or creator
    if g.current_user.get('role') != 'admin' and target.get('created_by') != g.current_user.get('id'):
        return error_response(
            message="Access denied. You may only edit resources created by yourself.",
            error_code="FORBIDDEN",
            status_code=403
        )

    update_fields = {}
    for key in ('title', 'description', 'category', 'department', 'author_or_source', 'format', 'access_level', 'url', 'status'):
        if key in data:
            update_fields[key] = data[key]
    if 'tags' in data:
        tags = data['tags']
        update_fields['tags'] = tags if isinstance(tags, list) else [t.strip() for t in tags.split(',') if t.strip()]

    update_fields['updated_at'] = datetime.now(timezone.utc).isoformat()
    col.update_one({'_id': target['_id']}, {'$set': update_fields})

    updated = col.find_one({'_id': target['_id']})
    formatted = ResourceModel.to_dict(updated)

    AuditService.log_action(
        action='RESOURCE_UPDATED',
        admin_id=g.current_user['id'],
        admin_email=g.current_user['email'],
        target_id=resource_id,
        target_type='resource',
        details={'title': formatted['title']}
    )

    return success_response(
        data=formatted,
        message="Resource updated successfully.",
        resource=formatted
    )

@resources_bp.route('/<resource_id>', methods=['DELETE'])
@jwt_required
@roles_required('admin')
def delete_resource(resource_id):
    """
    DELETE /api/resources/<id> (and /api/v1/resources/<id>)
    Delete an academic resource. Admin only.
    """
    db = DatabaseManager.get_db()
    col = db['resources']

    target = col.find_one({'$or': [{'_id': resource_id}, {'id': resource_id}]})
    if not target:
        return error_response(
            message=f"Resource with ID '{resource_id}' was not found.",
            error_code="NOT_FOUND",
            status_code=404
        )

    col.delete_one({'_id': target['_id']})
    AuditService.log_action(
        action='RESOURCE_DELETED',
        admin_id=g.current_user['id'],
        admin_email=g.current_user['email'],
        target_id=resource_id,
        target_type='resource',
        details={'title': target.get('title')}
    )

    return success_response(
        message="Resource deleted successfully."
    )
