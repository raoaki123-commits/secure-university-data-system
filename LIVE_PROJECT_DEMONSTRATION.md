# Live Project Demonstration & Presentation Playbook
## Secure Resource Recommendation System for University Communities
**Category:** Community SDG | **Primary Alignment:** UN SDG 4: Quality Education  
**Interactive Visual Artifacts:** DB Browser for SQLite + Swagger UI (`/docs`) + React 19 Frontend (`:5173`)

---

## 1. Pre-Flight Preparation Checklist (5 Minutes Before Presentation)

Before welcoming your teachers or opening Zoom/projector:

1. **Verify Database Exists**: Ensure `data/university_system.db` is present in the project root.
2. **Open DB Browser for SQLite**:
   - File -> Open Database -> select `c:\Users\raoak\Desktop\antigravity\community\data\university_system.db`.
   - Go to the **Execute SQL** tab and load `data/demo_queries.sql`.
3. **Open Two Terminal Windows**:
   - **Terminal 1 (Backend)**: `cd backend`
   - **Terminal 2 (Frontend)**: `cd frontend`
4. **Open Browser Tabs**:
   - Tab 1: `http://localhost:5173` (Frontend Single-Page App)
   - Tab 2: `http://127.0.0.1:5000/docs` (Interactive FastAPI Swagger Documentation)
   - Tab 3: `http://127.0.0.1:5000/database` (Visual Live Database Explorer)
   - Quick File: Double-click `database/DATABASE_VIEWER.html` to open all database tables in your browser without any server running!

---

## 2. Terminal Commands to Launch the Application

### Terminal 1: Start FastAPI Backend
```powershell
cd c:\Users\raoak\Desktop\antigravity\community\backend
.\venv\Scripts\python.exe run.py
```
*Expected Console Output:*
```
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
INFO:     Database tables verified.
INFO:     SQLite database verified with seed records.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:5000 (Press CTRL+C to quit)
```

### Terminal 2: Start React Frontend
```powershell
cd c:\Users\raoak\Desktop\antigravity\community\frontend
pnpm run dev
```
*Expected Console Output:*
```
  VITE v6.x.x  ready in 400 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## 3. Step-by-Step Live Persona Demonstration

### Phase 1: Authentication & Four-Persona Demo Login
1. Open `http://localhost:5173` in your browser.
2. Direct the teacher's attention to the login page:
   - Point out the four quick-fill demo buttons: **Student**, **Faculty**, **Staff**, and **Admin**.
   - Explain: *"Our platform enforces strict Role-Based Access Control (RBAC). For testing and academic evaluation, we have pre-configured four distinct personas with Argon2id-hashed credentials."*
3. Click the **Student Persona** button (`student.test@university.edu`) and click **Sign In**.

---

### Phase 2: Student Experience & Personalized Recommendations (SDG 4)
1. Upon logging in as the Student:
   - Point to the **Personalized Recommendations** carousel:
     - Show: *"CS301 Advanced Cryptography & Information Security"* and *"University Machine Learning Lab Open Access Repository"*.
     - Explain the ranking logic: *"The recommendation engine gives 40% weight to departmental affinity (Computer Science), 35% to peer quality ratings, and 25% to student interest tags."*
2. **Interact Live**:
   - Click the **Bookmark** button on one of the recommended cards.
   - Click a rating star (e.g., 5 stars) to submit feedback.
   - Switch to **DB Browser for SQLite** and click **Execute SQL**:
     ```sql
     SELECT * FROM bookmarks ORDER BY created_at DESC LIMIT 1;
     SELECT * FROM recommendation_feedback ORDER BY created_at DESC LIMIT 1;
     ```
   - Show the newly inserted record with timestamp to prove live end-to-end database connectivity!
3. **Privacy Consent Controls**:
   - Scroll to the **Privacy & Consent Settings** card.
   - Toggle the *Differential Privacy* slider ($\epsilon = 0.5$) or toggle *Homomorphic Obfuscation*.
   - Explain: *"Students maintain complete sovereignty over their data. Adjusting this slider injects calibrated Laplacian noise into their profile before sending it to the server."*

---

### Phase 3: Faculty Experience (Resource Authoring)
1. Click **Sign Out** in the top navigation.
2. Click the **Faculty Lead** persona button (`faculty.lead@university.edu`) and click **Sign In**.
3. Point out the Faculty Dashboard:
   - Faculty members can publish new academic materials, research datasets, and organize department symposiums.
   - Click **Create Academic Resource**:
     - Title: `Quantum Computing Primer (Fall 2026)`
     - Category: `Study Materials`
     - Department: `Physics`
     - Click **Publish**.
4. Show DB Browser for SQLite:
   ```sql
   SELECT title, category, department FROM resources WHERE title LIKE '%Quantum%';
   ```
   - Confirm the new resource is saved in SQLite!

---

### Phase 4: Campus Staff Experience (Support Services)
1. Sign out and sign in as **Campus Staff** (`campus.staff@university.edu`).
2. Show the Staff Services Dashboard:
   - Staff manage university wellness services, tutoring labs, and career guidance centers.
   - Point out the listed support services: *Academic Writing Center*, *Mental Health & Counseling*, *STEM Tutoring Lab*.
   - Explain: *"SDG 4 is not just about textbooks; student retention depends on timely access to mental health, disability accommodations, and career counseling."*

---

### Phase 5: System Admin Experience (Security & Cryptographic Audit)
1. Sign out and sign in as **System Admin** (`root.admin@university.edu`).
2. Show the Admin Control Center:
   - **System Metrics**: Total active users, resources, events, and privacy operations.
   - **Cryptographic Operations Log**: Shows real-time counts of CKKS homomorphic vector encryptions and 3-Party MPC dot products.
   - **Audit Logs Table**: Displays user logins, IP addresses, and security severity flags.

---

## 4. Demonstrating the Cryptographic Engine via Swagger UI

Open `http://127.0.0.1:5000/docs` to demonstrate raw API capabilities:

1. Locate the **Privacy & Cryptography** section:
   - **GET `/api/v1/privacy/status`**: Click *Try it out* -> *Execute*.
     - Shows scheme: `CKKS`, security level: `128-bit`, polynomial modulus: `8192`.
   - **POST `/api/v1/privacy/encrypt`**:
     - Request body: `{ "vector": [0.85, 0.42, 0.91, 0.12] }`
     - Response: Serialized Base64 ciphertext vector.
   - **POST `/api/v1/privacy/mpc/share`**:
     - Request body: `{ "value": 42.0, "num_parties": 3 }`
     - Response: 3 additive random shares that sum to `42.0` without revealing the secret.

---

## 5. Live Test Suite Execution for Teachers

To prove software quality and stability to your review committee, run the automated integration test suite in front of them:

```powershell
cd c:\Users\raoak\Desktop\antigravity\community\backend
.\venv\Scripts\pytest.exe tests/test_fastapi_e2e.py -v
```

*Show that all 6 tests pass cleanly with 100% green checkmarks!*

---

## 6. Emergency Recovery & Troubleshooting During Presentation

| Issue Encountered | Root Cause | Instant Fix |
| :--- | :--- | :--- |
| **Port 5000 Already in Use** | Previous Python process is still running | Open PowerShell: `Get-Process python \| Stop-Process -Force` then restart `run.py`. |
| **Frontend Cannot Connect (`ECONNREFUSED`)** | Backend is stopped | Verify Terminal 1 shows `Uvicorn running on http://127.0.0.1:5000`. |
| **Database Locks in DB Browser** | DB Browser has an uncommitted transaction | Click **Write Changes** in DB Browser, or close DB Browser while writing from frontend. |
