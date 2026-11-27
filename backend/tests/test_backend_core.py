import pytest
import json

def register_and_login(client, email, role="student", name="Test User", password="Password123!"):
    """Helper to register and login a user, returning access token and user dict."""
    reg_payload = {
        "full_name": name,
        "email": email,
        "password": password,
        "confirm_password": password,
        "role": role,
        "department": "Computer Science"
    }
    headers = {}
    if role == "admin":
        headers["X-Admin-Provision-Key"] = "sovereign-admin-provision-token-26O2227"

    reg_res = client.post("/api/auth/register", json=reg_payload, headers=headers)
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.get_json()}"
    reg_data = reg_res.get_json()
    token = reg_data["tokens"]["access_token"]
    user = reg_data["user"]
    return token, user

def test_unversioned_auth_flow(client):
    """Verify /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/logout."""
    # 1. Register
    token, user = register_and_login(client, "alice.test@university.edu", "student", "Alice")
    assert user["email"] == "alice.test@university.edu"

    # 2. GET /api/auth/me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.get_json()
    assert me_data["user"]["email"] == "alice.test@university.edu"

    # 3. POST /api/auth/login
    login_res = client.post("/api/auth/login", json={
        "email": "alice.test@university.edu",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    login_data = login_res.get_json()
    assert "access_token" in login_data["tokens"]

    # 4. POST /api/auth/logout
    logout_res = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_res.status_code == 200

def test_users_api_crud_and_permissions(client):
    """Verify GET, GET/<id>, PUT/<id>, DELETE/<id> on /api/users with RBAC."""
    admin_token, admin_user = register_and_login(client, "admin.core@university.edu", "admin", "Admin Core")
    student_token, student_user = register_and_login(client, "student.core@university.edu", "student", "Student Core")

    # 1. Non-admin student listing users -> 403 Forbidden
    res = client.get("/api/users", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403

    # 2. Admin listing users -> 200 OK
    res = client.get("/api/users?limit=10", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["data"]["users"]) >= 2

    # 3. Student accessing their own record -> 200 OK
    res = client.get(f"/api/users/{student_user['id']}", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200

    # 4. Student accessing another user's record -> 403 Forbidden
    res = client.get(f"/api/users/{admin_user['id']}", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403

    # 5. Student updating their own department -> 200 OK
    res = client.put(f"/api/users/{student_user['id']}", json={"department": "Electrical Engineering"}, headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    assert res.get_json()["data"]["department"] == "Electrical Engineering"

    # 6. Student trying to delete user -> 403 Forbidden
    res = client.delete(f"/api/users/{student_user['id']}", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403

    # 7. Admin deleting student user -> 200 OK
    res = client.delete(f"/api/users/{student_user['id']}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200

    # 8. Admin deleting non-existent user -> 404 Not Found
    res = client.delete("/api/users/nonexistent_id", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 404

def test_resources_api_crud(client):
    """Verify /api/resources CRUD operations."""
    admin_token, _ = register_and_login(client, "faculty.res@university.edu", "faculty", "Faculty Res")

    # 1. GET /api/resources
    res = client.get("/api/resources")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "resources" in data["data"]

    # 2. POST /api/resources
    new_res_payload = {
        "title": "Quantum Computing Principles",
        "description": "Comprehensive course on qubits and quantum algorithms.",
        "category": "Physics",
        "department": "Physics & Engineering",
        "format": "PDF",
        "tags": ["Quantum", "Physics"]
    }
    create_res = client.post("/api/resources", json=new_res_payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert create_res.status_code == 201
    created_id = create_res.get_json()["data"]["id"]

    # 3. GET /api/resources/<id>
    get_res = client.get(f"/api/resources/{created_id}")
    assert get_res.status_code == 200
    assert get_res.get_json()["data"]["title"] == "Quantum Computing Principles"

    # 4. PUT /api/resources/<id>
    update_res = client.put(f"/api/resources/{created_id}", json={"rating": 4.9}, headers={"Authorization": f"Bearer {admin_token}"})
    assert update_res.status_code == 200

    # 5. Non-existent resource GET -> 404
    missing_res = client.get("/api/resources/res_invalid_999999")
    assert missing_res.status_code == 404

def test_events_and_services_api_crud(client):
    """Verify /api/events and /api/services CRUD endpoints."""
    admin_token, _ = register_and_login(client, "admin.events@university.edu", "admin", "Admin Evt")

    # 1. Event CRUD
    evt_payload = {
        "title": "Cybersecurity Frontiers Conference 2026",
        "description": "Annual university security convention.",
        "category": "Conference",
        "date": "2026-11-28",
        "time": "09:00 - 17:00",
        "location": "Auditorium Hall A",
        "is_virtual": False
    }
    create_evt = client.post("/api/events", json=evt_payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert create_evt.status_code == 201
    evt_id = create_evt.get_json()["data"]["id"]

    get_evt = client.get(f"/api/events/{evt_id}")
    assert get_evt.status_code == 200

    del_evt = client.delete(f"/api/events/{evt_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert del_evt.status_code == 200

    # 2. Service CRUD
    srv_payload = {
        "name": "Graduate Career Enclave",
        "description": "Resume advising and interview coaching.",
        "category": "Career Services",
        "location": "Student Union 305",
        "confidentiality_tier": "FERPA Compliant"
    }
    create_srv = client.post("/api/services", json=srv_payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert create_srv.status_code == 201
    srv_id = create_srv.get_json()["data"]["id"]

    get_srv = client.get(f"/api/services/{srv_id}")
    assert get_srv.status_code == 200

    del_srv = client.delete(f"/api/services/{srv_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert del_srv.status_code == 200

def test_recommendations_and_privacy_apis(client):
    """Verify /api/recommendations and /api/privacy endpoints."""
    student_token, student_user = register_and_login(client, "student.rec2@university.edu", "student", "Rec Student")

    # 1. GET /api/recommendations
    recs_res = client.get("/api/recommendations", headers={"Authorization": f"Bearer {student_token}"})
    assert recs_res.status_code == 200
    recs_data = recs_res.get_json()
    assert recs_data["success"] is True
    assert len(recs_data["data"]["recommendations"]) > 0

    first_item_id = recs_data["data"]["recommendations"][0]["item_id"]

    # 2. GET /api/recommendations/<id>
    rec_item_res = client.get(f"/api/recommendations/{first_item_id}", headers={"Authorization": f"Bearer {student_token}"})
    assert rec_item_res.status_code == 200
    assert rec_item_res.get_json()["data"]["item_id"] == first_item_id

    # 3. POST /api/recommendations (submitting feedback)
    feedback_res = client.post("/api/recommendations", json={
        "item_id": first_item_id,
        "item_type": "resource",
        "feedback": "useful",
        "title": "Quantum Principles"
    }, headers={"Authorization": f"Bearer {student_token}"})
    assert feedback_res.status_code == 200

    # 4. GET /api/privacy/status
    priv_status_res = client.get("/api/privacy/status", headers={"Authorization": f"Bearer {student_token}"})
    assert priv_status_res.status_code == 200
    priv_data = priv_status_res.get_json()["data"]
    assert "homomorphic_encryption" in priv_data
    assert "multi_party_computation" in priv_data

    # 5. POST /api/privacy/operations/simulate
    sim_res = client.post("/api/privacy/operations/simulate", json={
        "operation_type": "HE_NOISE_PERTURBATION",
        "vector": [0.8, 0.9, 0.7],
        "epsilon": 0.5
    }, headers={"Authorization": f"Bearer {student_token}"})
    assert sim_res.status_code == 201

    # 6. GET /api/privacy/operations
    ops_res = client.get("/api/privacy/operations", headers={"Authorization": f"Bearer {student_token}"})
    assert ops_res.status_code == 200
    assert len(ops_res.get_json()["data"]["operations"]) >= 1

def test_admin_api_endpoints(client):
    """Verify /api/admin/overview, /api/admin/audit-logs, and /api/admin/system-status."""
    admin_token, _ = register_and_login(client, "admin.system@university.edu", "admin", "Admin System")

    # 1. GET /api/admin/overview
    overview_res = client.get("/api/admin/overview", headers={"Authorization": f"Bearer {admin_token}"})
    assert overview_res.status_code == 200
    overview_data = overview_res.get_json()
    assert "users" in overview_data["stats"]

    # 2. GET /api/admin/system-status
    sys_status_res = client.get("/api/admin/system-status", headers={"Authorization": f"Bearer {admin_token}"})
    assert sys_status_res.status_code == 200
    sys_data = sys_status_res.get_json()
    assert "authentication" in sys_data["security_status"]

    # 3. GET /api/admin/audit-logs
    audit_res = client.get("/api/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert audit_res.status_code == 200
    assert "logs" in audit_res.get_json()

def test_validation_and_invalid_requests(client):
    """Test input validation, invalid JSON, and unauthorized access."""
    # 1. Invalid JSON body
    res = client.post("/api/auth/register", data="not json", content_type="application/json")
    assert res.status_code == 400

    # 2. Missing password
    res = client.post("/api/auth/register", json={"email": "incomplete@univ.edu", "full_name": "Test"})
    assert res.status_code == 400

    # 3. Weak password rejection
    res = client.post("/api/auth/register", json={
        "email": "weak@univ.edu",
        "full_name": "Weak User",
        "password": "123",
        "confirm_password": "123"
    })
    assert res.status_code == 400

    # 4. Unauthorized access to protected route
    res = client.get("/api/auth/me")
    assert res.status_code == 401

    # 5. Invalid token
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.value"})
    assert res.status_code == 401
