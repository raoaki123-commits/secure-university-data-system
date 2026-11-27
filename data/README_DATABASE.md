# University Community System - Database Storage & Visual Explorer
**Project:** Secure Resource Recommendation System for University Communities (SDG 4)  
**Storage Locations:** `community/database/` and `community/data/`

---

## 📁 What Are These Database Files?

Every table in the university system is stored as a direct, human-readable JSON database file in this folder:

| File Name | Stored Information | Purpose in University System |
| :--- | :--- | :--- |
| **`users.json`** | Student, Faculty, Staff, and Admin accounts | Stores user IDs, names, emails, roles, departments, and active statuses. |
| **`resources.json`** | Academic materials & learning resources | Textbooks, research publications, lab manuals, and peer-rated materials (SDG 4). |
| **`events.json`** | Campus events, hackathons, seminars | Upcoming university events, dates, locations, capacities, and attendee counts. |
| **`services.json`** | University student support services | Tutoring labs, mental health counseling, writing center, and career guidance. |
| **`bookmarks.json`** | Student saved items | Records of learning materials and services bookmarked by students. |
| **`recommendation_feedback.json`** | Student ratings and clicks | Feedback used to train and refine personalized recommendation rankings. |
| **`privacy_preferences.json`** | Student consent & privacy toggles | Differential privacy epsilon ($\epsilon$), homomorphic noise scale, and consent history. |
| **`privacy_operations.json`** | Cryptographic audit trail | Real-time log of CKKS homomorphic vector encryptions and 3-Party MPC calculations. |
| **`audit_logs.json`** | System security audit trail | Access logs, authentication attempts, IP addresses, and severity levels. |
| **`all_database_tables.json`** | Complete consolidated database dump | Master JSON snapshot of all 9 database tables in one file. |

---

## 🚀 3 Easy Ways to Show Your Teachers the Database

### Method 1: Open the Files Directly in VS Code or Notepad (Instant Proof)
1. In VS Code or Windows File Explorer, open the `database/` folder.
2. Click on **`users.json`** to show the 4 pre-configured personas (`student.test@university.edu`, `faculty.lead@university.edu`, etc.).
3. Click on **`resources.json`** to show published academic papers and courses.
4. *Live Demonstration*: Register a new user in the web application or add a bookmark, then open `users.json` or `bookmarks.json`—the new record is right there in plain text!

---

### Method 2: Double-Click the Standalone Visual Database Viewer (Zero Setup Needed)
1. In Windows File Explorer, navigate to:
   `c:\Users\raoak\Desktop\antigravity\community\database\`
2. Double-click **`DATABASE_VIEWER.html`**.
3. It will instantly open in your default browser (Chrome / Edge / Firefox):
   - Shows live tabbed navigation across all 9 tables.
   - Includes real-time search filtering.
   - Shows row counts for each table.
   - Requires **no servers running** and **no software installed**!

---

### Method 3: In-Browser Live Database View (While Backend is Running)
When your FastAPI backend is running (`python run.py`), visit:
- **`http://127.0.0.1:5000/database`**

This displays the visual database explorer generated directly by the live API with real-time updates!
