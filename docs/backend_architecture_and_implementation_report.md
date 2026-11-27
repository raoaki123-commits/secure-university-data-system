# BACKEND ARCHITECTURE & MODULAR REST API SYSTEM REPORT
## Secure Resource Recommendation System for University Communities
**Official Team Code:** 2602233 | **Project Code:** SHTKS (26O2227) | **Platform Version:** 1.0.0 (Production-Oriented Flask Core)

---

### 1. Backend Architecture Created & Modified

The backend was refined into a decoupled, layered, production-oriented structure adhering strictly to the approved technology stack (**Python, Flask, MongoDB, TensorFlow 2.x interface**):

```
backend/
├── app/
│   ├── __init__.py                # Flask application factory, CORS, multi-blueprint registration (/api and /api/v1)
│   ├── config.py                  # Environment-driven configuration (Development, Testing, Production)
│   ├── routes/                    # Suggested architecture router wrappers (re-exporting blueprints)
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── resources.py
│   │   ├── events.py
│   │   ├── services.py
│   │   ├── recommendations.py
│   │   ├── admin.py
│   │   └── privacy.py
│   ├── api/                       # Domain blueprints with full REST CRUD handlers
│   │   ├── auth.py                # Registration, login, logout, refresh, /me, password change
│   │   ├── users.py               # User directory, profile inspection, updates, sole-admin guarded deletion
│   │   ├── resources.py           # Academic resources CRUD, category/search/sort filtering
│   │   ├── events.py              # Campus events CRUD, virtual/physical venue tracking
│   │   ├── services.py            # Campus services CRUD, confidentiality tiers, active toggles
│   │   ├── recommendations.py     # Recommendation scoring, feedback ingestion, history
│   │   ├── privacy.py             # Cryptographic status, privacy operations audit, HE/MPC simulation
│   │   ├── admin.py               # Comprehensive administrative command center & stats
│   │   ├── bookmarks.py           # User personal collection bookmarks
│   │   └── rbac_demo.py           # Verification fixtures
│   ├── models/                    # Clean document schemas, serializers, and validators
│   │   ├── __init__.py
│   │   ├── user.py                # UserModel, Argon2id hashing, user_to_response sanitizer
│   │   ├── resource.py            # ResourceModel, status lifecycle, validation
│   │   ├── event.py               # EventModel, venue and date schemas
│   │   ├── service.py             # ServiceModel, confidentiality tier definitions
│   │   ├── recommendation.py      # RecommendationModel, scoring metadata, feedback schema
│   │   └── privacy_operation.py   # PrivacyOperationModel for zero-cleartext audit trail
│   ├── services/                  # Business logic and domain service interfaces
│   │   ├── __init__.py
│   │   ├── auth_service.py        # Registration, authentication, token rotation, profile updates
│   │   ├── recommendation_service.py # Engine interface, baseline heuristic, TF 2.x interface contract
│   │   ├── encryption_service.py  # Homomorphic Encryption (CKKS N=8192) service & noise injection
│   │   ├── mpc_service.py         # Secure Multi-Party Computation additive secret sharing interface
│   │   └── audit_service.py       # Immutable administrative activity logging
│   ├── middleware/                # Security and validation decorators
│   │   ├── __init__.py
│   │   ├── authentication.py      # jwt_required, jwt_optional, token_version verification
│   │   ├── authorization.py       # roles_required, owner_or_admin_required
│   │   ├── validation.py          # validate_json_body with missing field detection
│   │   └── rate_limiter.py        # In-memory sliding-window IP rate limiter
│   ├── core/                      # Engine infrastructure
│   │   ├── database.py            # MongoDB DatabaseManager with automatic mongomock fallback
│   │   ├── security.py            # Argon2id hasher, JWT encoder/decoder, rate limiter
│   │   ├── seeder.py              # Authentic initial campus dataset seeder
│   │   └── errors.py              # RFC 7807 compliant error handlers
│   └── utils/                     # Shared utilities
│       ├── __init__.py
│       ├── responses.py           # Standardized JSON response helpers (success, error, paginated)
│       ├── validators.py          # Regex email, password complexity, pagination sanitizers
│       └── logger.py              # Structured event logger with contextual metadata
├── tests/
│   ├── conftest.py                # Pytest fixtures and isolated database cleaner
│   ├── test_auth.py               # 13 tests covering authentication, tokens, and role gates
│   ├── test_student_dashboard_api.py # 9 tests covering resources, events, services, recommendations
│   ├── test_admin_api.py          # 7 tests covering admin endpoints, stats, user supervision
│   └── test_backend_core.py       # 7 comprehensive tests covering /api unversioned routes & CRUD
├── requirements.txt               # Locked production dependencies
├── run.py                         # Production server entrypoint
└── .env.example                   # Full environment variable configuration blueprint
```

---

### 2. API Endpoints Implemented

Every endpoint supports both standard unversioned routes (`/api/...`) and versioned routes (`/api/v1/...`):

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| **POST** | `/api/auth/register` | Public (Admin Key for admin) | Register student, faculty, staff, or admin account |
| **POST** | `/api/auth/login` | Public | Authenticate with institutional credentials |
| **POST** | `/api/auth/refresh` | Public | Rotate refresh token and issue fresh access token |
| **POST** | `/api/auth/logout` | Authenticated | Terminate session |
| **GET** | `/api/auth/me` | Authenticated | Retrieve authenticated user profile and permissions |
| **GET** | `/api/users` | Admin, Faculty, Staff | Paginated list of registered users with search & filters |
| **GET** | `/api/users/<id>` | Owner, Admin, Faculty, Staff | Inspect user dossier (sanitized) |
| **PUT** | `/api/users/<id>` | Owner, Admin | Update user name, department, or profile data |
| **DELETE** | `/api/users/<id>` | Admin only | Delete account (protected by sole-admin safeguard) |
| **GET** | `/api/resources` | Public / Authenticated | Filter, search, and sort academic resources |
| **POST** | `/api/resources` | Admin, Faculty, Staff | Publish new academic resource |
| **GET** | `/api/resources/<id>` | Public / Authenticated | Fetch specific resource details |
| **PUT** | `/api/resources/<id>` | Creator, Admin | Update academic resource |
| **DELETE** | `/api/resources/<id>` | Admin only | Delete academic resource from catalog |
| **GET** | `/api/events` | Public / Authenticated | Retrieve campus events sorted chronologically |
| **POST** | `/api/events` | Admin, Faculty, Staff | Schedule a new campus event |
| **GET** | `/api/events/<id>` | Public / Authenticated | Inspect specific event program |
| **PUT** | `/api/events/<id>` | Creator, Admin | Update event details |
| **DELETE** | `/api/events/<id>` | Admin only | Cancel and remove campus event |
| **GET** | `/api/services` | Public / Authenticated | List campus support services (active by default) |
| **POST** | `/api/services` | Admin, Staff | Register a university support service |
| **GET** | `/api/services/<id>` | Public / Authenticated | Inspect service details and intake hours |
| **PUT** | `/api/services/<id>` | Admin, Staff | Update service configuration |
| **DELETE** | `/api/services/<id>` | Admin only | Delete university service |
| **GET** | `/api/recommendations` | Authenticated | Retrieve personalized recommendations |
| **POST** | `/api/recommendations` | Authenticated | On-demand compute or feedback submission |
| **GET** | `/api/recommendations/<id>` | Authenticated | Detailed candidate scoring breakdown |
| **GET** | `/api/privacy/status` | Authenticated | Inspect HE & MPC operational disclosures |
| **GET** | `/api/privacy/operations` | Authenticated | Audit trail of privacy operations |
| **POST** | `/api/privacy/operations/simulate` | Authenticated | Simulate HE noise injection / MPC secret sharing |
| **GET** | `/api/admin/overview` | Admin only | Real MongoDB statistics & pending approval counts |
| **GET** | `/api/admin/system-status` | Admin only | Cryptographic configuration & security telemetry |
| **GET** | `/api/admin/audit-logs` | Admin only | Filterable administrative audit trail |

---

### 3. MongoDB Collections & Indexes

The database manager configures seven core collections in `university_recommender`:

1. **`users`**:
   - `email` (ASCENDING, Unique constraint)
   - `role` (ASCENDING)
   - `account_status` (ASCENDING)
   - `token_version` tracking for immediate session revocation
2. **`resources`**:
   - `category` (ASCENDING)
   - `department` (ASCENDING)
   - `status` (ASCENDING)
   - `created_at` (DESCENDING)
3. **`events`**:
   - `date` (ASCENDING)
   - `category` (ASCENDING)
   - `status` (ASCENDING)
4. **`services`**:
   - `category` (ASCENDING)
   - `is_active` (ASCENDING)
5. **`recommendations` & `recommendation_feedback`**:
   - `user_id` (ASCENDING)
   - `item_id` (ASCENDING)
   - `timestamp` (DESCENDING)
6. **`privacy_operations`**:
   - `timestamp` (DESCENDING)
   - `operation_type` (ASCENDING)
   - `user_id` (ASCENDING)
7. **`audit_logs`**:
   - `timestamp` (DESCENDING)
   - `action` (ASCENDING)
   - `admin_email` (ASCENDING)

---

### 4. Security Mechanisms Implemented

- **Argon2id Password Hashing:** Memory cost 64 MB (65,536 KB), time cost 3, parallelism 4, 16-byte CSPRNG salt. Plaintext passwords never touch logs or databases.
- **Immediate Session Invalidation:** Incrementing `token_version` invalidates all unexpired JWTs immediately without waiting for the 15-minute expiration period.
- **Sole-Admin Demotion Safeguard:** The backend counts active administrators before role demotion or deletion, preventing accidental lockout.
- **Sliding-Window IP Rate Limiting:** Brute-force protection on authentication endpoints (10-15 requests/minute).
- **RFC 7807 Error Sanitization:** No internal stack traces or database schema errors exposed to clients.
- **CORS Configuration:** Specific permitted origins, methods, credentials, and allowed headers (`X-Admin-Provision-Key`, `Authorization`).

---

### 5. Recommendation Integration Status

- **Service Abstraction:** `RecommendationService` orchestrates candidate retrieval across academic resources, campus events, and university services.
- **Engine Interface:** Implements `RecommendationEngineInterface` with active `BaselineHeuristicRecommender`.
- **Honest Operational Disclosure:** Explicitly labeled as `Baseline Content Heuristic v1.0` utilizing departmental affinity, peer rating weights, and tag overlap.
- **TensorFlow 2.x Integration Contract:** Clearly defined interface contract ready for TensorFlow collaborative filtering model weights without mock machine learning claims.

---

### 6. Homomorphic Encryption (HE) & MPC Integration Status

- **HE Scheme Contract:** Formulated for CKKS (Cheon-Kim-Kim-Song) scheme on polynomial ring $R_q = \mathbb{Z}_q[X]/(X^N + 1)$ with $N=8192$.
- **Active Privacy Pipeline:** Applies differential privacy Laplacian noise injection ($\epsilon=0.5, \text{scale}=0.05$) to rating vectors.
- **MPC Primitives:** 2-out-of-2 additive secret sharing implemented in `MPCService.generate_secret_shares()` with oblivious sum reconstruction.
- **Zero-Cleartext Logging:** Every simulated privacy operation logs metadata (vector dimension, noise parameters, node counts) to the `privacy_operations` collection without recording cleartext user vectors.

---

### 7. Automated Test Results

Executed via Pytest on Python 3.12:

```
============================= test session starts =============================
platform win32 -- Python 3.12.0, pytest-9.2.0, pluggy-1.7.0 -- backend\venv\Scripts\python.exe
rootdir: C:\Users\raoak\Desktop\community\backend
collected 36 items

tests/test_admin_api.py::test_unauthorized_access_to_admin_endpoints PASSED [  2%]
tests/test_admin_api.py::test_admin_get_stats PASSED                     [  5%]
tests/test_admin_api.py::test_admin_user_management PASSED               [  8%]
tests/test_admin_api.py::test_admin_self_demotion_safeguard PASSED       [ 11%]
tests/test_admin_api.py::test_admin_resource_crud_and_status PASSED      [ 13%]
tests/test_admin_api.py::test_admin_event_and_service_crud PASSED        [ 16%]
tests/test_admin_api.py::test_admin_security_status_and_monitoring PASSED [ 19%]
tests/test_auth.py::test_valid_registration PASSED                       [ 22%]
tests/test_auth.py::test_duplicate_registration PASSED                   [ 25%]
tests/test_auth.py::test_invalid_email PASSED                            [ 27%]
tests/test_auth.py::test_weak_password PASSED                            [ 30%]
tests/test_auth.py::test_valid_login PASSED                              [ 33%]
tests/test_auth.py::test_invalid_login PASSED                            [ 36%]
tests/test_auth.py::test_logout PASSED                                   [ 38%]
tests/test_auth.py::test_session_expiration PASSED                       [ 41%]
tests/test_auth.py::test_student_accessing_admin_endpoint PASSED         [ 44%]
tests/test_auth.py::test_faculty_accessing_admin_endpoint PASSED         [ 47%]
tests/test_auth.py::test_unauthorized_api_requests PASSED                [ 50%]
tests/test_auth.py::test_admin_provisioning_and_user_isolation PASSED    [ 52%]
tests/test_auth.py::test_invalid_credentials PASSED                      [ 55%]
tests/test_backend_core.py::test_unversioned_auth_flow PASSED            [ 58%]
tests/test_backend_core.py::test_users_api_crud_and_permissions PASSED   [ 61%]
tests/test_backend_core.py::test_resources_api_crud PASSED               [ 63%]
tests/test_backend_core.py::test_events_and_services_api_crud PASSED     [ 66%]
tests/test_backend_core.py::test_recommendations_and_privacy_apis PASSED [ 69%]
tests/test_backend_core.py::test_admin_api_endpoints PASSED              [ 72%]
tests/test_backend_core.py::test_validation_and_invalid_requests PASSED  [ 75%]
tests/test_student_dashboard_api.py::test_get_resources PASSED           [ 77%]
tests/test_student_dashboard_api.py::test_filter_resources_by_category_and_search PASSED [ 80%]
tests/test_student_dashboard_api.py::test_resource_detail_and_404 PASSED [ 83%]
tests/test_student_dashboard_api.py::test_get_events PASSED              [ 86%]
tests/test_student_dashboard_api.py::test_get_services PASSED            [ 88%]
tests/test_student_dashboard_api.py::test_student_recommendations_baseline PASSED [ 91%]
tests/test_student_dashboard_api.py::test_recommendation_feedback_and_history PASSED [ 94%]
tests/test_student_dashboard_api.py::test_toggle_bookmark PASSED         [ 97%]
tests/test_student_dashboard_api.py::test_privacy_preferences_flow PASSED [100%]

============================= 36 passed in 27.65s =============================
```

Frontend production build verification (`tsc -b && vite build`):
- **Output:** `dist/index.html` (1.13 kB), `dist/assets/index-*.css` (43.40 kB), `dist/assets/index-*.js` (1,265 kB).
- **Status:** Built in 30.68s with 0 errors.

---

### 8. Known Limitations

1. **HE TenSEAL C++ Library:** The active homomorphic encryption pipeline uses a calibrated differential noise scale simulation with mathematical contracts matching the CKKS ring modulus ($N=8192$), pending native C++ TenSEAL compilation for Windows.
2. **MPC Cluster Topology:** Multi-Party Computation runs in single-node sovereign gateway mode; physical network socket distribution across separate servers is scheduled for production infrastructure deployment.
3. **In-Memory Rate Limiting:** The sliding-window rate limiter runs in-process. In a multi-worker production deployment, an external Redis instance should back the limiter.

---

### 9. Exact Commands to Run the Backend

#### Prerequisites:
Python 3.10+ (Current environment uses Python 3.12).

#### Activate Virtual Environment:
```powershell
# Windows PowerShell:
Set-Location -Path "backend"
.\venv\Scripts\Activate.ps1
```

#### Install / Verify Dependencies:
```powershell
pip install -r requirements.txt
```

#### Launch the Flask Development Server:
```powershell
python run.py
```
*Server starts on `http://localhost:5000` with automatic fallback to in-memory mongomock if no local MongoDB daemon is listening.*

#### Run Automated Test Suite:
```powershell
pytest -o pythonpath=. tests -v
```

---

### 10. Instructions to Test APIs Using Postman

1. Open Postman.
2. Click **Import** in the upper left corner.
3. Select `docs/postman_collection.json` from the repository.
4. Set the Collection Variable `base_url` to `http://localhost:5000`.
5. Execute requests in sequence:
   - **Step 1:** Run `1. Authentication -> Register Student` to create a user account.
   - **Step 2:** Run `1. Authentication -> Login` — Postman automatically extracts `tokens.access_token` into the `{{access_token}}` variable.
   - **Step 3:** Run `6. Recommendations -> Get Personalized Recommendations` to retrieve scored candidate items.
   - **Step 4:** Run `3. Academic Resources -> List Resources` to explore the catalog.
   - **Step 5:** Run `7. Privacy & Cryptography -> Get Cryptographic Status` and `Simulate Privacy Operation` to test zero-cleartext operations.
   - **Step 6:** Run `1. Authentication -> Register Admin (with Provision Key)` followed by `8. Admin Control Center -> Get System Overview` to verify Level 4 RBAC administration.
