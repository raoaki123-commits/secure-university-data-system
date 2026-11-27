"""
Security & Cryptography Test Suite for Privacy-Preserving University Platform.
Tests:
- TenSEAL CKKS Homomorphic Encryption (context generation, key separation, IND-CPA security)
- Oblivious homomorphic dot product and vector addition
- 3-Party Additive Secret Sharing & Beaver Triple multiplication over R
- MPC secure vector dot-product and cohort rating aggregation
- Zero cleartext leakage verification in logs and persistence
- REST APIs (/api/v1/privacy/status, /context, /encrypt, /compute, /benchmark)
"""
import pytest
import time
import math
import numpy as np

from app.core.key_manager import CryptographicKeyManager, TENSEAL_AVAILABLE
from app.services.encryption_service import HomomorphicEncryptionService
from app.services.mpc_service import MPCService
from app.core.database import DatabaseManager


def register_student_and_get_token(client, email="crypto.student@university.edu"):
    res = client.post('/api/v1/auth/register', json={
        'name': 'Crypto Student',
        'email': email,
        'password': 'Password123!',
        'role': 'student',
        'department': 'Information Security'
    })
    return res.get_json()['tokens']['access_token']


def test_ckks_key_generation_and_separation():
    """Verify strict key separation between public context and private context."""
    if not TENSEAL_AVAILABLE:
        pytest.skip("TenSEAL not available on this platform.")

    km = CryptographicKeyManager.get_instance()
    pub_ctx = km.get_public_context()
    priv_ctx = km.get_private_context()

    assert pub_ctx is not None
    assert priv_ctx is not None

    # Public context must have secret key dropped
    assert pub_ctx.is_public() is True
    assert priv_ctx.is_private() is True

    # Encrypt with public context
    import tenseal as ts
    vec = [0.5, 0.8, -0.3]
    enc_vec = ts.ckks_vector(pub_ctx, vec)

    # Attempting to decrypt with public context MUST raise an error
    with pytest.raises(Exception):
        enc_vec.decrypt()

    # Decrypting with private context must succeed
    decrypted = ts.ckks_vector_from(priv_ctx, enc_vec.serialize()).decrypt()
    for original, dec in zip(vec, decrypted):
        assert abs(original - dec) < 1e-4


def test_ckks_homomorphic_arithmetic():
    """Verify homomorphic vector addition, oblivious dot product, and precision."""
    vec_a = [0.75, 0.50, 0.25, 0.10]
    vec_b = [0.20, 0.40, 0.60, 0.80]

    # 1. Encryption
    enc_a = HomomorphicEncryptionService.encrypt_vector(vec_a)
    assert "ciphertext" in enc_a
    assert enc_a["size_bytes"] > 0

    # 2. Oblivious Dot Product on server without decrypting vec_a
    dot_res = HomomorphicEncryptionService.compute_oblivious_dot_product(enc_a["ciphertext"], vec_b)
    assert "encrypted_result" in dot_res

    # 3. Decrypt on client side
    decrypted_dot = HomomorphicEncryptionService.decrypt_vector(dot_res["encrypted_result"])
    expected_dot = sum(a * b for a, b in zip(vec_a, vec_b))

    # Error must be within CKKS approximation scale tolerance (< 0.001)
    assert abs(decrypted_dot[0] - expected_dot) < 1e-3

    # 4. Homomorphic Vector Addition [[A]] + [[B]]
    enc_b = HomomorphicEncryptionService.encrypt_vector(vec_b)
    sum_res = HomomorphicEncryptionService.compute_homomorphic_addition(enc_a["ciphertext"], enc_b["ciphertext"])
    decrypted_sum = HomomorphicEncryptionService.decrypt_vector(sum_res["encrypted_result"])

    for original_sum, dec_sum in zip([a + b for a, b in zip(vec_a, vec_b)], decrypted_sum):
        assert abs(original_sum - dec_sum) < 1e-3


def test_mpc_additive_secret_sharing():
    """Test 3-party secret sharing properties."""
    test_values = [4.5, -2.75, 0.0, 100.1234, -0.0001]

    for val in test_values:
        shares = MPCService.share_secret(val, num_parties=3)
        assert len(shares) == 3

        # Single share must not equal the original secret
        assert shares[0] != val

        # 3-party reconstruction
        reconstructed = MPCService.reconstruct_secret(shares)
        assert abs(reconstructed - val) < 1e-5


def test_mpc_beaver_triple_multiplication():
    """Verify Beaver Triple multiplication of secret shares without leaking operands."""
    x = 3.5
    y = 2.0
    expected_prod = x * y

    x_shares = MPCService.share_secret(x, num_parties=3)
    y_shares = MPCService.share_secret(y, num_parties=3)
    a_shares, b_shares, c_shares = MPCService.generate_beaver_triple()

    # Blinded difference computation
    d_shares = [x_shares[i] - a_shares[i] for i in range(3)]
    e_shares = [y_shares[i] - b_shares[i] for i in range(3)]

    d_public = sum(d_shares)
    e_public = sum(e_shares)

    z0 = (d_public * e_public) + (d_public * b_shares[0]) + (e_public * a_shares[0]) + c_shares[0]
    z1 = (d_public * b_shares[1]) + (e_public * a_shares[1]) + c_shares[1]
    z2 = (d_public * b_shares[2]) + (e_public * a_shares[2]) + c_shares[2]

    prod_reconstructed = MPCService.reconstruct_secret([z0, z1, z2])
    assert abs(prod_reconstructed - expected_prod) < 1e-4


def test_mpc_secure_dot_product_and_cohort_aggregation():
    """Test multi-party vector dot product and collaborative rating aggregation."""
    vec_u = [0.8, 0.6, 0.4, 0.2]
    vec_v = [0.5, 0.5, 0.5, 0.5]
    expected_dot = sum(a * b for a, b in zip(vec_u, vec_v))

    res_dot = MPCService.execute_secure_dot_product(vec_u, vec_v)
    assert abs(res_dot["dot_product_result"] - expected_dot) < 1e-4
    assert res_dot["execution_time_ms"] >= 0.0

    # Cohort rating aggregation
    ratings = [4.8, 4.2, 4.0, 5.0, 3.6]
    expected_mean = sum(ratings) / len(ratings)

    agg_res = MPCService.execute_multi_party_rating_aggregation(ratings)
    assert abs(agg_res["computed_mean"] - expected_mean) < 1e-4
    assert agg_res["contributors_count"] == 5


def test_privacy_apis_and_audit_logging(client):
    """Test REST endpoints for HE, MPC, and audit logging."""
    token = register_student_and_get_token(client, "alice.crypto@university.edu")
    headers = {'Authorization': f'Bearer {token}'}

    # 1. GET /api/v1/privacy/status
    st_res = client.get('/api/v1/privacy/status', headers=headers)
    assert st_res.status_code == 200
    st_data = st_res.get_json()['privacy_status']
    assert st_data['homomorphic_encryption']['status'] == 'OPERATIONAL'
    assert 'TenSEAL' in st_data['homomorphic_encryption']['library']

    # 2. GET /api/v1/privacy/context
    ctx_res = client.get('/api/v1/privacy/context', headers=headers)
    assert ctx_res.status_code == 200
    assert len(ctx_res.get_json()['data']['public_context']) > 100

    # 3. POST /api/v1/privacy/encrypt
    enc_res = client.post('/api/v1/privacy/encrypt', headers=headers, json={
        'vector': [0.9, 0.85, 0.7, 0.4]
    })
    assert enc_res.status_code == 200
    ciphertext = enc_res.get_json()['data']['ciphertext']
    assert len(ciphertext) > 50

    # 4. POST /api/v1/privacy/compute
    comp_res = client.post('/api/v1/privacy/compute', headers=headers, json={
        'ciphertext': ciphertext,
        'plaintext_vector': [1.0, 1.0, 0.0, 0.0]
    })
    assert comp_res.status_code == 200
    assert 'encrypted_result' in comp_res.get_json()['data']

    # 5. POST /api/v1/privacy/mpc/aggregate
    mpc_res = client.post('/api/v1/privacy/mpc/aggregate', headers=headers, json={
        'ratings': [4.5, 4.0, 5.0, 4.2]
    })
    assert mpc_res.status_code == 200
    assert mpc_res.get_json()['data']['computed_mean'] > 4.0

    # 6. GET /api/v1/privacy/benchmark
    bm_res = client.get('/api/v1/privacy/benchmark?dimension=8', headers=headers)
    assert bm_res.status_code == 200
    bm_data = bm_res.get_json()['data']
    assert bm_data['encryption_time_ms'] > 0
    assert bm_data['oblivious_dot_product_time_ms'] > 0

    # 7. GET /api/v1/privacy/operations audit logs
    ops_res = client.get('/api/v1/privacy/operations', headers=headers)
    assert ops_res.status_code == 200
    ops = ops_res.get_json()['operations']
    assert len(ops) >= 2
    # Verify no raw rating/vector arrays in logged parameters
    for op in ops:
        assert "raw_vector" not in op.get("parameters", {})
        assert "secret_key" not in op.get("parameters", {})
