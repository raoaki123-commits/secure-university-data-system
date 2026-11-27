from flask import Blueprint, request, g
from datetime import datetime, timezone
from app.core.database import DatabaseManager
from app.models.event import EventModel
from app.middleware.authentication import jwt_required
from app.middleware.authorization import roles_required
from app.utils.responses import success_response, error_response, paginated_response
from app.utils.validators import parse_pagination, validate_event_payload
from app.services.audit_service import AuditService

events_bp = Blueprint('events', __name__, url_prefix='/api/v1/events')

@events_bp.route('', methods=['GET'])
def get_events():
    """
    GET /api/events (and /api/v1/events)
    Retrieve university campus events with optional category, search, and pagination.
    """
    db = DatabaseManager.get_db()
    col = db['events']

    category = request.args.get('category', '').strip()
    search = request.args.get('search', '').strip()
    virtual_only = request.args.get('virtual_only', 'false').lower() == 'true'
    limit, skip = parse_pagination(request.args.get('limit'), request.args.get('skip'), default_limit=20)

    query = {}
    if category and category != 'all':
        query['category'] = category
    if virtual_only:
        query['is_virtual'] = True
    if search:
        regex = {'$regex': search, '$options': 'i'}
        query['$or'] = [
            {'title': regex},
            {'description': regex},
            {'department_or_host': regex},
            {'tags': regex}
        ]

    total = col.count_documents(query)
    cursor = col.find(query).sort('date', 1).skip(skip).limit(limit)

    events = [EventModel.to_dict(doc) for doc in cursor]

    return paginated_response(
        items=events,
        total=total,
        limit=limit,
        skip=skip,
        message="Campus events retrieved successfully.",
        item_key="events"
    )

@events_bp.route('', methods=['POST'])
@jwt_required
@roles_required('admin', 'faculty', 'staff')
def create_event():
    """
    POST /api/events (and /api/v1/events)
    Schedule and publish a new campus event.
    """
    data = request.get_json(silent=True) or {}
    is_valid, err_msg = validate_event_payload(data, is_update=False)
    if not is_valid:
        return error_response(message=err_msg, error_code="VALIDATION_ERROR", status_code=400)

    tags = data.get('tags', ['Campus'])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(',') if t.strip()]

    doc = EventModel.create_document(
        title=data['title'],
        description=data['description'],
        category=data.get('category', 'Workshops'),
        department_or_host=data.get('department_or_host', g.current_user.get('department') or 'University'),
        date=data['date'],
        time=data.get('time', '14:00 - 16:00'),
        location=data.get('location', 'Main Campus'),
        is_virtual=data.get('is_virtual', False),
        registration_required=data.get('registration_required', False),
        registration_deadline=data.get('registration_deadline'),
        tags=tags,
        status='approved' if g.current_user.get('role') == 'admin' else 'pending_approval',
        created_by=g.current_user.get('id')
    )

    db = DatabaseManager.get_db()
    db['events'].insert_one(doc)

    formatted = EventModel.to_dict(doc)
    AuditService.log_action(
        action='EVENT_CREATED',
        admin_id=g.current_user['id'],
        admin_email=g.current_user['email'],
        target_id=formatted['id'],
        target_type='event',
        details={'title': formatted['title']}
    )

    return success_response(
        data=formatted,
        message="Event scheduled successfully.",
        status_code=201,
        event=formatted
    )

@events_bp.route('/<event_id>', methods=['GET'])
def get_event_detail(event_id):
    """
    GET /api/events/<id> (and /api/v1/events/<id>)
    Retrieve details for a specific university event.
    """
    db = DatabaseManager.get_db()
    col = db['events']

    doc = col.find_one({'$or': [{'_id': event_id}, {'id': event_id}]})
    if not doc:
        return error_response(
            message=f"Event with ID '{event_id}' was not found.",
            error_code="NOT_FOUND",
            status_code=404
        )

    formatted = EventModel.to_dict(doc)
    return success_response(
        data=formatted,
        message="Event details retrieved successfully.",
        event=formatted
    )

@events_bp.route('/<event_id>', methods=['PUT'])
@jwt_required
@roles_required('admin', 'faculty', 'staff')
def update_event(event_id):
    """
    PUT /api/events/<id> (and /api/v1/events/<id>)
    Update details of a scheduled university event.
    """
    data = request.get_json(silent=True) or {}
    db = DatabaseManager.get_db()
    col = db['events']

    target = col.find_one({'$or': [{'_id': event_id}, {'id': event_id}]})
    if not target:
        return error_response(
            message=f"Event with ID '{event_id}' was not found.",
            error_code="NOT_FOUND",
            status_code=404
        )

    if g.current_user.get('role') != 'admin' and target.get('created_by') != g.current_user.get('id'):
        return error_response(
            message="Access denied. You may only edit events you scheduled.",
            error_code="FORBIDDEN",
            status_code=403
        )

    update_fields = {}
    for key in ('title', 'description', 'category', 'department_or_host', 'date', 'time', 'location', 'is_virtual', 'registration_required', 'registration_deadline', 'status'):
        if key in data:
            update_fields[key] = data[key]
    if 'tags' in data:
        tags = data['tags']
        update_fields['tags'] = tags if isinstance(tags, list) else [t.strip() for t in tags.split(',') if t.strip()]

    update_fields['updated_at'] = datetime.now(timezone.utc).isoformat()
    col.update_one({'_id': target['_id']}, {'$set': update_fields})

    updated = col.find_one({'_id': target['_id']})
    formatted = EventModel.to_dict(updated)

    AuditService.log_action(
        action='EVENT_UPDATED',
        admin_id=g.current_user['id'],
        admin_email=g.current_user['email'],
        target_id=event_id,
        target_type='event',
        details={'title': formatted['title']}
    )

    return success_response(
        data=formatted,
        message="Event updated successfully.",
        event=formatted
    )

@events_bp.route('/<event_id>', methods=['DELETE'])
@jwt_required
@roles_required('admin')
def delete_event(event_id):
    """
    DELETE /api/events/<id> (and /api/v1/events/<id>)
    Delete a campus event. Admin only.
    """
    db = DatabaseManager.get_db()
    col = db['events']

    target = col.find_one({'$or': [{'_id': event_id}, {'id': event_id}]})
    if not target:
        return error_response(
            message=f"Event with ID '{event_id}' was not found.",
            error_code="NOT_FOUND",
            status_code=404
        )

    col.delete_one({'_id': target['_id']})
    AuditService.log_action(
        action='EVENT_DELETED',
        admin_id=g.current_user['id'],
        admin_email=g.current_user['email'],
        target_id=event_id,
        target_type='event',
        details={'title': target.get('title')}
    )

    return success_response(
        message="Event deleted successfully."
    )
