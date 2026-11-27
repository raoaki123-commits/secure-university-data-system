# SECURE RESOURCE RECOMMENDATION SYSTEM FOR UNIVERSITY COMMUNITIES
## Comprehensive REST API Documentation & Engineering Specification
**Team Code:** 2602233 | **Project Code:** SHTKS (26O2227) | **API Version:** 1.0.0

---

### Overview & Architecture
The Flask backend provides a secure, modular REST API powering the university community platform. All endpoints are accessible both via standardized unversioned routes (`/api/...`) and versioned routes (`/api/v1/...`) for complete frontend and client compatibility.

#### Key Security Principles
1. **Zero-Cleartext Password Storage:** Passwords hashed with **Argon2id** (`memory_cost=64MB`, `time_cost=3`, `parallelism=4`, 16-byte salt).
2. **Stateless JWT Tokens with Token Versioning:** Short-lived access tokens (15 minutes) and rotating refresh tokens (7 days). Session invalidation and account suspension immediately increment `token_version` on the user record in MongoDB, revoking all active JWTs on the next request.
3. **Multi-Tiered RBAC Enforcement:** Levels 1 to 4:
   - **Student:** Access personalized recommendations, bookmarks, events, services, and personal privacy preferences.
   - **Faculty:** Publish academic resources, schedule academic seminars, and explore curriculum data.
   - **Staff:** Register and manage campus health, tutoring, and career services.
   - **Admin (Level 4):** Full platform authority, account suspension, role modification, catalog curation, and immutable audit log inspection.
4. **Homomorphic Encryption (HE) & MPC Subsystem:** Transparent baseline heuristic simulation (`Baseline Content Heuristic v1.0`), recording privacy operation metadata without storing raw cleartext vectors. TenSEAL/CKKS C++ bindings contract explicitly defined.

---

### Standard Response Format

#### Standard Success Response
```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "status": 200
}
```

#### Standard Error Response
```json
{
  "success": false,
  "message": "Invalid request parameters.",
  "error_code": "VALIDATION_ERROR",
  "status": 400,
  "details": {
    "missing_fields": ["password"]
  }
}
```

---

### 1. Authentication Endpoints

#### `POST /api/auth/register` (also `/api/v1/auth/register`)
- **Access:** Public (Rate Limited: 15 attempts / minute / IP)
- **Header:** `X-Admin-Provision-Key` (mandatory if requesting `role: "admin"`)
- **Body:**
```json
{
  "full_name": "Alan Turing",
  "email": "a.turing@university.edu",
  "password": "SecurePassword123!",
  "confirm_password": "SecurePassword123!",
  "role": "student",
  "department": "Computer Science & Engineering"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "status": 201,
  "tokens": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "expires_in": 900,
    "token_type": "Bearer"
  },
  "user": {
    "id": "672...3f",
    "name": "Alan Turing",
    "email": "a.turing@university.edu",
    "role": "student",
    "department": "Computer Science & Engineering",
    "account_status": "active"
  }
}
```

#### `POST /api/auth/login` (also `/api/v1/auth/login`)
- **Access:** Public (Rate Limited: 10 attempts / minute / IP)
- **Body:**
```json
{
  "email": "a.turing@university.edu",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):** Returns JWT access and refresh tokens and sanitized user dossier.

#### `POST /api/auth/refresh` (also `/api/v1/auth/refresh`)
- **Access:** Public (requires valid refresh token)
- **Body:** `{ "refresh_token": "eyJhbGciOi..." }`
- **Response (200 OK):** Rotates refresh token and returns fresh access token.

#### `POST /api/auth/logout` (also `/api/v1/auth/logout`)
- **Access:** Authenticated (`Authorization: Bearer <token>`)
- **Response (200 OK):** `{ "success": true, "message": "Successfully logged out. Active session terminated." }`

#### `GET /api/auth/me` (also `/api/v1/auth/me`)
- **Access:** Authenticated (`Authorization: Bearer <token>`)
- **Response (200 OK):** Returns current user's profile and active permissions.

---

### 2. User Directory Endpoints

#### `GET /api/users` (also `/api/v1/users`)
- **Access:** Roles: `admin`, `faculty`, `staff`
- **Query Params:** `role` (`student`, `faculty`, `staff`, `admin`), `status` (`active`, `suspended`), `search`, `limit`, `skip`
- **Response (200 OK):** Paginated user list.

#### `GET /api/users/<id>` (also `/api/v1/users/<id>`)
- **Access:** Owner or Roles: `admin`, `faculty`, `staff`
- **Response (200 OK):** User account details (excluding password hash).

#### `PUT /api/users/<id>` (also `/api/v1/users/<id>`)
- **Access:** Owner or Role: `admin`
- **Body:** `{ "full_name": "Updated Name", "department": "Data Science" }`
- **Response (200 OK):** Updated user object.

#### `DELETE /api/users/<id>` (also `/api/v1/users/<id>`)
- **Access:** Role: `admin` only (with sole-admin protection)
- **Response (200 OK):** `{ "success": true, "message": "User account deleted successfully." }`

---

### 3. Academic Resources Endpoints

#### `GET /api/resources` (also `/api/v1/resources`)
- **Access:** Public / Authenticated
- **Query Params:** `category`, `department`, `search`, `sort` (`newest`, `saves`, `rating`, `title`), `limit`, `skip`
- **Response (200 OK):** List of resources matching filter criteria.

#### `POST /api/resources` (also `/api/v1/resources`)
- **Access:** Roles: `admin`, `faculty`, `staff`
- **Body:**
```json
{
  "title": "Distributed Consensus in Adversarial Networks",
  "description": "Comprehensive analysis of Byzantine fault tolerant protocols.",
  "category": "Computer Science",
  "department": "Computer Science & Engineering",
  "author_or_source": "Prof. Leslie Lamport",
  "tags": ["Consensus", "Distributed Systems"],
  "format": "PDF",
  "access_level": "All Students",
  "url": "https://library.university.edu/papers/bft-consensus"
}
```
- **Response (201 Created):** Created resource object.

#### `GET /api/resources/<id>` (also `/api/v1/resources/<id>`)
- **Access:** Public / Authenticated
- **Response (200 OK):** Resource details or 404 if not found.

#### `PUT /api/resources/<id>` (also `/api/v1/resources/<id>`)
- **Access:** Resource Creator or Role: `admin`
- **Body:** Fields to update (`title`, `description`, `rating`, `status`, etc.)
- **Response (200 OK):** Updated resource.

#### `DELETE /api/resources/<id>` (also `/api/v1/resources/<id>`)
- **Access:** Role: `admin`
- **Response (200 OK):** `{ "success": true, "message": "Resource deleted successfully." }`

---

### 4. Campus Events Endpoints

#### `GET /api/events` (also `/api/v1/events`)
- **Access:** Public / Authenticated
- **Query Params:** `category`, `search`, `virtual_only` (`true`/`false`), `limit`, `skip`
- **Response (200 OK):** List of scheduled events sorted chronologically.

#### `POST /api/events` (also `/api/v1/events`)
- **Access:** Roles: `admin`, `faculty`, `staff`
- **Body:**
```json
{
  "title": "Homomorphic Encryption in Modern Healthcare Symposium",
  "description": "Guest lectures on CKKS schemes for medical records.",
  "category": "Workshops",
  "date": "2026-11-30",
  "time": "14:00 - 17:00",
  "location": "Turing Engineering Hall Room 101",
  "is_virtual": false,
  "registration_required": true,
  "tags": ["Cryptography", "Privacy"]
}
```
- **Response (201 Created):** Created event object.

#### `GET /api/events/<id>`, `PUT /api/events/<id>`, `DELETE /api/events/<id>`
- Standard REST endpoints for event inspection, update, and cancellation.

---

### 5. University Services Endpoints

#### `GET /api/services` (also `/api/v1/services`)
- **Access:** Public / Authenticated
- **Query Params:** `category`, `search`, `include_inactive` (`true`/`false`), `limit`, `skip`
- **Response (200 OK):** Active university support services.

#### `POST /api/services` (also `/api/v1/services`)
- **Access:** Roles: `admin`, `staff`
- **Body:**
```json
{
  "name": "Student Confidential Mental Health Counseling",
  "description": "Licensed clinical therapy and stress management sessions.",
  "category": "Health & Wellness",
  "contact_email": "wellness@university.edu",
  "location": "Wellness Center Suite 200",
  "hours": "Mon-Fri: 09:00 - 17:00",
  "confidentiality_tier": "Strict HIPAA / FERPA",
  "is_active": true,
  "tags": ["Mental Health", "Confidential"]
}
```
- **Response (201 Created):** Registered service object.

#### `GET /api/services/<id>`, `PUT /api/services/<id>`, `DELETE /api/services/<id>`
- Standard REST endpoints for service inspection, update, and removal.

---

### 6. Recommendations & Feedback Endpoints

#### `GET /api/recommendations` (also `/api/v1/recommendations`, `/api/v1/recommendations/student`)
- **Access:** Authenticated (`Authorization: Bearer <token>`)
- **Query Params:** `item_type` (`resource`, `event`, `service`), `limit`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Recommendations computed successfully.",
  "data": {
    "count": 10,
    "recommender_metadata": {
      "engine": "Baseline Content Heuristic v1.0",
      "is_baseline": true,
      "ml_framework": "TensorFlow 2.x (Slated for Phase 6 Engineering)",
      "student_department": "Computer Science & Engineering",
      "description": "Computed via departmental affinity and engagement heuristics."
    },
    "recommendations": [
      {
        "item_id": "res_001",
        "item_type": "resource",
        "title": "Quantum Computing Principles",
        "category": "Physics",
        "department": "Physics & Engineering",
        "score": 0.88,
        "explanation": "[Baseline Heuristic] Department affinity & Highly rated by peers"
      }
    ]
  }
}
```

#### `POST /api/recommendations` (also `/api/v1/recommendations`)
- **Access:** Authenticated (`Authorization: Bearer <token>`)
- **Use Case A (Feedback):** Submit `{ "item_id": "res_001", "item_type": "resource", "feedback": "useful" }`
- **Use Case B (On-Demand Compute):** Submit `{ "item_type": "resource", "limit": 5 }`

#### `GET /api/recommendations/<id>` (also `/api/v1/recommendations/<id>`)
- **Access:** Authenticated (`Authorization: Bearer <token>`)
- **Response (200 OK):** Detailed score breakdown and explanation for a specific item.

---

### 7. Privacy & Cryptography Endpoints

#### `GET /api/privacy/status` (also `/api/v1/privacy/status`)
- **Access:** Authenticated (`Authorization: Bearer <token>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "homomorphic_encryption": {
      "active_scheme": "CKKS / Differential Noise Scale Baseline v1.0",
      "target_scheme": "CKKS (TenSEAL / Microsoft SEAL)",
      "polynomial_ring_modulus": "N=8192, log(Q)=200, 128-bit security",
      "zero_cleartext_guarantee": true,
      "status": "BASELINE_ACTIVE (CKKS HE module in Phase 6 engineering)"
    },
    "multi_party_computation": {
      "architecture": "Single-Server Sovereign Gateway",
      "mpc_nodes_online": 1,
      "active_protocol": "Additive Secret Sharing v1.0 (Gateway Single-Node)",
      "target_protocol": "BGW / SPDZ Multi-Node Oblivious Dot-Product",
      "status": "GATEWAY_ONLINE (Multi-node MPC cluster planned for Phase 6)"
    }
  }
}
```

#### `GET /api/privacy/operations` (also `/api/v1/privacy/operations`)
- **Access:** Authenticated (`Authorization: Bearer <token>`)
- **Response (200 OK):** Audit records of privacy operations performed for user.

#### `POST /api/privacy/operations/simulate` (also `/api/v1/privacy/operations/simulate`)
- **Access:** Authenticated (`Authorization: Bearer <token>`)
- **Body:** `{ "operation_type": "HE_NOISE_PERTURBATION", "vector": [0.8, 0.9], "epsilon": 0.5 }`
- **Response (201 Created):** Executes privacy-preserving perturbation and logs audit record.

---

### 8. Admin Command Center Endpoints

#### `GET /api/admin/overview` (also `/api/admin/stats`, `/api/v1/admin/stats`)
- **Access:** Role: `admin` only
- **Response (200 OK):** Real database statistics: total users (students, faculty, staff, admins, active, suspended), resources, events, services, recommendation feedback events, pending approval counts, and recent activity logs.

#### `GET /api/admin/system-status` (also `/api/admin/security/status`)
- **Access:** Role: `admin` only
- **Response (200 OK):** Cryptographic configurations (Argon2id parameters, JWT HS256 expiry, HE, MPC, RBAC status).

#### `GET /api/admin/audit-logs` (also `/api/v1/admin/audit-logs`)
- **Access:** Role: `admin` only
- **Query Params:** `action`, `admin_email`, `target_type`, `date_from`, `date_to`, `limit`, `skip`
- **Response (200 OK):** Immutable administrative activity audit trail.
