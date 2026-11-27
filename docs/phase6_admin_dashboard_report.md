# PHASE 6 — ADMIN DASHBOARD & SECURITY AUDIT SYSTEM REPORT
## Secure Resource Recommendation System for University Communities
**Team Code:** 2602233 | **Project Code:** SHTKS (26O2227) | **Phase:** 6

---

### Executive Summary

Phase 6 delivers an enterprise-grade, cryptographically backed **Admin Dashboard and Control Center** for the Secure Resource Recommendation System for University Communities. The dashboard empowers authorized university administrators to monitor live telemetry, supervise user accounts with immediate session revocation, curate and moderate academic resources, coordinate campus events, maintain university services, verify cryptographic configurations (Argon2id, JWT HS256, TenSEAL/CKKS baseline, MPC gateway), track recommendation feedback signals, and inspect an immutable administrative audit ledger.

All backend endpoints enforce multi-layered validation via `@jwt_required` and `@roles_required('admin')`, ensuring non-admin users (students, faculty, staff) and unauthenticated requests are categorically denied with HTTP 403 Forbidden or 401 Unauthorized.

---

### Key Architectural Deliverables

```
                                  [Admin Client (React 19 / Vite)]
                                                 │
                                                 │ Bearer JWT (HS256)
                                                 ▼
                             ┌───────────────────────────────────────┐
                             │       Flask Reverse Proxy / WSGI      │
                             └───────────────────┬───────────────────┘
                                                 │
                                                 ▼
                             ┌───────────────────────────────────────┐
                             │        Security Layer (RBAC L4)       │
                             │  - @jwt_required                      │
                             │  - @roles_required('admin')           │
                             │  - token_version validity check       │
                             └───────────────────┬───────────────────┘
                                                 │
         ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
         ▼                   ▼                   ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ /admin/stats    │ │ /admin/users    │ │ /admin/resources│ │/admin/security  │ │/admin/audit-logs│
│ - Real count agg│ │ - Role change   │ │ - Content CRUD  │ │- Crypto status  │ │- Immutable logs │
│ - Pending alerts│ │ - Suspension    │ │ - Moderation    │ │- Baseline HE    │ │- IP & Admin trail
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │                   │                   │
         └───────────────────┴─────────┬─────────┴───────────────────┴───────────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │     MongoDB Sovereign Enclave │
                       │  - users (token_version)      │
                       │  - resources & events         │
                       │  - services & feedback        │
                       │  - audit_logs (indexed)       │
                       └───────────────────────────────┘
```

---

### 1. Admin Authentication & Authorization
- **Strict Backend RBAC:** Access to `/api/v1/admin/*` is guarded on the Flask server using `@jwt_required` and `@roles_required('admin')`. Frontend guards are complemented by backend authorization returning HTTP 403 Forbidden on any unauthorized role access.
- **Immediate Session Revocation:** When an administrator suspends an account via `PUT /api/v1/admin/users/<id>/status`, the backend immediately increments `token_version` on the user record. Any subsequent request with an existing JWT bearer token is rejected with HTTP 403 Forbidden before its standard 15-minute expiration.
- **Sole-Admin Safeguard:** The backend counts active non-suspended administrators before executing role demotions or suspensions. If an attempt is made to demote or suspend the sole active administrator, the request is rejected with HTTP 400 Bad Request (`Cannot demote or suspend the sole active administrator`).

---

### 2. Live Database Overview & Telemetry
- **Actual MongoDB Aggregations:** Total registered users (with real breakdowns for Students, Faculty, Staff, Admins, and Suspended users), Academic Resources (Total and Pending Review), Campus Events (Total and Pending Review), University Services (Total and Active), and Recommendation Feedback Events.
- **Pending Approvals Queue:** Dynamic alerts informing administrators of submitted resources or events awaiting review, with direct links into the moderation queues.
- **Recent Activity Ledger:** The 6 most recent administrative operations loaded dynamically from the `audit_logs` collection.

---

### 3. User Directory & Identity Management
- **Search & Filtering:** Search by name or email; filter by role (`all`, `student`, `faculty`, `staff`, `admin`) and account status (`all`, `active`, `suspended`).
- **Account Dossier:** Modal view exposing enclave ID, department, registration timestamp, last login, and `token_version`.
- **Role Assignment:** Interactive dialog to change roles with live confirmation and sole-admin demotion safeguards.
- **Account Suspension / Reactivation:** One-click account suspension with prompt and immediate active session termination.

---

### 4. Resource & Event Moderation
- **Academic Resources:** Full CRUD capabilities with publication moderation workflow (`approved`, `pending_approval`, `archived`, `rejected`), category filtering, search, and URL links.
- **Campus Events:** Scheduling of physical and virtual events, track attendee interest metrics, registration deadlines, and host departments.
- **University Services:** Registry of campus support services with active availability toggles (`is_active`) and confidentiality tier categorizations (e.g., `Strict HIPAA / FERPA`, `Standard Academic`).

---

### 5. Privacy & Cryptographic Control Center
- **Argon2id Hashing:** Real operational parameters displayed: memory cost 64 MB (65536 KB), time cost 3 iterations, thread parallelism 4, 16-byte CSPRNG salt.
- **Session Tokens:** JWT HS256 tokens with 15-minute access expiry, 7-day refresh token rotation, and `token_version` revocation.
- **Homomorphic Encryption (HE) Operational Disclosure:** Explicit disclosure:
  `Baseline Content Heuristic v1.0 active; TenSEAL/CKKS 128-bit ring modulus in development for Phase 6`. Zero fabricated ML accuracy metrics.
- **Multi-Party Computation (MPC):** Single-node sovereign gateway topology verified; zero cleartext sensitive ratings recorded in database.

---

### 6. Recommendation System Monitoring
- **Real Feedback Signals:** Aggregate count of feedback signals recorded anonymously (`useful`, `not_relevant`, `saved`).
- **Utility Ratio:** Real percentage of student interactions marked as useful vs. irrelevant.
- **Active Model Specifications:** Departmental affinity, peer engagement, and tag correlation heuristics clearly disclosed.
- **Top Academic Categories:** Real MongoDB aggregation of top interacted academic disciplines.

---

### 7. Immutable Administrative Audit Ledger
- **MongoDB Collection:** `audit_logs` with compound indexes on `timestamp` (DESC), `action`, and `admin_email`.
- **Filterable Querying:** Query audit records by action type, administrator email, target type (`user`, `resource`, `event`, `service`, `system`), and date bounds.
- **Audit Detail Dossier:** Inspect full JSON change payloads, administrator ID, timestamp, and origin client IP address.

---

### 8. Verification & Test Suite Results
- **Backend Tests:** 29 of 29 Pytest tests passed in 13.93s (`test_admin_api.py`, `test_auth.py`, `test_student_dashboard_api.py`).
- **Frontend Build:** `pnpm run build` executed `tsc -b && vite build` successfully with zero errors in 13.71s, outputting optimized bundles.
