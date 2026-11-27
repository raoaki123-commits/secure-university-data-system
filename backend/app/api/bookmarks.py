from flask import Blueprint, request, jsonify, g
from datetime import datetime, timezone
from app.core.database import DatabaseManager
from app.core.security import jwt_required

bookmarks_bp = Blueprint('bookmarks', __name__, url_prefix='/api/v1/bookmarks')

@bookmarks_bp.route('', methods=['GET'])
@jwt_required
def get_user_bookmarks():
    """Retrieve all saved bookmarks for the current authenticated user."""
    db = DatabaseManager.get_db()
    bookmarks_col = db['bookmarks']
    user_id = g.current_user['id']

    cursor = bookmarks_col.find({'user_id': user_id}).sort('saved_at', -1)
    bookmarks = []
    for doc in cursor:
        doc['id'] = str(doc.get('_id', ''))
        doc.pop('_id', None)
        bookmarks.append(doc)

    return jsonify({
        'status': 200,
        'count': len(bookmarks),
        'bookmarks': bookmarks
    }), 200

@bookmarks_bp.route('', methods=['POST'])
@jwt_required
def toggle_bookmark():
    """Toggle saving/unsaving an item (resource, event, or service) for the user."""
    data = request.get_json(silent=True) or {}
    item_id = data.get('item_id', '').strip()
    item_type = data.get('item_type', 'resource').strip().lower()
    item_snapshot = data.get('item_snapshot', {})

    if not item_id:
        return jsonify({
            'status': 400,
            'error': 'Bad Request',
            'message': 'item_id is required.'
        }), 400

    db = DatabaseManager.get_db()
    bookmarks_col = db['bookmarks']
    user_id = g.current_user['id']

    existing = bookmarks_col.find_one({'user_id': user_id, 'item_id': item_id})
    if existing:
        # Unsave item
        bookmarks_col.delete_one({'_id': existing['_id']})
        # If resource, decrement saves_count
        if item_type == 'resource':
            db['resources'].update_one(
                {'$or': [{'_id': item_id}, {'id': item_id}]},
                {'$inc': {'saves_count': -1}}
            )

        return jsonify({
            'status': 200,
            'action': 'removed',
            'is_bookmarked': False,
            'message': 'Item removed from saved collection.'
        }), 200
    else:
        # Save item
        doc = {
            'user_id': user_id,
            'item_id': item_id,
            'item_type': item_type,
            'title': item_snapshot.get('title') or item_snapshot.get('name') or 'Saved Item',
            'category': item_snapshot.get('category', ''),
            'department': item_snapshot.get('department', ''),
            'saved_at': datetime.now(timezone.utc).isoformat(),
            'metadata': item_snapshot
        }
        bookmarks_col.insert_one(doc)

        # If resource, increment saves_count
        if item_type == 'resource':
            db['resources'].update_one(
                {'$or': [{'_id': item_id}, {'id': item_id}]},
                {'$inc': {'saves_count': 1}}
            )

        return jsonify({
            'status': 201,
            'action': 'added',
            'is_bookmarked': True,
            'message': 'Item saved to your personal collection.'
        }), 201

@bookmarks_bp.route('/<item_id>', methods=['DELETE'])
@jwt_required
def delete_bookmark(item_id):
    """Remove a specific item from bookmarks."""
    db = DatabaseManager.get_db()
    user_id = g.current_user['id']

    res = db['bookmarks'].delete_one({'user_id': user_id, 'item_id': item_id})
    if res.deleted_count > 0:
        return jsonify({
            'status': 200,
            'message': 'Bookmark removed successfully.'
        }), 200

    return jsonify({
        'status': 404,
        'error': 'Not Found',
        'message': 'Bookmark not found.'
    }), 404

