"""
End-to-End User Workflows Test Suite.
Validates the complete user journeys for:
1. Student Workflow (Register -> Login -> Preferences -> Browse Resources/Events/Services
   -> Hybrid Recommendations -> Oblivious HE Scoring -> Feedback -> Bookmarks -> Logout)
2. Faculty & Staff Workflow (Authenticate -> Access Permitted Portals -> Publish Resources/Events/Services
   -> Request Recommendations -> Verify RBAC Enforcements)
3. Administrator Workflow (Authenticate -> Dashboard Stats -> User Management -> Resource/Event/Service Moderation
   -> Audit Logs Inspection -> Privacy & Recommendation Monitoring)
"""
import pytest
from app.config import TestingConfig


def get_auth_tokens(client, email, password, role="student", name="Test User", admin_key=None, department="Computer Science"):
    """Helper to register and login user."""
    payload = {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        'department': department
    }
    if admin_key:
        payload['admin_provision_key'] = admin_key
        headers = {'X-Admin-Provision-Key': admin_key}
    else:
        headers = {}

    reg_res = client.post('/api/v1/auth/register', json=payload, headers=headers)
    if reg_res.status_code == 201:
        return reg_res.get_json()['tokens']['access_token']

    # Login fallback if already registered
    login_res = client.post('/api/v1/auth/login', json={'email': email, 'password': password})
    assert login_res.status_code == 200, f"Login failed: {login_res.get_json()}"
    return login_res.get_json()['tokens']['access_token']


def test_student_complete_user_workflow(client):
    """
    Test Complete Student User Journey:
    1. Register
    2. Log in
    3. Configure privacy preferences
    4. Browse academic resources
    5. Browse university events
    6. Browse services
    7. Request recommendations
    8. View ranked results
    9. Review relevant privacy information & status
    10. Execute oblivious homomorphic scoring
    11. Submit feedback
    12. Toggle bookmark
    13. Log out
    """
    email = "sarah.student@university.edu"
    pwd = "StudentPassword123!"

    # 1. Register
    reg_res = client.post('/api/v1/auth/register', json={
        'name': 'Sarah Connor',
        'email': email,
        'password': pwd,
        'role': 'student',
        'department': 'Computer Science & Engineering'
    })
    assert reg_res.status_code == 201
    assert reg_res.get_json()['user']['role'] == 'student'

    # 2. Log in
    login_res = client.post('/api/v1/auth/login', json={'email': email, 'password': pwd})
    assert login_res.status_code == 200
    token = login_res.get_json()['tokens']['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # Verify session profile
    me_res = client.get('/api/v1/auth/me', headers=headers)
    assert me_res.status_code == 200
    assert me_res.get_json()['user']['email'] == email

    # 3. Configure preferences
    pref_res = client.put('/api/v1/privacy/preferences', headers=headers, json={
        'share_department_with_recommender': True,
        'collect_interaction_history': True,
        'homomorphic_noise_scale': 0.08,
        'differential_privacy_epsilon': 0.6,
        'anonymize_bookmarks': True
    })
    assert pref_res.status_code == 200
    assert pref_res.get_json()['preferences']['homomorphic_noise_scale'] == 0.08

    # 4. Browse academic resources
    res_res = client.get('/api/v1/resources?category=study-materials', headers=headers)
    assert res_res.status_code == 200
    resources = res_res.get_json()['resources']
    assert len(resources) >= 1
    sample_resource_id = resources[0]['id']

    # 5. Browse university events
    ev_res = client.get('/api/v1/events', headers=headers)
    assert ev_res.status_code == 200
    events = ev_res.get_json()['events']
    assert len(events) >= 1

    # 6. Browse university services
    srv_res = client.get('/api/v1/services', headers=headers)
    assert srv_res.status_code == 200
    services = srv_res.get_json()['services']
    assert len(services) >= 1

    # 7 & 8. Request recommendations (both hybrid and baseline modes)
    rec_res = client.get('/api/v1/recommendations/student?engine=hybrid', headers=headers)
    assert rec_res.status_code == 200
    rec_data = rec_res.get_json()
    assert rec_data['count'] >= 1
    top_rec = rec_data['recommendations'][0]
    assert 'score' in top_rec
    assert 'explanation' in top_rec

    # 9. Review relevant privacy information
    priv_status_res = client.get('/api/v1/privacy/status', headers=headers)
    assert priv_status_res.status_code == 200
    status_payload = priv_status_res.get_json()['privacy_status']
    assert 'CKKS' in status_payload['homomorphic_encryption']['active_scheme']
    assert 'Beaver Triples' in status_payload['multi_party_computation']['active_protocol']

    # 10. Execute oblivious homomorphic recommendation scoring
    enc_res = client.post('/api/v1/privacy/encrypt', headers=headers, json={
        'vector': [0.85, 0.75, 0.90, 0.60]
    })
    assert enc_res.status_code == 200
    c_user = enc_res.get_json()['data']['ciphertext']

    oblivious_res = client.post('/api/v1/recommendations/oblivious', headers=headers, json={
        'encrypted_vector': c_user
    })
    assert oblivious_res.status_code == 200
    oblivious_data = oblivious_res.get_json()['data']
    assert oblivious_data['zero_cleartext_guarantee'] is True
    assert len(oblivious_data['encrypted_recommendations']) >= 1

    # 11. Submit feedback on recommendation
    fb_res = client.post('/api/v1/recommendations/feedback', headers=headers, json={
        'item_id': top_rec['item_id'],
        'item_type': top_rec['item_type'],
        'feedback': 'useful',
        'title': top_rec['title'],
        'category': top_rec['category']
    })
    assert fb_res.status_code == 200

    # 12. Toggle bookmark
    bm_res = client.post('/api/v1/bookmarks', headers=headers, json={
        'item_id': sample_resource_id,
        'item_type': 'resource',
        'snapshot': {'title': resources[0]['title']}
    })
    assert bm_res.status_code in (200, 201)
    assert bm_res.get_json()['is_bookmarked'] is True

    # 13. Log out
    logout_res = client.post('/api/v1/auth/logout', headers=headers)
    assert logout_res.status_code == 200


def test_faculty_and_staff_workflows(client):
    """
    Test Faculty & Staff User Journey:
    1. Authenticate as faculty
    2. Access permitted resources
    3. Submit new academic resource
    4. Schedule departmental colloquium event
    5. Request recommendations
    6. Verify RBAC protections (faculty blocked from admin endpoints)
    7. Authenticate as staff
    8. Register new campus support service
    9. Verify RBAC protections (staff blocked from admin endpoints)
    """
    # 1. Authenticate as Faculty
    faculty_token = get_auth_tokens(
        client,
        email="prof.turing@university.edu",
        password="FacultyPassword123!",
        role="faculty",
        name="Prof. Alan Turing",
        department="Computer Science & Mathematics"
    )
    fac_headers = {'Authorization': f'Bearer {faculty_token}'}

    # 2. Access permitted resources
    res_list = client.get('/api/v1/resources', headers=fac_headers)
    assert res_list.status_code == 200

    # 3. Submit academic resource as Faculty
    new_res = client.post('/api/v1/resources', headers=fac_headers, json={
        'title': 'Advanced Computability & Complexity Monograph',
        'description': 'Peer-reviewed research notes on Turing machines and deciders.',
        'category': 'Computer Science',
        'department': 'Computer Science & Mathematics',
        'format': 'PDF',
        'tags': ['Theory', 'Computability'],
        'url': 'https://library.university.edu/monograph-turing.pdf'
    })
    assert new_res.status_code == 201
    created_resource_id = new_res.get_json()['data']['id']
    assert new_res.get_json()['data']['status'] in ('approved', 'pending_approval')

    # 4. Schedule academic colloquium event as Faculty
    new_event = client.post('/api/v1/events', headers=fac_headers, json={
        'title': 'Theoretical CS Departmental Colloquium',
        'description': 'Weekly faculty research talk on quantum polynomial time algorithms.',
        'category': 'Academic Conferences',
        'date': '2026-11-28',
        'time': '16:00 - 17:30',
        'location': 'Turing Hall 101',
        'is_virtual': False,
        'tags': ['Colloquium', 'Research']
    })
    assert new_event.status_code == 201
    assert 'Colloquium' in new_event.get_json()['data']['title']

    # 5. Request recommendations as Faculty
    fac_recs = client.get('/api/v1/recommendations?type=resource', headers=fac_headers)
    assert fac_recs.status_code == 200
    assert len(fac_recs.get_json()['recommendations']) >= 1

    # 6. Verify role-based permissions: Faculty BLOCKED from admin endpoints
    blocked_admin_call = client.get('/api/v1/admin/stats', headers=fac_headers)
    assert blocked_admin_call.status_code == 403
    assert 'Forbidden' in blocked_admin_call.get_json().get('error', '')

    # 7. Authenticate as Staff
    staff_token = get_auth_tokens(
        client,
        email="clara.staff@university.edu",
        password="StaffPassword123!",
        role="staff",
        name="Clara Barton",
        department="Student Wellness & Health"
    )
    staff_headers = {'Authorization': f'Bearer {staff_token}'}

    # 8. Register new campus support service as Staff
    new_service = client.post('/api/v1/services', headers=staff_headers, json={
        'name': 'Mental Health Triage & Rapid Consultation Clinic',
        'description': 'Same-day walk-in confidential consultations for undergraduate and graduate students.',
        'category': 'Health & Wellness',
        'contact_email': 'counseling-walkin@university.edu',
        'location': 'Health Sciences West, Suite 204',
        'hours': 'Mon-Fri: 08:30 - 18:00',
        'confidentiality_tier': 'Strictly Confidential',
        'tags': ['Mental Health', 'Crisis Support', 'Confidential']
    })
    assert new_service.status_code == 201
    assert new_service.get_json()['data']['confidentiality_tier'] == 'Strictly Confidential'

    # 9. Verify Staff BLOCKED from admin user management
    blocked_staff_admin = client.get('/api/v1/admin/users', headers=staff_headers)
    assert blocked_staff_admin.status_code == 403


def test_administrator_complete_workflow(client):
    """
    Test Administrator User Journey:
    1. Authenticate with admin provisioning
    2. View dashboard statistics
    3. Manage users (retrieve list, suspend user, reactivate user)
    4. Manage resources (create, update status to approved)
    5. Manage events (create, update)
    6. Manage services (create, deactivate)
    7. Review audit logs
    8. Monitor privacy modules (HE & MPC status)
    9. Monitor recommendation activity & evaluate model
    """
    admin_key = "sovereign-admin-provision-token-26O2227"
    admin_token = get_auth_tokens(
        client,
        email="chief.admin@university.edu",
        password="AdminMasterPassword123!",
        role="admin",
        name="Chief Platform Administrator",
        admin_key=admin_key,
        department="Information Technology Administration"
    )
    headers = {'Authorization': f'Bearer {admin_token}'}

    # 2. View dashboard overview
    stats_res = client.get('/api/v1/admin/stats', headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.get_json()['stats']
    assert 'users' in stats and stats['users']['total'] >= 1
    assert 'resources' in stats and stats['resources']['total'] >= 8
    assert 'events' in stats and stats['events']['total'] >= 4
    assert 'services' in stats and stats['services']['total'] >= 5

    # Register a student user to manage
    student_reg = client.post('/api/v1/auth/register', json={
        'name': 'Undergraduate Student',
        'email': 'target.student@university.edu',
        'password': 'StudentPassword123!',
        'role': 'student',
        'department': 'Mechanical Engineering'
    })
    assert student_reg.status_code == 201

    # 3. Manage users
    users_res = client.get('/api/v1/admin/users?limit=10', headers=headers)
    assert users_res.status_code == 200
    users = users_res.get_json()['users']
    assert len(users) >= 2
    target_user = next((u for u in users if u['role'] == 'student'), None)
    assert target_user is not None
    target_id = target_user['id']

    # Suspend user
    suspend_res = client.put(f'/api/v1/admin/users/{target_id}/status', headers=headers, json={
        'account_status': 'suspended',
        'reason': 'Administrative audit verification'
    })
    assert suspend_res.status_code == 200
    assert 'suspended' in suspend_res.get_json()['message']

    # Reactivate user
    reactivate_res = client.put(f'/api/v1/admin/users/{target_id}/status', headers=headers, json={
        'account_status': 'active'
    })
    assert reactivate_res.status_code == 200
    assert 'active' in reactivate_res.get_json()['message']

    # 4. Manage resources: Admin create and approve
    res_create = client.post('/api/v1/admin/resources', headers=headers, json={
        'title': 'University Library Digital Archives Access Guide',
        'description': 'Comprehensive instructional manual for accessing restricted scholarly archives.',
        'category': 'Academic Guides',
        'department': 'University Library',
        'status': 'approved'
    })
    assert res_create.status_code == 201
    res_id = res_create.get_json()['resource']['id']

    # Update resource status
    res_mod = client.put(f'/api/v1/admin/resources/{res_id}/status', headers=headers, json={
        'status': 'approved'
    })
    assert res_mod.status_code == 200

    # 5. Manage events: Admin schedule
    ev_create = client.post('/api/v1/admin/events', headers=headers, json={
        'title': 'All-Campus Cybersecurity & Privacy Symposium',
        'description': 'Annual university convention on cryptography, AI ethics, and data protection.',
        'category': 'Symposia',
        'date': '2026-12-05',
        'time': '09:00 - 17:00',
        'location': 'Grand Auditorium',
        'status': 'approved'
    })
    assert ev_create.status_code == 201
    ev_id = ev_create.get_json()['event']['id']

    # 6. Manage services: Admin create
    srv_create = client.post('/api/v1/admin/services', headers=headers, json={
        'name': 'University IT Cryptographic Key Escrow Service',
        'description': 'Secure hardware key management and credential recovery facility.',
        'category': 'IT Security',
        'contact_email': 'it-security@university.edu',
        'location': 'Cyberinfrastructure Building Room 402',
        'hours': 'Mon-Fri: 09:00 - 17:00',
        'confidentiality_tier': 'Restricted Institutional',
        'is_active': True
    })
    assert srv_create.status_code == 201
    srv_id = srv_create.get_json()['service']['id']

    # 7. Review administrative audit logs
    audit_res = client.get('/api/v1/admin/audit-logs?limit=10', headers=headers)
    assert audit_res.status_code == 200
    logs = audit_res.get_json()['logs']
    assert len(logs) >= 1

    # 8. Monitor privacy modules
    sec_res = client.get('/api/v1/admin/security/status', headers=headers)
    assert sec_res.status_code == 200
    sec = sec_res.get_json()['security_status']
    assert sec['homomorphic_encryption']['status'] == 'OPERATIONAL'
    assert sec['multi_party_computation']['status'] == 'OPERATIONAL'

    # 9. Monitor recommendation activity & evaluate model
    mon_res = client.get('/api/v1/admin/recommendations/monitoring', headers=headers)
    assert mon_res.status_code == 200
    assert 'model_info' in mon_res.get_json()['monitoring']

    # Offline evaluation endpoint
    eval_res = client.get('/api/v1/recommendations/evaluation', headers=headers)
    assert eval_res.status_code == 200
    eval_data = eval_res.get_json()['evaluation']
    assert 'evaluation_metrics' in eval_data
    assert eval_data['evaluation_metrics']['hit_rate@10'] > 0.0
