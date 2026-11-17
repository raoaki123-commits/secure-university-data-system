# Secure Resource Recommendation System for University Communities
**Official Team Code: 2602233**  
*Project Identifier: SHTKS (26O2227)*

---

## 1. Executive Summary & Project Abstract

Modern university campuses host thousands of academic resources, research papers, departmental colloquia, and support services. However, students frequently miss relevant opportunities due to information fragmentation, while concerns regarding privacy, data leakage, and unauthorized tracking prevent institutional platforms from adopting conventional cloud recommendation systems.

The **Secure Resource Recommendation System for University Communities** is an enterprise-grade, privacy-preserving recommendation and campus discovery platform designed to resolve this tension. Built on an approved technology stack of **Python, Flask, MongoDB, and TensorFlow 2.x**, the system combines:
1. **Machine Learning Recommendation Engine**: A hybrid architecture integrating **TensorFlow 2.x Neural Matrix Factorization (NeuMF)** with TF-IDF content-based cosine similarity.
2. **Cryptographic Privacy Preservation**: Genuine post-quantum **Homomorphic Encryption (TenSEAL CKKS 128-bit)** for oblivious dot-product evaluation and **3-Party Semi-Honest Secure Multi-Party Computation (MPC)** using additive secret sharing with Beaver Triples for cohort analytics.
3. **Defense-in-Depth Security**: Argon2id password hashing ($m=65536, t=3, p=4$), short-lived JWT access tokens with active revocation (`token_version`), backend-enforced Role-Based Access Control (RBAC), and append-only tamper-resistant administrative audit logging.
4. **Cinematic & Functional Frontend**: A modern design system built with React, Vite, TypeScript, and Tailwind CSS featuring dedicated role portals for **Students**, **Faculty**, **Staff**, and **Administrators** with zero placeholder mocks.

---

## 2. System Architecture & Component Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["Client & Interface Layer (React / Vite / TypeScript)"]
        UI_Landing["Cinematic Landing Page"]
        UI_Student["Student Dashboard & Discovery"]
        UI_Faculty["Faculty Academic & Advising Hub"]
        UI_Staff["Staff Operations & Welfare Portal"]
        UI_Admin["Enterprise Admin Control Center"]
    end

    subgraph SecurityGateway ["Security Gateway & Transport"]
        Nginx["Reverse Proxy / TLS 1.3 / Nginx"]
        CORS["CORS & CSRF Gate"]
        RateLimiter["Sliding-Window Rate Limiter"]
    end

    subgraph ApplicationCore ["Flask Application Backend (Python 3.12 / WSGI)"]
        AuthMiddleware["JWT Authentication & Token Version Validation"]
        RBACMiddleware["Role-Based Access Control (@roles_required)"]
        
        subgraph Blueprints ["API Blueprints"]
            BP_Auth["/api/v1/auth"]
            BP_Resources["/api/v1/resources"]
            BP_Events["/api/v1/events"]
            BP_Services["/api/v1/services"]
            BP_Recs["/api/v1/recommendations"]
            BP_Privacy["/api/v1/privacy"]
            BP_Admin["/api/v1/admin"]
        end

        subgraph CoreServices ["Core Platform Services"]
            AuthService["AuthService (Argon2id)"]
            AuditService["AuditService (Tamper-Resistant)"]
            RecService["RecommendationService"]
            HEService["HomomorphicEncryptionService (CKKS)"]
            MPCService["MPCService (Beaver Triples)"]
        end
    end

    subgraph MLEngine ["TensorFlow 2.x Recommendation Subsystem"]
        NeuMF["Neural Matrix Factorization Model (artifacts/v1)"]
        ContentTFIDF["TF-IDF Vectorizer & Cosine Similarity"]
        HybridRanker["Hybrid Ranker & Availability Engine"]
    end

    subgraph CryptographicEnclave ["Cryptographic Privacy Enclave"]
        TenSEAL_CKKS["TenSEAL CKKS (N=8192, Scale=2^40)"]
        BeaverMPC["3-Party Secret Sharing Cluster"]
        Keystore["Restricted Keystore (ckks_keys.bin)"]
    end

    subgraph PersistenceLayer ["Persistence Layer (MongoDB)"]
        DB_Users[("users")]
        DB_Resources[("resources")]
        DB_Events[("events")]
        DB_Services[("services")]
        DB_Bookmarks[("bookmarks")]
        DB_Audit[("audit_logs")]
        DB_Feedback[("recommendation_feedback")]
    end

    UI_Landing & UI_Student & UI_Faculty & UI_Staff & UI_Admin --> SecurityGateway
    SecurityGateway --> ApplicationCore
    AuthMiddleware & RBACMiddleware --> Blueprints
    Blueprints --> CoreServices
    RecService --> MLEngine
    RecService & HEService --> CryptographicEnclave
    CoreServices --> PersistenceLayer
    HEService -.-> Keystore
```

---

## 3. Technology Stack & Component Justifications

| Component | Technology | Version | Engineering Justification |
| :--- | :--- | :--- | :--- |
| **Backend Core** | Python / Flask | Python 3.12 / Flask 3.1.0 | Lightweight, modular WSGI framework ideal for cryptographic bindings and ML orchestration without unnecessary ORM overhead. |
| **Database** | MongoDB / PyMongo | PyMongo 4.9+ | Document-oriented store suited for heterogeneous catalog items (syllabi, events, health clinics), flexible privacy preferences, and rapid indexing. |
| **Machine Learning** | TensorFlow 2.x / Keras | 2.16.1 | Industry-standard deep learning framework supporting custom dual-tower embeddings, non-linear interaction layers, and portable SavedModel serialization. |
| **Homomorphic Encryption** | TenSEAL | 0.3.18 | Microsoft SEAL wrapper implementing CKKS RNS polynomial arithmetic for real-valued vector operations with SIMD slot packing and post-quantum security. |
| **Multi-Party Computation** | Custom Python Engine | Proprietary | 3-Party additive secret sharing with pre-distributed Beaver Triples over $\mathbb{R}$ for verifiable zero-cleartext ratings aggregation. |
| **Password Hashing** | Argon2id (`argon2-cffi`) | 23.1.0 | OWASP-recommended memory-hard hashing algorithm resilient against GPU/ASIC brute force attacks ($m=65536, t=3, p=4$). |
| **Token Authentication** | PyJWT | 2.10.1 | Cryptographically signed, short-lived stateless session tokens with DB-backed revocation check (`token_version`). |
| **Frontend Framework** | React / Vite | React 19 / Vite 6 | Fast bundle compiling with native ESM, TypeScript strict typing, and high-performance component rendering. |
| **Styling & Motion** | Tailwind CSS / Lucide | Tailwind 3.4 | Consistent design system tokens (`void`, `slate`, `brand`, `accent`) and accessible UI controls. |

---

## 4. Security & Cryptographic Architecture

### 4.1 Threat Model & Protection Boundaries
The system adopts an explicit, non-utopian threat model:
* **Assets Protected**: Student identity, department affiliation, interaction logs, saved items, sensitive health/financial consultation requests, and administrative credentials.
* **Adversary Profile**: Semi-honest server administrators, curious network eavesdroppers, compromised peer accounts, and potential database dump exfiltration.
* **Guarantees Provided**:
  * The recommendation server calculates oblivious recommendations over ciphertexts without seeing the underlying feature weights.
  * In 3-Party MPC, no single party learns the individual score or rating of any participant.
  * Sensitive administrative audit logs are immutable and contain zero cleartext credentials or tokens.
* **Documented Limitations**: Homomorphic encryption protects data in transit and computation, but requires a trusted client or decrypting party holding the secret key. It does not prevent traffic analysis or inferential statistical leakage on public candidate catalogs.

### 4.2 Cryptographic Specifications
1. **TenSEAL CKKS Parameters**:
   * Polynomial Modulus Degree ($N$): **8192** (ensuring $\ge 128$-bit post-quantum security).
   * Coefficient Modulus Bit Sizes: `[60, 40, 40, 60]` bits.
   * Scale Factor: $2^{40}$ (~$1.0995 \times 10^{12}$).
   * Key Separation: Public context (containing Galois and relinearization keys) is shareable; secret key context is locked in `app/keystore/ckks_keys.bin` with file permission restrictions.
2. **3-Party MPC Protocol**:
   * Additive secret sharing: For secret $x \in \mathbb{R}$, shares $x_1, x_2, x_3$ satisfy $x = x_1 + x_2 + x_3$.
   * Multiplication via Beaver Triples $(a, b, c = a \cdot b)$: Reconstructing masked values $\epsilon = x - a$ and $\delta = y - b$ allows each node to compute local shares of $x \cdot y$ without disclosing cleartext values.
3. **Authentication & Token Management**:
   * Hash Function: Argon2id with 64 MB memory cost, 3 time cost iterations, 4 parallel lanes, 16-byte random salt.
   * JWT Access Token: 15-minute expiration, HS256 signature, carrying `sub`, `email`, `role`, and `token_version`.
   * JWT Refresh Token: 7-day expiration, single-use rotation.
   * Instant Revocation: Suspending an account or changing a password increments `token_version` in MongoDB, instantly invalidating all extant tokens.

---

## 5. Machine Learning & Recommendation Engine Architecture

### 5.1 Hybrid Recommendation Subsystem
The recommendation platform employs a dual-tower hybrid architecture:
1. **Collaborative Filtering Tower (NeuMF in TensorFlow 2.x)**:
   * Maps pseudonymous user identifiers and item identifiers into continuous 32-dimensional embedding spaces.
   * Generalized Matrix Factorization (GMF) branch computes the element-wise product of user and item vectors.
   * Multi-Layer Perceptron (MLP) branch concatenates embeddings and processes them through dense non-linear layers (64 -> 32 -> 16 units with ReLU activation and Dropout regularization).
   * NeuMF output layer combines GMF and MLP activations into a unified affinity probability score $\in [0, 1]$.
2. **Content-Based Filtering Tower (TF-IDF)**:
   * Extracts lexical features from titles, descriptions, categories, and tags.
   * Computes cosine similarity between student departmental profiles and catalog item representations.
3. **Hybrid Ranker & Availability Engine**:
   * $Score_{hybrid} = 0.60 \times Score_{NeuMF} + 0.40 \times Score_{TF-IDF}$.
   * Availability and status filtering: Suspended items or past events are filtered out.
   * Privacy-preserving explanation generation: Explanations provide contextual relevance (e.g. "Ranked by departmental academic affinity") without exposing peer student histories.

### 5.2 Offline Model Evaluation Metrics (NeuMF v1.0)
Measured on held-out validation interactions:
* **Hit Rate @ 5**: **80.95%**
* **Hit Rate @ 10**: **90.48%**
* **NDCG @ 5**: **0.4538**
* **NDCG @ 10**: **0.5275**
* **Mean Reciprocal Rank (MRR)**: **0.4812**

---

## 6. Role-Based Access Control (RBAC) Matrix

The system enforces strict multi-tier permissions at the Flask route level via `@jwt_required` and `@roles_required(*roles)`.

| Resource / Action | Student | Faculty | Staff | Admin | Enforcement Mechanism |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Browse Resources, Events, Services** | Read | Read | Read | Read | Authenticated Session (`jwt_required`) |
| **Manage Saved Bookmarks & History** | Personal | Personal | Personal | All (Audit) | User ID Isolation (`user_id = g.current_user['id']`) |
| **Execute Oblivious HE Recommendation** | Execute | Execute | Execute | Execute | TenSEAL CKKS Pipeline |
| **Submit Recommendation Feedback** | Submit | Submit | Submit | Full View | Interaction Logging |
| **Publish Academic Resource** | Blocked (403) | Write | Write | Write | `@roles_required('admin', 'faculty', 'staff')` |
| **Schedule Department / Campus Event** | Blocked (403) | Write | Write | Write | `@roles_required('admin', 'faculty', 'staff')` |
| **Register University Service** | Blocked (403) | Blocked (403) | Write | Write | `@roles_required('admin', 'staff')` |
| **Access Admin Dashboard & System Stats** | Blocked (403) | Blocked (403) | Blocked (403) | Full Access | `@roles_required('admin')` |
| **Suspend / Reactivate User Account** | Blocked (403) | Blocked (403) | Blocked (403) | Write | Admin Only (Self-suspension blocked) |
| **Moderate Resources / Events / Services** | Blocked (403) | Blocked (403) | Blocked (403) | Write | Admin Only |
| **Inspect System Security & Audit Logs** | Blocked (403) | Blocked (403) | Blocked (403) | Read Only | Admin Only |

---

## 7. Database Architecture & Schema Design

Database: **MongoDB** (`university_recommender`)

### 7.1 Collections & Index Specifications
1. **`users`**:
   * Fields: `_id`, `full_name`, `email`, `password_hash`, `role`, `department`, `account_status`, `token_version`, `created_at`, `last_login`.
   * Indexes: `email` (Unique), `role`, `account_status`.
2. **`resources`**:
   * Fields: `_id`, `title`, `description`, `category`, `department`, `author_or_source`, `format`, `url`, `tags`, `status`, `created_at`.
   * Indexes: `category`, `department`, `status`, `created_at` (Descending).
3. **`events`**:
   * Fields: `_id`, `title`, `description`, `category`, `department_or_host`, `date`, `time`, `location`, `status`, `tags`, `created_at`.
   * Indexes: `date`, `category`, `status`.
4. **`services`**:
   * Fields: `_id`, `name`, `description`, `category`, `contact_email`, `location`, `hours`, `confidentiality_tier`, `is_active`, `tags`.
   * Indexes: `category`, `is_active`.
5. **`bookmarks`**:
   * Fields: `_id`, `user_id`, `item_id`, `item_type`, `item_snapshot`, `saved_at`.
   * Indexes: Compound `(user_id, item_id)` (Unique).
6. **`audit_logs`**:
   * Fields: `_id`, `timestamp`, `action`, `admin_id`, `admin_email`, `target_id`, `target_type`, `details`, `ip_address`.
   * Indexes: `timestamp` (Descending), `action`, `admin_email`.
7. **`recommendation_feedback`**:
   * Fields: `_id`, `user_id_hash`, `item_id`, `item_type`, `feedback`, `timestamp`.
   * Indexes: `user_id_hash`, `timestamp`.

---

## 8. API Specification & Endpoints Summary

Base URL: `/api/v1`

### Authentication (`/auth`)
* `POST /api/v1/auth/register` — Register student, faculty, staff, or admin (requires `X-Admin-Provision-Key`).
* `POST /api/v1/auth/login` — Authenticate and receive Argon2id-verified access and refresh JWTs.
* `POST /api/v1/auth/refresh` — Refresh expired access token using refresh token.
* `POST /api/v1/auth/logout` — Invalidate user session and token cookies.
* `GET /api/v1/auth/me` — Retrieve active user session profile.

### Academic Resources (`/resources`)
* `GET /api/v1/resources` — List approved resources with filtering by category, department, and search.
* `GET /api/v1/resources/<id>` — Retrieve single resource detail.
* `POST /api/v1/resources` — Publish resource (Faculty, Staff, Admin).

### University Events (`/events`)
* `GET /api/v1/events` — List approved events with date and category filtering.
* `POST /api/v1/events` — Schedule campus event (Faculty, Staff, Admin).

### University Services (`/services`)
* `GET /api/v1/services` — List active campus health, counseling, and academic services.
* `POST /api/v1/services` — Register university service (Staff, Admin).

### Recommendations (`/recommendations`)
* `GET /api/v1/recommendations/student` — Retrieve ranked recommendations (supports `engine=hybrid` or `baseline`).
* `POST /api/v1/recommendations/oblivious` — Execute oblivious TenSEAL CKKS homomorphic dot product.
* `POST /api/v1/recommendations/feedback` — Record user interaction signal (`useful`, `not_relevant`, `saved`).
* `GET /api/v1/recommendations/evaluation` — Retrieve model validation metrics (Admin).

### Privacy & Cryptography (`/privacy`)
* `GET /api/v1/privacy/status` — Operational status of CKKS and 3-Party MPC modules.
* `GET /api/v1/privacy/public-key` — Export public TenSEAL context for client-side encryption.
* `POST /api/v1/privacy/encrypt` — Client proxy encryption of preference vectors.
* `PUT /api/v1/privacy/preferences` — Configure personal privacy parameters (differential noise scale).

### Administration (`/admin`)
* `GET /api/v1/admin/stats` — Overall counts of users, resources, events, services, and system health.
* `GET /api/v1/admin/users` — User list with role and status filtering.
* `PUT /api/v1/admin/users/<id>/status` — Suspend or reactivate user account.
* `GET /api/v1/admin/audit-logs` — Tamper-resistant administrative activity audit trail.
* `GET /api/v1/admin/security/status` — Operational telemetry for Argon2id, JWT, CKKS, and MPC.

---

## 9. End-to-End User Workflows

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Frontend
    participant FlaskAPI as Flask Backend
    participant CKKS as TenSEAL Enclave
    participant TF as TensorFlow Recommender
    participant DB as MongoDB

    Note over Student,DB: 1. Student Registration & Privacy Preferences
    Student->>Frontend: Register account (sarah.student@university.edu)
    Frontend->>FlaskAPI: POST /api/v1/auth/register
    FlaskAPI->>DB: Insert user doc (Argon2id hash)
    FlaskAPI-->>Frontend: Return JWT access & refresh tokens
    Student->>Frontend: Configure differential noise scale (0.08)
    Frontend->>FlaskAPI: PUT /api/v1/privacy/preferences

    Note over Student,DB: 2. Hybrid Discovery & Oblivious CKKS Scoring
    Student->>Frontend: Open Recommendations View
    Frontend->>FlaskAPI: GET /api/v1/recommendations/student?engine=hybrid
    FlaskAPI->>TF: Compute NeuMF embeddings + TF-IDF cosine score
    FlaskAPI-->>Frontend: Ranked recommendations with privacy explanations
    Student->>Frontend: Request Oblivious CKKS Evaluation
    Frontend->>FlaskAPI: POST /api/v1/privacy/encrypt (vector weights)
    FlaskAPI->>CKKS: Encrypt under N=8192, scale=2^40
    FlaskAPI-->>Frontend: Ciphertext c_user
    Frontend->>FlaskAPI: POST /api/v1/recommendations/oblivious (c_user)
    FlaskAPI->>CKKS: Oblivious dot product (Server never sees cleartext)
    FlaskAPI-->>Frontend: Return encrypted scores (zero_cleartext_guarantee: true)

    Note over Student,DB: 3. Feedback & Bookmarks
    Student->>Frontend: Bookmark top resource
    Frontend->>FlaskAPI: POST /api/v1/bookmarks (item_id, snapshot)
    FlaskAPI->>DB: Upsert bookmark record
    FlaskAPI-->>Frontend: is_bookmarked: true
```

---

## 10. Privacy & Cryptography Empirical Verification

All cryptographic benchmarks were empirically measured using TenSEAL 0.3.18 and the internal 3-Party MPC engine. Zero simulated values.

| Cryptographic Operation | Implementation / Parameters | Execution Time (p50) | Payload Size | Relative Precision Error | Zero-Cleartext Guarantee |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Vector Encryption** | TenSEAL CKKS ($N=8192$, scale=$2^{40}$) | **24.84 ms** | 331,621 bytes (~323 KB) | N/A (Encryption) | **Verified** |
| **Oblivious Dot Product** | Homomorphic SIMD Slot Mult + Add | **29.95 ms** | 331,621 bytes (~323 KB) | $\le 0.00001\%$ ($3 \times 10^{-7}$) | **Verified** |
| **Vector Decryption** | Secret Key Context Evaluation | **5.68 ms** | 16 floats (64 bytes) | Exact recovery | Client / Keyholder Only |
| **MPC Vector Dot Product** | 3-Party Beaver Triples ($\mathbb{R}^{16}$) | **1.33 ms** | 768 bytes total network | $< 10^{-15}$ (Machine epsilon) | **Verified** |
| **MPC Cohort Aggregation** | Multi-party rating average ($N=25$) | **0.53 ms** | 1,200 bytes total network | $< 10^{-15}$ (Machine epsilon) | **Verified** |

---

## 11. Performance Profiling & Optimization Results

Empirical latency profiling conducted across 30 repeated samples per endpoint (recorded in `docs/performance_profiling_results.json`):

### 11.1 API Endpoint Latency (Local Benchmark)
* `GET /api/v1/auth/me`: **p50 = 11.39 ms** (min: 5.22 ms, p95: 118.28 ms)
* `GET /api/v1/resources`: **p50 = 16.18 ms** (min: 9.90 ms, p95: 19.37 ms)
* `GET /api/v1/events`: **p50 = 6.50 ms** (min: 5.36 ms, p95: 9.93 ms)
* `GET /api/v1/services`: **p50 = 6.83 ms** (min: 5.99 ms, p95: 8.63 ms)
* `GET /api/v1/privacy/status`: **p50 = 5.99 ms** (min: 5.19 ms, p95: 8.94 ms)
* `GET /api/v1/recommendations/student?engine=baseline`: **p50 = 14.36 ms** (p95: 16.49 ms)
* `GET /api/v1/recommendations/student?engine=hybrid`: **p50 = 29.35 ms** (TensorFlow NeuMF forward pass + TF-IDF ranking)
* `GET /api/v1/admin/stats`: **p50 = 9.93 ms** (min: 7.90 ms, p95: 11.57 ms)

### 11.2 ML Inference Overhead
* TensorFlow NeuMF + TF-IDF ranking: **13.07 ms p50** (mean: 13.23 ms, p95: 15.51 ms for 10 candidates).

### 11.3 System Memory Utilization
* Process Current Heap: **2.33 MB**
* Process Peak Heap (under concurrent load): **35.05 MB**

### 11.4 Frontend Production Assets (Vite Build)
* `dist/index.html`: **1.13 kB** (gzip: 0.62 kB)
* `dist/assets/index-COTJ90CG.css`: **44.28 kB** (gzip: 8.20 kB)
* `dist/assets/index-BIS4Ri4H.js`: **1,305.79 kB** (gzip: 329.50 kB)
* Total Gzipped Transfer: **~338 kB**

---

## 12. Security Audit & Vulnerability Assessment

A rigorous, dedicated test suite (`backend/tests/test_security_audit.py`) was executed to validate production security:
* **Argon2id Verification**: All user passwords generate valid `$argon2id$v=19$m=65536,t=3,p=4$` hashes. Incorrect passwords fail in constant time.
* **Token Tampering Rejection**: Altering token payloads, headers, or signatures triggers immediate rejection with `401 Unauthorized`.
* **Token Revocation Verification**: Bumping `token_version` invalidates all prior issued tokens instantly without awaiting expiration.
* **NoSQL / Mongo Injection Resistance**: Injected dictionary operators (`{"$gt": ""}`) in login or query parameters are caught by strict type-validation boundaries and rejected with `400 Bad Request`.
* **Privilege Escalation Protection**: Attempting to register with `role: "admin"` without the secret provision key fails with `403 Forbidden`.
* **Audit Log Credential Sanitization**: Verified that `audit_logs` collections never store cleartext passwords, secret keys, or JWT tokens.

---

## 13. Frontend Design System & Accessibility

* **Visual Identity**: High-contrast, sophisticated dark mode palette (`#08090C` void, `#0F1117` void-surface, `#1A1D27` elevated cards, `#38BDF8` cyber cyan, `#818CF8` brand indigo).
* **Typography**: Clean display fonts with monospace data coordinates for cryptographic badges and timing metrics.
* **Responsive Architecture**: Fluid grid layouts collapsing gracefully from 4K displays down to mobile viewports.
* **Zero Placeholder Guarantee**: The Faculty, Staff, Student, and Admin dashboards feature live form submissions, functional interactive controls, real-time RBAC probers, and dynamic data binding.

---

## 14. Installation, Setup & Local Execution Guide

### Prerequisites
* Python 3.11 or 3.12
* Node.js 18+ and `pnpm`
* MongoDB 6.0+ (or use built-in mongomock for development/testing)

### 14.1 Backend Setup
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows
# source venv/bin/activate     # On Linux / macOS

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Initialize environment configuration
cp .env.example .env

# 5. Run automated test suite
pytest tests -v

# 6. Start development server
python run.py
# Server starts at http://localhost:5000
```

### 14.2 Frontend Setup
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
pnpm install

# 3. Run production build check
pnpm run build

# 4. Start Vite development server
pnpm run dev
# Frontend runs at http://localhost:5173
```

---

## 15. Production Deployment Guide

```mermaid
flowchart LR
    Client([Browser Clients]) -->|HTTPS / Port 443| Nginx[Nginx Reverse Proxy]
    Nginx -->|Static Assets| DistDir[/frontend/dist/]
    Nginx -->|WSGI Proxy / Port 5000| Gunicorn[Gunicorn WSGI Application Cluster]
    Gunicorn --> Worker1[Worker Process 1]
    Gunicorn --> Worker2[Worker Process 2]
    Gunicorn --> Worker3[Worker Process 3]
    Worker1 & Worker2 & Worker3 --> Mongo[(MongoDB Replica Set / Atlas)]
    Worker1 & Worker2 & Worker3 --> Keystore[(Local Secure Keystore)]
```

### 15.1 Production Startup via Gunicorn
```bash
cd backend
gunicorn -w 4 -b 127.0.0.1:5000 wsgi:app --timeout 60 --access-logfile - --error-logfile -
```

### 15.2 Nginx Reverse Proxy Configuration Template
```nginx
server {
    listen 443 ssl http2;
    server_name recommender.university.edu;

    ssl_certificate /etc/letsencrypt/live/recommender.university.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/recommender.university.edu/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Static Frontend Assets
    location / {
        root /var/www/community/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    # Reverse Proxy to Flask API
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

---

## 16. Verification, Testing & Quality Assurance Summary

The platform has undergone exhaustive automated testing across 8 distinct test suites:

| Test Suite File | Focus Area | Test Count | Status |
| :--- | :--- | :---: | :---: |
| `test_auth.py` | Registration, login, JWT validation, expiration, password rules | **13** | **PASSED** |
| `test_admin_api.py` | Admin RBAC, statistics, user suspension, catalog moderation | **7** | **PASSED** |
| `test_backend_core.py` | Unversioned routing, CRUD endpoints, query filtering | **7** | **PASSED** |
| `test_cryptography_and_privacy.py` | TenSEAL CKKS arithmetic, 3-Party Beaver Triple MPC | **6** | **PASSED** |
| `test_recommendation_engine.py` | NeuMF model, TF-IDF ranker, NDCG/HitRate evaluation | **7** | **PASSED** |
| `test_student_dashboard_api.py` | Student bookmarks, feedback, preferences, category search | **9** | **PASSED** |
| `test_end_to_end_workflows.py` | Complete Student, Faculty, Staff, and Admin user journeys | **3** | **PASSED** |
| `test_security_audit.py` | Argon2id verification, token tampering, NoSQL injection, RBAC | **7** | **PASSED** |
| **Total Test Count** | **All Modules Integrated** | **59** | **100% PASSED** |

* Frontend TypeScript compilation (`tsc -b`): **Zero errors**.
* Vite production build: **19.60s build time, clean production artifacts**.
* Measured overall test execution time: **19.18 seconds across 59 automated test cases**.

---
*Developed under Official Team Code: 2602233 | Secure Resource Recommendation System for University Communities*

#   s e c u r e - u n i v e r s i t y - d a t a - s y s t e m  
 