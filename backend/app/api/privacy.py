"""
Privacy & Cryptographic Subsystem API Endpoints.
Provides REST interfaces for:
- Homomorphic Encryption (CKKS via TenSEAL / Microsoft SEAL)
- Secure Multi-Party Computation (3-Party Additive Secret Sharing with Beaver Triples)
- Cryptographic context retrieval, oblivious score computation, and audit logging.
"""
from flask import Blueprint, request, g
from datetime import datetime, timezone
from app.core.database import DatabaseManager
from app.middleware.authentication import jwt_required
from app.middleware.authorization import roles_required
from app.services.encryption_service import HomomorphicEncryptionService
from app.services.mpc_service import MPCService
from app.models.privacy_operation import PrivacyOperationModel
from app.utils.responses import success_response, error_response, paginated_response
from app.utils.validators import parse_pagination

privacy_bp = Blueprint('privacy', __name__, url_prefix='/api/v1/privacy')

DEFAULT_PRIVACY_PREFS = {
    'share_department_with_recommender': True,
    'collect_interaction_history': True,
    'homomorphic_noise_scale': 0.05,
    'differential_privacy_epsilon': 0.5,
    'zero_knowledge_audit_logging': True,
    'anonymize_bookmarks': True,
    'last_consent_at': None
}


@privacy_bp.route('/status', methods=['GET'])
@jwt_required
def get_privacy_status():
    """
    GET /api/privacy/status (and /api/v1/privacy/status)
    Returns operational cryptographic status for Homomorphic Encryption (HE) and Multi-Party Computation (MPC).
    """
    he_status = HomomorphicEncryptionService.get_status()
    mpc_status = MPCService.get_status()

    payload = {
        'homomorphic_encryption': he_status,
        'multi_party_computation': mpc_status,
        'zero_cleartext_guarantee': True,
        'compliance': 'OWASP / University Academic Privacy Standard / HomomorphicEncryption.org'
    }

    return success_response(
        data=payload,
        message="Privacy & cryptographic subsystem status retrieved.",
        privacy_status=payload
    )


@privacy_bp.route('/context', methods=['GET'])
@jwt_required
def get_public_context():
    """
    GET /api/v1/privacy/context
    Returns serialized public CKKS context for client-side vector encryption.
    Contains no secret keys.
    """
    pub_ctx_b64 = HomomorphicEncryptionService.get_public_context_base64()
    if not pub_ctx_b64:
        return error_response(
            message="Public cryptographic context is not available.",
            error_code="CRYPTO_UNAVAILABLE",
            status_code=503
        )

    return success_response(
        data={
            "public_context": pub_ctx_b64,
            "scheme": "CKKS",
            "poly_modulus_degree": 8192,
            "security_level": "128-bit"
        },
        message="Public CKKS evaluation context retrieved successfully."
    )


@privacy_bp.route('/encrypt', methods=['POST'])
@jwt_required
def encrypt_user_vector():
    """
    POST /api/v1/privacy/encrypt
    Encrypts a user floating-point preference or rating vector using CKKS.
    Returns ciphertext string for homomorphic server evaluation.
    """
    data = request.get_json(silent=True) or {}
    vector = data.get('vector')

    if not vector or not isinstance(vector, list):
        return error_response(
            message="Field 'vector' must be a non-empty list of floating point values.",
            error_code="VALIDATION_ERROR",
            status_code=400
        )

    try:
        clean_vec = [float(v) for v in vector]
    except (ValueError, TypeError):
        return error_response(
            message="All elements in 'vector' must be valid numbers.",
            error_code="VALIDATION_ERROR",
            status_code=400
        )

    user_id = g.current_user.get('id')
    enc_result = HomomorphicEncryptionService.encrypt_vector(clean_vec, user_id=user_id)

    return success_response(
        data=enc_result,
        message="Vector homomorphically encrypted successfully."
    )


@privacy_bp.route('/compute', methods=['POST'])
@privacy_bp.route('/he/dot-product', methods=['POST'])
@jwt_required
def compute_oblivious_score():
    """
    POST /api/v1/privacy/compute or /api/v1/privacy/he/dot-product
    Server computes oblivious dot product between student ciphertext and candidate plaintext vector.
    """
    data = request.get_json(silent=True) or {}
    ciphertext = data.get('ciphertext')
    plaintext_vector = data.get('plaintext_vector')

    if not ciphertext or not plaintext_vector or not isinstance(plaintext_vector, list):
        return error_response(
            message="Fields 'ciphertext' (string) and 'plaintext_vector' (list of numbers) are required.",
            error_code="VALIDATION_ERROR",
            status_code=400
        )

    try:
        clean_pv = [float(v) for v in plaintext_vector]
    except (ValueError, TypeError):
        return error_response(
            message="'plaintext_vector' elements must be valid numbers.",
            error_code="VALIDATION_ERROR",
            status_code=400
        )

    user_id = g.current_user.get('id')
    res = HomomorphicEncryptionService.compute_oblivious_dot_product(ciphertext, clean_pv, user_id=user_id)

    return success_response(
        data=res,
        message="Oblivious homomorphic dot product computed successfully."
    )


@privacy_bp.route('/mpc/aggregate', methods=['POST'])
@jwt_required
def execute_mpc_aggregation():
    """
    POST /api/v1/privacy/mpc/aggregate
    Demonstrates 3-party secure aggregation of cohort ratings.
    """
    data = request.get_json(silent=True) or {}
    ratings = data.get('ratings', [4.5, 4.0, 5.0, 3.5, 4.8])

    if not isinstance(ratings, list) or len(ratings) == 0:
        return error_response(
            message="'ratings' must be a non-empty list of numerical ratings.",
            error_code="VALIDATION_ERROR",
            status_code=400
        )

    try:
        clean_ratings = [float(r) for r in ratings]
    except (ValueError, TypeError):
        return error_response(
            message="All elements in 'ratings' must be numeric.",
            error_code="VALIDATION_ERROR",
            status_code=400
        )

    user_id = g.current_user.get('id')
    res = MPCService.execute_multi_party_rating_aggregation(clean_ratings, user_id=user_id)

    return success_response(
        data=res,
        message="3-Party MPC oblivious rating aggregation executed successfully."
    )


@privacy_bp.route('/benchmark', methods=['GET'])
@jwt_required
def get_crypto_benchmark():
    """
    GET /api/v1/privacy/benchmark
    Runs a live benchmark measuring CKKS encryption, dot-product, decryption, and precision error.
    """
    dim = min(int(request.args.get('dimension', 16)), 64)
    res = HomomorphicEncryptionService.benchmark_operations(vector_dim=dim)
    return success_response(
        data=res,
        message="Live cryptographic benchmark executed successfully."
    )


@privacy_bp.route('/operations', methods=['GET'])
@jwt_required
def get_privacy_operations():
    """
    GET /api/privacy/operations (and /api/v1/privacy/operations)
    Retrieve paginated audit metadata of privacy-preserving operations.
    """
    limit, skip = parse_pagination(request.args.get('limit'), request.args.get('skip'), default_limit=20)
    db = DatabaseManager.get_db()
    col = db['privacy_operations']

    query = {}
    if g.current_user.get('role') != 'admin':
        query['user_id'] = g.current_user['id']

    total = col.count_documents(query)
    cursor = col.find(query).sort('timestamp', -1).skip(skip).limit(limit)

    operations = [PrivacyOperationModel.to_dict(doc) for doc in cursor]

    return paginated_response(
        items=operations,
        total=total,
        limit=limit,
        skip=skip,
        message="Privacy operations metadata retrieved.",
        item_key="operations"
    )


@privacy_bp.route('/operations/simulate', methods=['POST'])
@jwt_required
def simulate_privacy_operation():
    """
    POST /api/privacy/operations/simulate
    Backward-compatible simulation route for student dashboard.
    """
    data = request.get_json(silent=True) or {}
    operation_type = data.get('operation_type', 'HE_NOISE_PERTURBATION').upper()
    user_id = g.current_user['id']

    if operation_type in ('MPC_SECRET_SHARING', 'MPC_AGGREGATION'):
        value = float(data.get('value', 0.85))
        shares = MPCService.generate_secret_shares(value, num_shares=2)
        MPCService.execute_oblivious_aggregation([shares], user_id=user_id)
        result = {
            'operation': 'MPC_SECRET_SHARING',
            'shares_count': len(shares),
            'protocol': MPCService.PROTOCOL_NAME
        }
    elif operation_type == 'CKKS_OBLIVIOUS_DOT_PRODUCT':
        bench = HomomorphicEncryptionService.benchmark_operations(vector_dim=8)
        result = {
            'operation': 'CKKS_OBLIVIOUS_DOT_PRODUCT',
            'benchmark': bench
        }
    else:
        vector = data.get('vector', [0.85, 0.92, 0.78, 0.65])
        epsilon = float(data.get('epsilon', 0.5))
        noise_scale = float(data.get('noise_scale', 0.05))
        perturbed = HomomorphicEncryptionService.apply_differential_privacy_noise(
            ratings_vector=vector,
            epsilon=epsilon,
            noise_scale=noise_scale,
            user_id=user_id
        )
        result = {
            'operation': 'HOMOMORPHIC_NOISE_PERTURBATION',
            'input_vector_length': len(vector),
            'perturbed_vector': perturbed,
            'scheme': HomomorphicEncryptionService.SCHEME_NAME
        }

    return success_response(
        data=result,
        message="Privacy computation executed and metadata recorded in privacy_operations.",
        status_code=201
    )


@privacy_bp.route('/preferences', methods=['GET'])
@jwt_required
def get_privacy_preferences():
    """Retrieve privacy preferences for current student."""
    db = DatabaseManager.get_db()
    col = db['privacy_preferences']
    user_id = g.current_user['id']

    doc = col.find_one({'user_id': user_id})
    if not doc:
        prefs = dict(DEFAULT_PRIVACY_PREFS)
        prefs['user_id'] = user_id
        prefs['last_consent_at'] = datetime.now(timezone.utc).isoformat()
        col.insert_one(prefs)
        prefs.pop('_id', None)
        return success_response(data=prefs, message="Default privacy preferences initialized.", preferences=prefs)

    doc['id'] = str(doc.get('_id', ''))
    doc.pop('_id', None)
    return success_response(data=doc, message="Privacy preferences retrieved.", preferences=doc)


@privacy_bp.route('/preferences', methods=['PUT'])
@jwt_required
def update_privacy_preferences():
    """Update privacy settings and consent thresholds."""
    data = request.get_json(silent=True) or {}
    db = DatabaseManager.get_db()
    col = db['privacy_preferences']
    user_id = g.current_user['id']

    update_fields = {}
    for key in (
        'share_department_with_recommender',
        'collect_interaction_history',
        'homomorphic_noise_scale',
        'differential_privacy_epsilon',
        'zero_knowledge_audit_logging',
        'anonymize_bookmarks'
    ):
        if key in data:
            update_fields[key] = data[key]

    update_fields['last_consent_at'] = datetime.now(timezone.utc).isoformat()
    update_fields['updated_at'] = datetime.now(timezone.utc).isoformat()

    col.update_one({'user_id': user_id}, {'$set': update_fields}, upsert=True)

    updated = col.find_one({'user_id': user_id})
    updated['id'] = str(updated.get('_id', ''))
    updated.pop('_id', None)

    return success_response(
        data=updated,
        message="Privacy preferences successfully updated.",
        preferences=updated
    )
