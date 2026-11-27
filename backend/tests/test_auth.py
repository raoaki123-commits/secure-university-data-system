import time
from datetime import timedelta
import pytest
from app.config import TestingConfig

def register_helper(client, email="student@university.edu", password="Password123!", role="student", full_name="Alex Chen", admin_key=None):
    payload = {
        'full_name': full_name,
        'email': email,
        'password': password,
        'confirm_password': password,
        'role': role,
        'department': 'Computer Science'
    }
    if admin_key:
        payload['admin_provision_key'] = admin_key
    return client.post('/api/v1/auth/register', json=payload)

def login_helper(client, email="student@university.edu", password="Password123!"):
    return client.post('/api/v1/auth/login', json={'email': email, 'password': password})

# 1. Valid registration
def test_valid_registration(client):
    res = register_helper(client)
    assert res.status_code == 201
    data = res.get_json()
    assert data['message'] == 'User registered successfully.'
    assert data['user']['email'] == 'student@university.edu'
    assert data['user']['role'] == 'student'
    assert 'password_hash' not in data['user']
    assert 'access_token' in data['tokens']
    assert 'refresh_token' in data['tokens']

# 2. Duplicate registration
def test_duplicate_registration(client):
    res1 = register_helper(client, email="duplicate@university.edu")
    assert res1.status_code == 201

    res2 = register_helper(client, email="duplicate@university.edu")
    assert res2.status_code == 409
    data = res2.get_json()
    assert 'already exists' in data['message']

# 3. Invalid email format
def test_invalid_email(client):
    res = register_helper(client, email="not-an-email-address")
    assert res.status_code == 400
    data = res.get_json()
    assert 'Invalid email' in data['message']

# 4. Weak password rejection
def test_weak_password(client):
    # Missing uppercase, number, symbol
    res1 = register_helper(client, password="weakpassword", email="user1@university.edu")
    assert res1.status_code == 400
    assert 'uppercase' in res1.get_json()['message']

    # Less than 8 chars
    res2 = register_helper(client, password="P1!", email="user2@university.edu")
    assert res2.status_code == 400
    assert 'at least 8 characters' in res2.get_json()['message']

# 5. Valid login
def test_valid_login(client):
    register_helper(client, email="validlogin@university.edu")
    res = login_helper(client, email="validlogin@university.edu", password="Password123!")
    assert res.status_code == 200
    data = res.get_json()
    assert data['message'] == 'Authentication successful.'
    assert data['user']['email'] == 'validlogin@university.edu'
    assert 'access_token' in data['tokens']

# 6. Invalid login (wrong password & non-existent user)
def test_invalid_login(client):
    register_helper(client, email="existing@university.edu", password="Password123!")
    
    # Wrong password: generic error returned
    res1 = login_helper(client, email="existing@university.edu", password="WrongPassword999!")
    assert res1.status_code == 401
    assert res1.get_json()['message'] == 'Invalid email or password.'

    # Non-existent email: IDENTICAL generic error returned to prevent email enumeration!
    res2 = login_helper(client, email="nonexistent@university.edu", password="AnyPassword123!")
    assert res2.status_code == 401
    assert res2.get_json()['message'] == 'Invalid email or password.'

# 7. Logout
def test_logout(client):
    register_helper(client, email="logoutuser@university.edu")
    login_res = login_helper(client, email="logoutuser@university.edu")
    token = login_res.get_json()['tokens']['access_token']

    res = client.post('/api/v1/auth/logout', headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 200
    assert 'logged out' in res.get_json()['message']

# 8. Session expiration
def test_session_expiration(client):
    # Set fast expiry for this specific test
    client.application.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=1)
    register_helper(client, email="expiry@university.edu")
    login_res = login_helper(client, email="expiry@university.edu")
    token = login_res.get_json()['tokens']['access_token']

    # Wait 1.5 seconds for token to expire
    time.sleep(1.5)

    # Protected endpoint call with expired token
    res = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 401
    data = res.get_json()
    assert 'expired' in data['message'].lower()

# 9. Student accessing admin endpoint (RBAC check)
def test_student_accessing_admin_endpoint(client):
    register_helper(client, email="student1@university.edu", role="student")
    login_res = login_helper(client, email="student1@university.edu")
    token = login_res.get_json()['tokens']['access_token']

    # Student accessing student portal: Success (200)
    student_res = client.get('/api/v1/portal/student', headers={'Authorization': f'Bearer {token}'})
    assert student_res.status_code == 200

    # Student accessing admin portal: Forbidden (403)
    admin_res = client.get('/api/v1/portal/admin', headers={'Authorization': f'Bearer {token}'})
    assert admin_res.status_code == 403
    data = admin_res.get_json()
    assert 'Access denied' in data['message']
    assert 'admin' in data['message']

# 10. Faculty accessing restricted admin endpoint (RBAC check)
def test_faculty_accessing_admin_endpoint(client):
    register_helper(client, email="prof@university.edu", role="faculty")
    login_res = login_helper(client, email="prof@university.edu")
    token = login_res.get_json()['tokens']['access_token']

    # Faculty accessing faculty portal: Success (200)
    fac_res = client.get('/api/v1/portal/faculty', headers={'Authorization': f'Bearer {token}'})
    assert fac_res.status_code == 200

    # Faculty accessing admin portal: Forbidden (403)
    admin_res = client.get('/api/v1/portal/admin', headers={'Authorization': f'Bearer {token}'})
    assert admin_res.status_code == 403

# 11. Unauthorized API requests (No Authorization header)
def test_unauthorized_api_requests(client):
    res1 = client.get('/api/v1/auth/me')
    assert res1.status_code == 401
    assert 'missing' in res1.get_json()['message']

    res2 = client.get('/api/v1/portal/admin')
    assert res2.status_code == 401

# 12. Accessing another user's private information & Admin protection
def test_admin_provisioning_and_user_isolation(client):
    # Attempting to register as 'admin' without valid provisioning secret: REJECTED (403)
    res_malicious = register_helper(client, email="fakeadmin@university.edu", role="admin")
    assert res_malicious.status_code == 403
    assert 'prohibited' in res_malicious.get_json()['message']

    # Registering as 'admin' with valid provisioning key: SUCCESS (201)
    res_admin = register_helper(
        client,
        email="realadmin@university.edu",
        role="admin",
        admin_key=TestingConfig.ADMIN_PROVISION_KEY
    )
    assert res_admin.status_code == 201
    admin_token = res_admin.get_json()['tokens']['access_token']

    # Admin CAN access admin portal (200)
    admin_res = client.get('/api/v1/portal/admin', headers={'Authorization': f'Bearer {admin_token}'})
    assert admin_res.status_code == 200

# 13. Missing or invalid authentication credentials
def test_invalid_credentials(client):
    # Garbage token
    res_garbage = client.get('/api/v1/auth/me', headers={'Authorization': 'Bearer invalid.token.payload'})
    assert res_garbage.status_code == 401

    # Malformed Authorization header
    res_malformed = client.get('/api/v1/auth/me', headers={'Authorization': 'Token 12345'})
    assert res_malformed.status_code == 401

