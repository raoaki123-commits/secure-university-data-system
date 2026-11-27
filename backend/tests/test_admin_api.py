import pytest
from app.config import TestingConfig

def get_admin_token(client, email="admin.tester@university.edu"):
    res = client.post(
        '/api/v1/auth/register',
        headers={'X-Admin-Provision-Key': TestingConfig.ADMIN_PROVISION_KEY},
        json={
            'name': 'Chief Admin',
            'email': email,
            'password': 'Password123!',
            'role': 'admin'
        }
    )
    return res.get_json()['tokens']['access_token']

def get_student_token(client, email="student.peeping@university.edu"):
    res = client.post('/api/v1/auth/register', json={
        'name': 'Peeping Student',
        'email': email,
        'password': 'Password123!',
        'role': 'student'
    })
    return res.get_json()['tokens']['access_token']

def test_unauthorized_access_to_admin_endpoints(client):
    student_token = get_student_token(client)
    student_headers = {'Authorization': f'Bearer {student_token}'}

    # Probing admin stats without admin role must yield 403 Forbidden
    res = client.get('/api/v1/admin/stats', headers=student_headers)
    assert res.status_code == 403

    # Probing admin users list
    res_users = client.get('/api/v1/admin/users', headers=student_headers)
    assert res_users.status_code == 403

    # Probing security status
    res_sec = client.get('/api/v1/admin/security/status', headers=student_headers)
    assert res_sec.status_code == 403

    # Without any token must yield 401 Unauthorized
    res_no_token = client.get('/api/v1/admin/stats')
    assert res_no_token.status_code == 401

def test_admin_get_stats(client):
    admin_token = get_admin_token(client)
    headers = {'Authorization': f'Bearer {admin_token}'}

    res = client.get('/api/v1/admin/stats', headers=headers)
    assert res.status_code == 200
    data = res.get_json()['stats']

    assert data['users']['total'] >= 1
    assert data['users']['admins'] >= 1
    assert data['resources']['total'] >= 8
    assert data['events']['total'] >= 4
    assert data['services']['total'] >= 5
    assert isinstance(data['recent_activities'], list)

def test_admin_user_management(client):
    admin_token = get_admin_token(client)
    headers = {'Authorization': f'Bearer {admin_token}'}

    # Register a student to manage
    student_token = get_student_token(client, "manage.me@university.edu")

    # 1. List users
    res = client.get('/api/v1/admin/users?role=student', headers=headers)
    assert res.status_code == 200
    users = res.get_json()['users']
    assert any(u['email'] == 'manage.me@university.edu' for u in users)

    target_user = next(u for u in users if u['email'] == 'manage.me@university.edu')
    user_id = target_user['id']

    # 2. Get user detail
    detail_res = client.get(f'/api/v1/admin/users/{user_id}', headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.get_json()['user']['email'] == 'manage.me@university.edu'

    # 3. Suspend user
    suspend_res = client.put(f'/api/v1/admin/users/{user_id}/status', headers=headers, json={
        'account_status': 'suspended'
    })
    assert suspend_res.status_code == 200

    # 4. Verify suspended user is immediately blocked (403) from API
    student_headers = {'Authorization': f'Bearer {student_token}'}
    blocked_res = client.get('/api/v1/recommendations/student', headers=student_headers)
    assert blocked_res.status_code == 403
    assert 'suspended' in blocked_res.get_json()['message']

    # 5. Reactivate user
    activate_res = client.put(f'/api/v1/admin/users/{user_id}/status', headers=headers, json={
        'account_status': 'active'
    })
    assert activate_res.status_code == 200

    # 6. Change user role to faculty
    role_res = client.put(f'/api/v1/admin/users/{user_id}/role', headers=headers, json={
        'role': 'faculty'
    })
    assert role_res.status_code == 200

    # Verify role was updated
    detail_res2 = client.get(f'/api/v1/admin/users/{user_id}', headers=headers)
    assert detail_res2.get_json()['user']['role'] == 'faculty'

def test_admin_self_demotion_safeguard(client):
    admin_token = get_admin_token(client, "sole.admin@university.edu")
    headers = {'Authorization': f'Bearer {admin_token}'}

    # Get sole admin ID
    users_res = client.get('/api/v1/admin/users?role=admin', headers=headers)
    admin_user = next(u for u in users_res.get_json()['users'] if u['email'] == 'sole.admin@university.edu')

    # Attempting to demote sole admin to student must fail
    res = client.put(f'/api/v1/admin/users/{admin_user["id"]}/role', headers=headers, json={
        'role': 'student'
    })
    assert res.status_code == 400
    assert 'sole active' in res.get_json()['message']

def test_admin_resource_crud_and_status(client):
    admin_token = get_admin_token(client)
    headers = {'Authorization': f'Bearer {admin_token}'}

    # 1. Create Resource
    create_res = client.post('/api/v1/admin/resources', headers=headers, json={
        'title': 'Advanced Homomorphic Computing Guide',
        'description': 'Comprehensive manual on CKKS bootstrapping operations.',
        'category': 'learning-materials',
        'department': 'Computer Science',
        'author_or_source': 'Prof. Cryptographer',
        'tags': ['CKKS', 'FHE', 'Cryptography'],
        'format': 'PDF Document',
        'access_level': 'University Accredited',
        'url': 'https://cs.university.edu/ckks-guide.pdf',
        'status': 'pending_approval'
    })
    assert create_res.status_code == 201
    res_id = create_res.get_json()['resource']['id']

    # 2. Update Resource
    update_res = client.put(f'/api/v1/admin/resources/{res_id}', headers=headers, json={
        'title': 'Advanced Homomorphic Computing Guide (2nd Edition)'
    })
    assert update_res.status_code == 200

    # 3. Approve Resource
    approve_res = client.put(f'/api/v1/admin/resources/{res_id}/status', headers=headers, json={
        'status': 'approved'
    })
    assert approve_res.status_code == 200

    # 4. Delete Resource
    delete_res = client.delete(f'/api/v1/admin/resources/{res_id}', headers=headers)
    assert delete_res.status_code == 200

def test_admin_event_and_service_crud(client):
    admin_token = get_admin_token(client)
    headers = {'Authorization': f'Bearer {admin_token}'}

    # 1. Create Event
    evt_res = client.post('/api/v1/admin/events', headers=headers, json={
        'title': 'Annual Cryptography Symposium',
        'description': 'Gathering of privacy and security scholars.',
        'category': 'Symposium',
        'department_or_host': 'Cyber Institute',
        'date': '2026-12-10',
        'time': '10:00 - 18:00 EST',
        'location': 'Grand Auditorium',
        'is_virtual': False,
        'registration_required': True
    })
    assert evt_res.status_code == 201
    evt_id = evt_res.get_json()['event']['id']

    # Update event
    evt_up = client.put(f'/api/v1/admin/events/{evt_id}', headers=headers, json={'time': '09:00 - 17:00 EST'})
    assert evt_up.status_code == 200

    # Delete event
    evt_del = client.delete(f'/api/v1/admin/events/{evt_id}', headers=headers)
    assert evt_del.status_code == 200

    # 2. Create Service
    srv_res = client.post('/api/v1/admin/services', headers=headers, json={
        'name': 'Student Mental Health Walk-In Clinic',
        'description': 'Same-day clinical appointments.',
        'category': 'Student Support',
        'contact_email': 'wellness@university.edu',
        'location': 'Health Wing 101',
        'hours': 'Mon-Fri: 08:00 - 17:00',
        'confidentiality_tier': 'High (Zero-Knowledge)',
        'is_active': True
    })
    assert srv_res.status_code == 201
    srv_id = srv_res.get_json()['service']['id']

    # Update service
    srv_up = client.put(f'/api/v1/admin/services/{srv_id}', headers=headers, json={'hours': '24/7 Hotline'})
    assert srv_up.status_code == 200

    # Delete service
    srv_del = client.delete(f'/api/v1/admin/services/{srv_id}', headers=headers)
    assert srv_del.status_code == 200

def test_admin_security_status_and_monitoring(client):
    admin_token = get_admin_token(client)
    headers = {'Authorization': f'Bearer {admin_token}'}

    # Security Status
    sec_res = client.get('/api/v1/admin/security/status', headers=headers)
    assert sec_res.status_code == 200
    sec_data = sec_res.get_json()['security_status']
    assert sec_data['authentication']['algorithm'] == 'Argon2id'
    assert sec_data['homomorphic_encryption']['status'] in ('OPERATIONAL', 'BASELINE_ACTIVE')
    assert sec_data['session_tokens']['status'] == 'OPERATIONAL'

    # Recommendation Monitoring
    rec_res = client.get('/api/v1/admin/recommendations/monitoring', headers=headers)
    assert rec_res.status_code == 200
    rec_data = rec_res.get_json()['monitoring']
    assert 'Baseline Content Heuristic' in rec_data['model_info']['active_version']
    assert 'TensorFlow' in rec_data['model_info']['target_framework']

    # Audit Logs
    audit_res = client.get('/api/v1/admin/audit-logs', headers=headers)
    assert audit_res.status_code == 200
    assert 'logs' in audit_res.get_json()
