"""
Cryptographic Performance Benchmark Script.
Executes real wall-clock measurements for:
- TenSEAL CKKS 128-bit Homomorphic Encryption (N=8192, coeff_mod=[60, 40, 40, 60], scale=2^40)
- 3-Party Semi-Honest Additive Secret Sharing with Beaver Triples over R
- Plaintext float64 baseline comparisons for dot products and cohort aggregations
"""
import time
import json
import os
import numpy as np

from app import create_app
from app.config import TestingConfig
from app.core.key_manager import CryptographicKeyManager
from app.services.encryption_service import HomomorphicEncryptionService
from app.services.mpc_service import MPCService


def run_benchmark():
    app = create_app(TestingConfig)
    with app.app_context():
        results = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "security_level": "128-bit post-quantum IND-CPA",
            "parameters": {
                "he_scheme": "CKKS (Microsoft SEAL via TenSEAL 0.3.18)",
                "poly_modulus_degree": 8192,
                "coeff_mod_bit_sizes": [60, 40, 40, 60],
                "scaling_factor": "2^40",
                "mpc_protocol": "3-Party Additive Secret Sharing with Beaver Triples over R",
                "mpc_parties": 3,
                "csprng_entropy_bits": 128
            },
            "he_benchmarks": {},
            "mpc_benchmarks": {},
            "comparative_analysis": {},
            "storage_footprint": {}
        }

        print("Running TenSEAL CKKS benchmarks...")
        for dim in [8, 16, 32]:
            he_res = HomomorphicEncryptionService.benchmark_operations(vector_dim=dim)
            
            # Measure plaintext numpy dot product baseline
            u = np.random.uniform(0.1, 1.0, dim)
            v = np.random.uniform(0.1, 1.0, dim)
            t0 = time.perf_counter()
            for _ in range(1000):
                _ = float(np.dot(u, v))
            pt_dot_ms = ((time.perf_counter() - t0) / 1000.0) * 1000.0
            
            he_res["plaintext_baseline_dot_ms"] = round(pt_dot_ms, 6)
            he_res["he_overhead_multiplier"] = round(he_res["oblivious_dot_product_time_ms"] / max(pt_dot_ms, 1e-6), 1)
            results["he_benchmarks"][f"dim_{dim}"] = he_res
            
            print(f"  HE Dim {dim}: Enc={he_res['encryption_time_ms']}ms, DotProduct={he_res['oblivious_dot_product_time_ms']}ms, Dec={he_res['decryption_time_ms']}ms, CiphertextBytes={he_res['ciphertext_size_bytes']}, AbsError={he_res['absolute_error']}")

        # Measure homomorphic addition
        v1 = [float(x) for x in np.random.uniform(0.1, 1.0, 16)]
        v2 = [float(x) for x in np.random.uniform(0.1, 1.0, 16)]
        c1 = HomomorphicEncryptionService.encrypt_vector(v1)
        c2 = HomomorphicEncryptionService.encrypt_vector(v2)
        t0 = time.perf_counter()
        c_sum = HomomorphicEncryptionService.compute_homomorphic_addition(c1["ciphertext"], c2["ciphertext"])
        t_add = (time.perf_counter() - t0) * 1000.0
        results["he_benchmarks"]["homomorphic_addition_16dim_ms"] = round(t_add, 3)
        print(f"  HE Addition (16-dim): {round(t_add, 3)}ms")

        # 2. MPC Benchmarks
        print("\nRunning MPC benchmarks...")
        for dim in [8, 16, 32]:
            u = [float(x) for x in np.random.uniform(0.1, 1.0, dim)]
            v = [float(x) for x in np.random.uniform(0.1, 1.0, dim)]
            mpc_dot = MPCService.execute_secure_dot_product(u, v)
            
            expected_dot = sum(a * b for a, b in zip(u, v))
            results["mpc_benchmarks"][f"dot_product_dim_{dim}"] = {
                "vector_dimension": dim,
                "execution_time_ms": mpc_dot["execution_time_ms"],
                "communication_rounds": 2,  # 1 round offline triples + 1 round online exchange
                "network_payload_bytes": dim * 3 * 8,  # 3 parties x 8-byte float64 per dimension
                "numerical_precision_error": abs(mpc_dot["dot_product_result"] - expected_dot),
                "dot_product_result": round(mpc_dot["dot_product_result"], 5)
            }
            print(f"  MPC Dot Dim {dim}: Time={mpc_dot['execution_time_ms']}ms, Payload={dim * 3 * 8} bytes, PrecisionErr={abs(mpc_dot['dot_product_result'] - expected_dot):.2e}")

        # Cohort rating aggregation benchmarks across group sizes
        print("\nRunning Cohort MPC Rating Aggregation...")
        for cohort_size in [5, 25, 100]:
            ratings = [round(float(x), 2) for x in np.random.uniform(2.5, 5.0, cohort_size)]
            agg_res = MPCService.execute_multi_party_rating_aggregation(ratings)
            expected_mean = sum(ratings) / len(ratings)
            results["mpc_benchmarks"][f"cohort_aggregation_n_{cohort_size}"] = {
                "cohort_size": cohort_size,
                "execution_time_ms": agg_res["execution_time_ms"],
                "contributors_count": agg_res["contributors_count"],
                "total_shares_processed": cohort_size * 3,
                "computed_mean": round(agg_res["computed_mean"], 4),
                "expected_mean": round(expected_mean, 4),
                "numerical_precision_error": abs(agg_res["computed_mean"] - expected_mean)
            }
            print(f"  MPC Cohort N={cohort_size}: Time={agg_res['execution_time_ms']}ms, Mean={agg_res['computed_mean']}, Error={abs(agg_res['computed_mean'] - expected_mean):.2e}")

        # 3. Context and Key Storage Footprint
        pub_ctx_b64 = HomomorphicEncryptionService.get_public_context_base64()
        results["storage_footprint"] = {
            "ckks_public_context_bytes": len(pub_ctx_b64) * 3 // 4 if pub_ctx_b64 else 0,
            "ckks_public_context_base64_chars": len(pub_ctx_b64) if pub_ctx_b64 else 0,
            "ciphertext_16dim_bytes": results["he_benchmarks"]["dim_16"]["ciphertext_size_bytes"],
            "mpc_additive_share_bytes_per_value": 24  # 3 parties x 8-byte float64
        }

        os.makedirs("docs", exist_ok=True)
        with open("docs/crypto_benchmark_results.json", "w") as f:
            json.dump(results, f, indent=2)

        print("\nBENCHMARK COMPLETE. Saved to docs/crypto_benchmark_results.json")
        return results


if __name__ == "__main__":
    run_benchmark()
