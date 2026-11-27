import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "FastAPI" in data["service"]


def test_hybrid_browser_extension_action():
    # Test JSONP call with callback parameter
    cb_name = "__cb__zybTrackerStatisticsAction__0c542d86"
    resp = client.get(f"/hybridaction/zybTrackerStatisticsAction?data=%7B%7D&__callback__={cb_name}")
    assert resp.status_code == 200
    assert cb_name in resp.text
    assert "application/javascript" in resp.headers["content-type"]

    # Test plain GET call without callback
    resp_plain = client.get("/hybridaction/zybTrackerStatisticsAction")
    assert resp_plain.status_code == 200


def test_auth_demo_login_and_me():
    # 1. Login with seeded student demo persona
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "student.test@university.edu",
        "password": "DemoPassword2026!"
    })
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "tokens" in login_data
    token = login_data["tokens"]["access_token"]
    assert token is not None

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test /me
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["user"]["email"] == "student.test@university.edu"
    assert me_data["user"]["role"] == "student"


def test_catalog_endpoints():
    # 1. Resources
    res_resp = client.get("/api/v1/resources")
    assert res_resp.status_code == 200
    res_data = res_resp.json()
    assert res_data["total"] >= 8
    assert len(res_data["resources"]) >= 8

    # 2. Events
    evt_resp = client.get("/api/v1/events")
    assert evt_resp.status_code == 200
    evt_data = evt_resp.json()
    assert evt_data["total"] >= 4

    # 3. Services
    srv_resp = client.get("/api/v1/services")
    assert srv_resp.status_code == 200
    srv_data = srv_resp.json()
    assert srv_data["total"] >= 5


def test_recommendations_and_feedback():
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "student.test@university.edu",
        "password": "DemoPassword2026!"
    })
    token = login_resp.json()["tokens"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Recommendations
    rec_resp = client.get("/api/v1/recommendations/student", headers=headers)
    assert rec_resp.status_code == 200
    rec_data = rec_resp.json()
    assert "recommendations" in rec_data
    assert len(rec_data["recommendations"]) > 0
    assert rec_data["recommender_metadata"]["student_department"] == "Computer Science"

    # Feedback
    fb_resp = client.post("/api/v1/recommendations/feedback", json={
        "item_id": "res_crypto_01",
        "item_type": "resource",
        "feedback": "useful",
        "title": "CS301 Cryptography",
        "category": "study-materials"
    }, headers=headers)
    assert fb_resp.status_code == 200


def test_privacy_and_cryptography():
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "student.test@university.edu",
        "password": "DemoPassword2026!"
    })
    token = login_resp.json()["tokens"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Status
    st_resp = client.get("/api/v1/privacy/status", headers=headers)
    assert st_resp.status_code == 200
    st_data = st_resp.json()
    assert "homomorphic_encryption" in st_data["privacy_status"]
    assert "multi_party_computation" in st_data["privacy_status"]

    # Encrypt & Decrypt
    enc_resp = client.post("/api/v1/privacy/encrypt", json={"vector": [0.85, 0.42, 0.91, 0.12]}, headers=headers)
    assert enc_resp.status_code == 200
    enc_data = enc_resp.json()
    assert "ciphertext" in enc_data

    dec_resp = client.post("/api/v1/privacy/decrypt", json={"ciphertext": enc_data["ciphertext"]}, headers=headers)
    assert dec_resp.status_code == 200
    dec_data = dec_resp.json()
    assert "decrypted_vector" in dec_data
    assert len(dec_data["decrypted_vector"]) == 4

    # MPC Share
    mpc_resp = client.post("/api/v1/privacy/mpc/share", json={"value": 42.0, "num_parties": 3}, headers=headers)
    assert mpc_resp.status_code == 200
    shares = mpc_resp.json()["shares"]
    assert len(shares) == 3
    assert abs(sum(shares) - 42.0) < 1e-4


def test_admin_control_center():
    # Login as admin
    admin_login = client.post("/api/v1/auth/login", json={
        "email": "root.admin@university.edu",
        "password": "DemoPassword2026!"
    })
    assert admin_login.status_code == 200
    token = admin_login.json()["tokens"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Stats
    stats_resp = client.get("/api/v1/admin/stats", headers=headers)
    assert stats_resp.status_code == 200
    stats_data = stats_resp.json()
    assert stats_data["stats"]["users"]["admins"] >= 1
    assert stats_data["stats"]["resources"]["total"] >= 8

    # Security Center
    sec_resp = client.get("/api/v1/admin/security/status", headers=headers)
    assert sec_resp.status_code == 200
    sec_data = sec_resp.json()
    assert sec_data["security_status"]["authentication"]["algorithm"].startswith("Argon2id")
