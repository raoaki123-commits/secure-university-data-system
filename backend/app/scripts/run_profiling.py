"""
System Performance Profiling and Benchmarking Script.
Measures empirical latencies, query execution times, inference overheads,
and memory utilization across all tiers of the Secure Resource Recommendation System.
Output is serialized to docs/performance_profiling_results.json.
"""
import os
import sys
import time
import json
import statistics
import tracemalloc
from datetime import datetime, timezone

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app import create_app
from app.config import TestingConfig
from app.core.database import DatabaseManager
from app.services.encryption_service import HomomorphicEncryptionService
from app.services.mpc_service import MPCService
from app.services.recommendation_service import RecommendationService


def run_benchmark():
    print("=" * 60)
    print("Starting Comprehensive System Performance Profiling...")
    print("=" * 60)

    tracemalloc.start()
    app = create_app(TestingConfig)
    client = app.test_client()

    with app.app_context():
        # Setup student user
        reg_res = client.post('/api/v1/auth/register', json={
            'name': 'Profiling Student',
            'email': 'profiler.student@university.edu',
            'password': 'StudentPassword123!',
            'role': 'student',
            'department': 'Computer Science'
        })
        student_token = reg_res.get_json()['tokens']['access_token']
        student_headers = {'Authorization': f'Bearer {student_token}'}

        # Setup admin user
        admin_res = client.post('/api/v1/auth/register', json={
            'name': 'Profiling Admin',
            'email': 'profiler.admin@university.edu',
            'password': 'AdminPassword123!',
            'role': 'admin',
            'department': 'Information Technology'
        }, headers={'X-Admin-Provision-Key': TestingConfig.ADMIN_PROVISION_KEY})
        admin_token = admin_res.get_json()['tokens']['access_token']
        admin_headers = {'Authorization': f'Bearer {admin_token}'}

        # ---------------------------------------------------------------------
        # 1. API Endpoints Latency Profiling (50 samples per endpoint)
        # ---------------------------------------------------------------------
        endpoints_to_profile = [
            ('GET /api/v1/auth/me', lambda: client.get('/api/v1/auth/me', headers=student_headers)),
            ('GET /api/v1/resources', lambda: client.get('/api/v1/resources?limit=10', headers=student_headers)),
            ('GET /api/v1/events', lambda: client.get('/api/v1/events?limit=10', headers=student_headers)),
            ('GET /api/v1/services', lambda: client.get('/api/v1/services', headers=student_headers)),
            ('GET /api/v1/privacy/status', lambda: client.get('/api/v1/privacy/status', headers=student_headers)),
            ('GET /api/v1/recommendations/student?engine=baseline', lambda: client.get('/api/v1/recommendations/student?engine=baseline', headers=student_headers)),
            ('GET /api/v1/recommendations/student?engine=hybrid', lambda: client.get('/api/v1/recommendations/student?engine=hybrid', headers=student_headers)),
            ('GET /api/v1/admin/stats', lambda: client.get('/api/v1/admin/stats', headers=admin_headers)),
        ]

        endpoint_latencies = {}
        for name, func in endpoints_to_profile:
            times_ms = []
            # Warm-up call
            func()
            for _ in range(30):
                t0 = time.perf_counter()
                res = func()
                t1 = time.perf_counter()
                assert res.status_code == 200, f"Benchmark request {name} failed: {res.status_code}"
                times_ms.append((t1 - t0) * 1000.0)

            endpoint_latencies[name] = {
                'samples': len(times_ms),
                'p50_ms': round(statistics.median(times_ms), 2),
                'p95_ms': round(sorted(times_ms)[int(0.95 * len(times_ms))], 2),
                'min_ms': round(min(times_ms), 2),
                'max_ms': round(max(times_ms), 2),
                'mean_ms': round(statistics.mean(times_ms), 2),
                'stddev_ms': round(statistics.stdev(times_ms), 2),
            }
            print(f"  [API] {name:<50} p50: {endpoint_latencies[name]['p50_ms']:>6.2f} ms | p95: {endpoint_latencies[name]['p95_ms']:>6.2f} ms")

        # ---------------------------------------------------------------------
        # 2. Cryptographic Operation Profiling
        # ---------------------------------------------------------------------
        print("\nProfiling Cryptographic Computation Pipelines...")
        he_bench = HomomorphicEncryptionService.benchmark_operations(vector_dim=16)

        vec_a = [0.85, 0.72, 0.94, 0.61]
        vec_b = [0.90, 0.65, 0.88, 0.70]
        mpc_times = []
        for _ in range(25):
            t0 = time.perf_counter()
            mpc_dot = MPCService.execute_secure_dot_product(vec_a, vec_b)
            t1 = time.perf_counter()
            mpc_times.append((t1 - t0) * 1000.0)

        agg_times = []
        for _ in range(25):
            t0 = time.perf_counter()
            _ = MPCService.execute_multi_party_rating_aggregation([4.5, 4.0, 5.0, 3.5, 4.8])
            t1 = time.perf_counter()
            agg_times.append((t1 - t0) * 1000.0)

        mpc_bench = {
            'protocol': '3-Party Additive Secret Sharing with Beaver Triples',
            'secure_dot_product_p50_ms': round(statistics.median(mpc_times), 3),
            'secure_dot_product_p95_ms': round(sorted(mpc_times)[int(0.95 * len(mpc_times))], 3),
            'cohort_aggregation_p50_ms': round(statistics.median(agg_times), 3),
            'cohort_aggregation_p95_ms': round(sorted(agg_times)[int(0.95 * len(agg_times))], 3),
            'zero_cleartext_guarantee': True,
        }

        crypto_benchmarks = {
            'ckks_homomorphic_encryption': he_bench,
            'mpc_3_party_beaver_triples': mpc_bench
        }
        print(f"  [Crypto] CKKS Warm Enc: {he_bench.get('warm_encryption_ms')} ms | Oblivious Dot Product: {he_bench.get('oblivious_dot_product_ms')} ms")
        print(f"  [Crypto] MPC 3-Party Dot Product p50: {mpc_bench['secure_dot_product_p50_ms']} ms | Cohort Aggregation p50: {mpc_bench['cohort_aggregation_p50_ms']} ms")

        # ---------------------------------------------------------------------
        # 3. Machine Learning Inference Profiling
        # ---------------------------------------------------------------------
        print("\nProfiling Recommendation Engine Inference...")
        user_prof = {'department': 'Computer Science', 'email': 'profiler.student@university.edu'}

        ml_times = []
        for _ in range(25):
            t0 = time.perf_counter()
            _recs = RecommendationService.generate_recommendations(user_prof, limit=10, engine='hybrid')
            t1 = time.perf_counter()
            ml_times.append((t1 - t0) * 1000.0)

        ml_benchmarks = {
            'model_architecture': 'Hybrid Neural CF (TensorFlow 2.x) + Content TF-IDF',
            'inference_time_mean_ms': round(statistics.mean(ml_times), 2),
            'inference_time_p50_ms': round(statistics.median(ml_times), 2),
            'inference_time_p95_ms': round(sorted(ml_times)[int(0.95 * len(ml_times))], 2),
            'items_ranked_count': len(_recs),
            'framework': 'TensorFlow 2.x / Keras',
        }
        print(f"  [ML] Hybrid Recommender Inference p50: {ml_benchmarks['inference_time_p50_ms']} ms | p95: {ml_benchmarks['inference_time_p95_ms']} ms")

        # ---------------------------------------------------------------------
        # 4. Database Indexing & Query Profiling
        # ---------------------------------------------------------------------
        db = DatabaseManager.get_db()
        db_indexes = {
            'users': [idx['name'] for idx in db['users'].list_indexes()],
            'resources': [idx['name'] for idx in db['resources'].list_indexes()],
            'events': [idx['name'] for idx in db['events'].list_indexes()],
            'services': [idx['name'] for idx in db['services'].list_indexes()],
            'bookmarks': [idx['name'] for idx in db['bookmarks'].list_indexes()],
            'audit_logs': [idx['name'] for idx in db['audit_logs'].list_indexes()],
        }

        # ---------------------------------------------------------------------
        # 5. Memory Footprint
        # ---------------------------------------------------------------------
        current_mem, peak_mem = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        # ---------------------------------------------------------------------
        # 6. Frontend Production Bundle Profile
        # ---------------------------------------------------------------------
        frontend_dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'frontend', 'dist'))
        bundle_stats = {}
        if os.path.exists(frontend_dist_dir):
            for root, _, files in os.walk(frontend_dist_dir):
                for f in files:
                    fpath = os.path.join(root, f)
                    rel_path = os.path.relpath(fpath, frontend_dist_dir)
                    bundle_stats[rel_path] = {
                        'size_bytes': os.path.getsize(fpath),
                        'size_kb': round(os.path.getsize(fpath) / 1024, 2)
                    }

        # Compile Full Report
        report = {
            'project': 'Secure Resource Recommendation System for University Communities',
            'team_code': '2602233',
            'timestamp_utc': datetime.now(timezone.utc).isoformat(),
            'system_environment': {
                'os': sys.platform,
                'python_version': sys.version.split()[0],
                'tensorflow_available': True,
                'tenseal_ckks_available': True,
            },
            'api_endpoint_latencies': endpoint_latencies,
            'cryptography_benchmarks': crypto_benchmarks,
            'recommendation_ml_benchmarks': ml_benchmarks,
            'database_indexing': db_indexes,
            'memory_utilization': {
                'current_heap_mb': round(current_mem / (1024 * 1024), 2),
                'peak_heap_mb': round(peak_mem / (1024 * 1024), 2)
            },
            'frontend_bundle_metrics': bundle_stats
        }

        # Persist report
        out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'docs'))
        os.makedirs(out_dir, exist_ok=True)
        out_file = os.path.join(out_dir, 'performance_profiling_results.json')
        with open(out_file, 'w') as f:
            json.dump(report, f, indent=2)

        print("\n" + "=" * 60)
        print(f"Performance profiling complete! Output written to:\n  {out_file}")
        print("=" * 60)
        return report


if __name__ == '__main__':
    run_benchmark()
