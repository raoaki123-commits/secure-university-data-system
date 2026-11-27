from flask import Blueprint, request, g
from datetime import datetime, timezone
from app.services.recommendation_service import RecommendationService
from app.middleware.authentication import jwt_required
from app.middleware.authorization import roles_required
from app.utils.responses import success_response, error_response
from app.core.database import DatabaseManager
from app.recommendation_engine.model_manager import RecommendationModelManager

recommendations_bp = Blueprint('recommendations', __name__, url_prefix='/api/v1/recommendations')

@recommendations_bp.route('', methods=['GET'])
@recommendations_bp.route('/student', methods=['GET'])
@jwt_required
def get_recommendations():
    """
    GET /api/recommendations (and /api/v1/recommendations, /api/v1/recommendations/student)
    Retrieve personalized recommendations for the authenticated user.
    Supports engine selection: 'baseline' (default heuristic) or 'hybrid' (TensorFlow 2.x NeuMF).
    """
    item_type = request.args.get('type') or request.args.get('item_type')
    limit = min(int(request.args.get('limit', 15)), 50)
    engine = request.args.get('engine', 'baseline').strip().lower()

    user_profile = g.current_user or {'department': 'Computer Science'}
    recommendations = RecommendationService.generate_recommendations(
        user_profile=user_profile,
        item_type=item_type,
        limit=limit,
        engine=engine
    )

    metadata = RecommendationService.get_engine_metadata(user_profile, engine=engine)

    return success_response(
        data={
            'recommender_metadata': metadata,
            'recommendations': recommendations,
            'count': len(recommendations)
        },
        message="Recommendations computed successfully.",
        recommender_metadata=metadata,
        count=len(recommendations),
        recommendations=recommendations
    )

@recommendations_bp.route('/oblivious', methods=['POST'])
@jwt_required
def post_oblivious_recommendations():
    """
    POST /api/v1/recommendations/oblivious
    Compute oblivious homomorphic recommendation scores using TenSEAL CKKS.
    The server receives the student's encrypted vector and returns encrypted scores.
    """
    data = request.get_json(silent=True) or {}
    encrypted_vector = data.get('encrypted_vector')
    if not encrypted_vector:
        return error_response(
            message="Field 'encrypted_vector' (base64 string) is required.",
            error_code="VALIDATION_ERROR",
            status_code=400
        )

    db = DatabaseManager.get_db()
    resources = list(db['resources'].find({'status': {'$ne': 'rejected'}}).limit(10))

    mgr = RecommendationModelManager.get_instance()
    user_id = g.current_user.get('id')
    scored = mgr.score_candidates_oblivious_he(
        encrypted_user_vector_b64=encrypted_vector,
        candidate_items=resources,
        user_id=user_id
    )

    return success_response(
        data={
            'encrypted_recommendations': scored,
            'count': len(scored),
            'scheme': 'CKKS (TenSEAL)',
            'zero_cleartext_guarantee': True
        },
        message="Oblivious homomorphic recommendations computed successfully."
    )

@recommendations_bp.route('', methods=['POST'])
@jwt_required
def post_recommendations():
    """
    POST /api/recommendations (and /api/v1/recommendations)
    Execute on-demand recommendation generation or submit feedback interaction.
    """
    data = request.get_json(silent=True) or {}
    user_id = g.current_user['id']

    # If payload contains feedback, record feedback
    if 'feedback' in data and 'item_id' in data:
        item_id = str(data['item_id']).strip()
        item_type = data.get('item_type', 'resource').strip().lower()
        feedback = data['feedback'].strip().lower()
        title = data.get('title', 'Item')
        category = data.get('category', 'General')

        if feedback not in ('useful', 'not_relevant', 'saved'):
            return error_response(
                message="Feedback must be one of: 'useful', 'not_relevant', 'saved'.",
                error_code="VALIDATION_ERROR",
                status_code=400
            )

        doc = RecommendationService.record_feedback(
            user_id=user_id,
            item_id=item_id,
            item_type=item_type,
            feedback=feedback,
            title=title,
            category=category
        )

        return success_response(
            data=doc,
            message=f"Feedback '{feedback}' recorded successfully."
        )

    # Otherwise, execute on-demand recommendation generation with request parameters
    item_type = data.get('type') or data.get('item_type')
    limit = min(int(data.get('limit', 15)), 50)
    engine = str(data.get('engine', 'baseline')).strip().lower()

    recommendations = RecommendationService.generate_recommendations(
        user_profile=g.current_user,
        item_type=item_type,
        limit=limit,
        engine=engine
    )
    metadata = RecommendationService.get_engine_metadata(g.current_user, engine=engine)

    return success_response(
        data={
            'recommender_metadata': metadata,
            'recommendations': recommendations,
            'count': len(recommendations)
        },
        message="Recommendations generated successfully.",
        recommender_metadata=metadata,
        count=len(recommendations),
        recommendations=recommendations
    )

@recommendations_bp.route('/evaluation', methods=['GET'])
@jwt_required
def get_evaluation_metrics():
    """
    GET /api/v1/recommendations/evaluation
    Retrieve real measured offline evaluation metrics for the TensorFlow 2.x NeuMF model:
    Precision@K, Recall@K, HitRate@K, NDCG@K, training loss, and test cohort statistics.
    """
    mgr = RecommendationModelManager.get_instance()
    report = mgr.latest_evaluation_report
    if not report:
        # If no report loaded yet, trigger default training on corpus
        report = mgr.train_and_evaluate(epochs=5)

    return success_response(
        data=report,
        message="Model evaluation report retrieved successfully.",
        evaluation=report
    )

@recommendations_bp.route('/train', methods=['POST'])
@jwt_required
@roles_required('admin')
def train_recommendation_model():
    """
    POST /api/v1/recommendations/train
    Admin endpoint to trigger reproducible training of the TensorFlow 2.x NeuMF model.
    """
    payload = request.get_json(silent=True) or {}
    epochs = min(int(payload.get('epochs', 10)), 50)
    batch_size = int(payload.get('batch_size', 32))

    mgr = RecommendationModelManager.get_instance()
    report = mgr.train_and_evaluate(epochs=epochs, batch_size=batch_size)

    return success_response(
        data=report,
        message=f"TensorFlow 2.x NeuMF model trained successfully across {epochs} epochs.",
        evaluation=report
    )

@recommendations_bp.route('/<item_id>', methods=['GET'])
@jwt_required
def get_recommendation_item(item_id: str):
    """
    GET /api/recommendations/<id> (and /api/v1/recommendations/<id>)
    Retrieve detailed scoring breakdown for a specific recommendation candidate.
    """
    engine = request.args.get('engine', 'baseline').strip().lower()
    rec = RecommendationService.get_recommendation_by_id(item_id, g.current_user, engine=engine)
    if not rec:
        return error_response(
            message=f"Recommendation candidate with ID '{item_id}' was not found.",
            error_code="NOT_FOUND",
            status_code=404
        )

    return success_response(
        data=rec,
        message="Recommendation item details retrieved successfully.",
        recommendation=rec
    )

@recommendations_bp.route('/feedback', methods=['POST'])
@jwt_required
def submit_feedback():
    """
    POST /api/v1/recommendations/feedback
    Dedicated backward-compatible feedback route for student dashboard.
    """
    data = request.get_json(silent=True) or {}
    item_id = str(data.get('item_id', '')).strip()
    item_type = data.get('item_type', 'resource').strip().lower()
    feedback = data.get('feedback', '').strip().lower()
    title = data.get('title', 'Item')
    category = data.get('category', 'General')

    if not item_id or feedback not in ('useful', 'not_relevant', 'saved'):
        return error_response(
            message="Valid 'item_id' and feedback ('useful' | 'not_relevant' | 'saved') required.",
            error_code="VALIDATION_ERROR",
            status_code=400
        )

    doc = RecommendationService.record_feedback(
        user_id=g.current_user['id'],
        item_id=item_id,
        item_type=item_type,
        feedback=feedback,
        title=title,
        category=category
    )

    return success_response(
        data=doc,
        message=f"Feedback '{feedback}' successfully recorded for model calibration."
    )

@recommendations_bp.route('/history', methods=['GET'])
@jwt_required
def get_history():
    """
    GET /api/v1/recommendations/history
    Retrieve interaction history for current user.
    """
    db = DatabaseManager.get_db()
    cursor = db['recommendation_feedback'].find({'user_id': g.current_user['id']}).sort('timestamp', -1).limit(50)
    history = []
    for doc in cursor:
        doc['id'] = str(doc.get('_id', ''))
        doc.pop('_id', None)
        history.append(doc)

    return success_response(
        data={'history': history, 'count': len(history)},
        message="Recommendation history retrieved successfully.",
        history=history,
        count=len(history)
    )
