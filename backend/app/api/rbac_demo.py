from flask import Blueprint, jsonify, g
from app.core.security import jwt_required, roles_required

rbac_bp = Blueprint('rbac', __name__, url_prefix='/api/v1/portal')

@rbac_bp.route('/student', methods=['GET'])
@jwt_required
@roles_required('student', 'admin')
def student_portal():
    """Portal endpoint restricted to Students and Admins."""
    return jsonify({
        'status': 200,
        'portal': 'Student Academic & Services Discovery',
        'authorized_user': g.current_user['email'],
        'role': g.current_user['role'],
        'features': [
            'Explore Academic Resources',
            'Discover Campus Events',
            'Confidential Counseling Booking',
            'CKKS Preference Vector Tuning'
        ]
    }), 200

@rbac_bp.route('/faculty', methods=['GET'])
@jwt_required
@roles_required('faculty', 'admin')
def faculty_portal():
    """Portal endpoint restricted to Faculty and Admins."""
    return jsonify({
        'status': 200,
        'portal': 'Faculty Academic Resource & Advising Management',
        'authorized_user': g.current_user['email'],
        'role': g.current_user['role'],
        'features': [
            'Publish Course Study Material',
            'Host Departmental Symposia',
            'Advisee Resource Suggestions'
        ]
    }), 200

@rbac_bp.route('/staff', methods=['GET'])
@jwt_required
@roles_required('staff', 'admin')
def staff_portal():
    """Portal endpoint restricted to Campus Staff and Admins."""
    return jsonify({
        'status': 200,
        'portal': 'Campus Support Services Administration',
        'authorized_user': g.current_user['email'],
        'role': g.current_user['role'],
        'features': [
            'Publish Confidential Campus Services',
            'Manage Accessibility Stipends',
            'Moderate Campus Life Events'
        ]
    }), 200

@rbac_bp.route('/admin', methods=['GET'])
@jwt_required
@roles_required('admin')
def admin_portal():
    """Restricted strictly to Administrators. Unauthorized roles receive 403 Forbidden."""
    return jsonify({
        'status': 200,
        'portal': 'Sovereign Institutional Administration Console',
        'authorized_user': g.current_user['email'],
        'role': g.current_user['role'],
        'system_health': {
            'he_engine': 'TenSEAL CKKS (N=8192)',
            'mpc_trustee_node_2': 'Connected',
            'mongodb_csfle': 'Active'
        },
        'administrative_capabilities': [
            'User & Role Governance',
            'Catalog Moderation',
            'Privacy Audit Trail Review',
            'System Latency & Node Telemetry'
        ]
    }), 200

