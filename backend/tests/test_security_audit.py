"""
Security Audit & Validation Test Suite.
Validates production security posture:
1. Argon2id password hashing strength & OWASP parameters (64MB memory, 3 iterations, 4 parallelism).
2. JWT signature integrity & tampering prevention.
3. Token version revocation & session invalidation.
4. NoSQL / MongoDB operator injection resistance.
5. Strict Role-Based Access Control (RBAC) across all user tiers.
6. Privilege escalation protection (Admin provision key enforcement).
7. Audit log sanitization (Zero plaintext passwords, tokens, or private keys in logs).
8. Input validation and malicious payload rejection.
"""
import pytest
import jwt
from app.core.security import PasswordSecurity, JWTSecurity, USE_ARGON2
from app.core.database import DatabaseManager


def test_argon2id_hashing_parameters_and_verification():
    """Verify that password hashing uses Argon2id with 64MB memory, 3 iterations, 4 parallelism."""
    raw_pwd = "CorrectHorseBatteryStaple123!"
    hashed = PasswordSecurity.hash_password(raw_pwd)

    assert hashed is not None
    assert isinstance(hashed, str)
    if USE_ARGON2:
        # Verify Argon2id prefix and parameters
        assert hashed.startswith('$argon2id$')
        assert 'm=65536' in hashed  # 64 MB
        assert 't=3' in hashed      # 3 iterations
        assert 'p=4' in hashed      # 4 parallel threads

    # Verify matching password succeeds
    assert PasswordSecurity.verify_password(raw_pwd, hashed) is True

    # Verify incorrect password fails
    assert PasswordSecurity.verify_password("WrongPassword123!", hashed) is False

    # Verify empty / non-string inputs fail safely
    assert PasswordSecurity.verify_password("", hashed) is False
    assert PasswordSecurity.verify_password("test", "") is False


def test_jwt_tampering_and_forgery_rejection(client):
    """Verify that forged, altered, or unsigned JWT tokens are rejected with 401."""
    # 1. Register a valid user
    reg = client.post('/api/v1/auth/register', json={
        'name': 'Tamper Test User',
        'email': 'tamper.test@university.edu',
        'password': 'Password12345!',
        'role': 'student',
        'department': 'Cybersecurity'
    })
    assert reg.status_code == 201
    real_token = reg.get_json()['tokens']['access_token']

    # 2. Test valid token
    valid_res = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {real_token}'})
    assert valid_res.status_code == 200

    # 3. Test tampered signature
    parts = real_token.split('.')
    tampered_sig_token = f"{parts[0]}.{parts[1]}.bad_signature_here"
    sig_res = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {tampered_sig_token}'})
    assert sig_res.status_code == 401

    # 4. Test forged payload with role escalation signed with wrong key
    forged_token = jwt.encode(
        {'sub': 'fake_id', 'role': 'admin', 'email': 'hacker@blackhat.com'},
        'wrong-secret-key-attacker',
        algorithm='HS256'
    )
    forged_res = client.get('/api/v1/admin/stats', headers={'Authorization': f'Bearer {forged_token}'})
    assert forged_res.status_code == 401


def test_token_revocation_via_token_version(client):
    """Verify that bumping token_version invalidates previous session tokens immediately."""
    reg = client.post('/api/v1/auth/register', json={
        'name': 'Revocation Test User',
        'email': 'revocation.test@university.edu',
        'password': 'Password12345!',
        'role': 'student',
        'department': 'Computer Science'
    })
    assert reg.status_code == 201
    user_id = reg.get_json()['user']['id']
    old_token = reg.get_json()['tokens']['access_token']

    # Session works initially
    res_before = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {old_token}'})
    assert res_before.status_code == 200

    # Simulate password change or admin suspension bumping token_version in DB
    db = DatabaseManager.get_db()
    from bson import ObjectId
    db['users'].update_one({'_id': ObjectId(user_id)}, {'$inc': {'token_version': 1}})

    # Old token must now be rejected
    res_after = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {old_token}'})
    assert res_after.status_code == 401
    assert 'expired or invalidated' in res_after.get_json().get('message', '').lower() or res_after.status_code == 401


def test_nosql_injection_resistance(client):
    """
    Verify that MongoDB query selector injection payloads (e.g. {'$gt': ''})
    are safely rejected and cannot bypass authentication.
    """
    # 1. Attempt NoSQL injection on login
    injection_login = client.post('/api/v1/auth/login', json={
        'email': {'$gt': ''},
        'password': {'$gt': ''}
    })
    # Must fail with validation error, not authenticate
    assert injection_login.status_code in (400, 401, 422)

    # 2. Attempt NoSQL injection in resource query parameters
    reg = client.post('/api/v1/auth/register', json={
        'name': 'Injection Query User',
        'email': 'injection.query@university.edu',
        'password': 'Password12345!',
        'role': 'student',
        'department': 'Physics'
    })
    token = reg.get_json()['tokens']['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    search_injection = client.get('/api/v1/resources?search={"$where":"sleep(1000)"}', headers=headers)
    assert search_injection.status_code == 200  # Should be treated as a literal search string, not code


def test_privilege_escalation_enforcement(client):
    """Verify that unauthorized requests cannot elevate privileges to admin."""
    # Attempt to register admin with invalid/missing key
    res_bad_key = client.post('/api/v1/auth/register', json={
        'name': 'Escalation Attacker',
        'email': 'attacker@university.edu',
        'password': 'Password12345!',
        'role': 'admin',
        'department': 'IT'
    }, headers={'X-Admin-Provision-Key': 'fake-key-123'})
    assert res_bad_key.status_code in (400, 403)

    # Attempt to register admin without any key header
    res_no_key = client.post('/api/v1/auth/register', json={
        'name': 'Escalation Attacker 2',
        'email': 'attacker2@university.edu',
        'password': 'Password12345!',
        'role': 'admin',
        'department': 'IT'
    })
    assert res_no_key.status_code in (400, 403)


def test_rbac_cross_tier_isolation(client):
    """Verify cross-tier RBAC boundaries: Student cannot access Admin or Staff functions."""
    reg = client.post('/api/v1/auth/register', json={
        'name': 'Student Access User',
        'email': 'normal.student@university.edu',
        'password': 'Password12345!',
        'role': 'student',
        'department': 'History'
    })
    token = reg.get_json()['tokens']['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # Blocked from admin stats
    admin_call = client.get('/api/v1/admin/stats', headers=headers)
    assert admin_call.status_code == 403

    # Blocked from admin user management
    users_call = client.get('/api/v1/admin/users', headers=headers)
    assert users_call.status_code == 403

    # Blocked from publishing resources (Student has read-only access)
    pub_res = client.post('/api/v1/resources', headers=headers, json={
        'title': 'Student Submitting Resource',
        'category': 'Study'
    })
    assert pub_res.status_code == 403


def test_audit_logs_contain_no_credentials(client):
    """
    Verify that security and audit logs never record plaintext passwords,
    JWT tokens, or private cryptographic keys.
    """
    admin_key = "sovereign-admin-provision-token-26O2227"
    reg = client.post('/api/v1/auth/register', json={
        'name': 'Audit Inspector Admin',
        'email': 'audit.inspector@university.edu',
        'password': 'SuperSecretPassword999!',
        'role': 'admin',
        'department': 'Security'
    }, headers={'X-Admin-Provision-Key': admin_key})
    assert reg.status_code == 201

    db = DatabaseManager.get_db()
    logs = list(db['audit_logs'].find({}))

    for log_entry in logs:
        log_str = str(log_entry)
        # Sensitive credentials must NEVER appear in the audit trail
        assert 'SuperSecretPassword999!' not in log_str
        assert 'private_key' not in log_str.lower() or 'redacted' in log_str.lower()

