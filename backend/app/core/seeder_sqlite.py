import json
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.db_models import (
    User, Resource, Event, Service, Bookmark,
    RecommendationFeedback, PrivacyPreference, PrivacyOperation, AuditLog
)
from app.core.security import PasswordSecurity
from app.core.seeder import INITIAL_RESOURCES, INITIAL_EVENTS, INITIAL_SERVICES

logger = logging.getLogger(__name__)

DEMO_PASSWORD = "DemoPassword2026!"

DEMO_USERS = [
    {
        "id": "usr_student_01",
        "name": "Alex Chen",
        "email": "student.test@university.edu",
        "role": "student",
        "department": "Computer Science",
    },
    {
        "id": "usr_faculty_02",
        "name": "Prof. Marcus Vance",
        "email": "faculty.lead@university.edu",
        "role": "faculty",
        "department": "Computer Science",
    },
    {
        "id": "usr_staff_03",
        "name": "Sarah Jenkins",
        "email": "campus.staff@university.edu",
        "role": "staff",
        "department": "Student Affairs",
    },
    {
        "id": "usr_admin_04",
        "name": "Dr. Eleanor Vance",
        "email": "root.admin@university.edu",
        "role": "admin",
        "department": "Information Security",
    }
]


def seed_sqlite_database(db: Session):
    """Seed SQLite database with essential demo records if empty."""
    now = datetime.now(timezone.utc)

    # 1. Seed Users
    user_count = db.query(User).count()
    if user_count == 0:
        logger.info("Seeding demo user accounts...")
        hashed_pw = PasswordSecurity.hash_password(DEMO_PASSWORD)

        for u in DEMO_USERS:
            user_obj = User(
                id=u["id"],
                name=u["name"],
                email=u["email"],
                password_hash=hashed_pw,
                role=u["role"],
                department=u["department"],
                account_status="active",
                is_active=True,
                token_version=1,
                created_at=now,
                updated_at=now
            )
            db.add(user_obj)

            # Default Privacy Preference for each user
            pref_obj = PrivacyPreference(
                id=f"pref_{u['id']}",
                user_id=u["id"],
                share_department_with_recommender=True,
                collect_interaction_history=True,
                homomorphic_noise_scale=0.05,
                differential_privacy_epsilon=0.5,
                zero_knowledge_audit_logging=True,
                anonymize_bookmarks=True,
                last_consent_at=now,
                updated_at=now
            )
            db.add(pref_obj)

        db.commit()
        logger.info("Successfully seeded 4 demo user personas with active credentials.")

    # 2. Seed Academic Resources
    res_count = db.query(Resource).count()
    if res_count == 0:
        logger.info("Seeding academic resources...")
        for r in INITIAL_RESOURCES:
            tags = r.get("tags", [])
            res_obj = Resource(
                id=r.get("id") or r.get("_id"),
                title=r.get("title"),
                description=r.get("description", ""),
                category=r.get("category", "study-materials"),
                department=r.get("department", "Computer Science"),
                author_or_source=r.get("author_or_source", "University Faculty"),
                tags_json=json.dumps(tags),
                format=r.get("format", "PDF Document"),
                access_level=r.get("access_level", "Public"),
                rating=float(r.get("rating", 4.8)),
                saves_count=int(r.get("saves_count", 50)),
                url=r.get("url", ""),
                status="Approved",
                created_at=now
            )
            db.add(res_obj)
        db.commit()
        logger.info(f"Seeded {len(INITIAL_RESOURCES)} academic resources.")

    # 3. Seed Campus Events
    evt_count = db.query(Event).count()
    if evt_count == 0:
        logger.info("Seeding university events...")
        for e in INITIAL_EVENTS:
            tags = e.get("tags", [])
            evt_obj = Event(
                id=e.get("id") or e.get("_id"),
                title=e.get("title"),
                description=e.get("description", ""),
                category=e.get("category", "General"),
                department_or_host=e.get("department_or_host", "University Event Core"),
                date=e.get("date", "2026-12-01"),
                time=e.get("time", "14:00 - 16:00 EST"),
                location=e.get("location", "Campus Hall"),
                is_virtual=bool(e.get("is_virtual", False)),
                registration_required=bool(e.get("registration_required", False)),
                registration_deadline=e.get("registration_deadline", ""),
                tags_json=json.dumps(tags),
                attendees_count=int(e.get("attendees_count", 100)),
                status="Approved",
                created_at=now
            )
            db.add(evt_obj)
        db.commit()
        logger.info(f"Seeded {len(INITIAL_EVENTS)} campus events.")

    # 4. Seed Support Services
    srv_count = db.query(Service).count()
    if srv_count == 0:
        logger.info("Seeding student support services...")
        for s in INITIAL_SERVICES:
            tags = s.get("tags", [])
            srv_obj = Service(
                id=s.get("id") or s.get("_id"),
                name=s.get("name"),
                description=s.get("description", ""),
                category=s.get("category", "Student Support"),
                contact_email=s.get("contact_email", "support@university.edu"),
                location=s.get("location", "Student Center"),
                hours=s.get("hours", "Mon-Fri: 09:00 - 17:00"),
                confidentiality_tier=s.get("confidentiality_tier", "Standard FERPA"),
                is_active=bool(s.get("is_active", True)),
                tags_json=json.dumps(tags),
                created_at=now
            )
            db.add(srv_obj)
        db.commit()
        logger.info(f"Seeded {len(INITIAL_SERVICES)} campus services.")

    # 5. Seed Demonstration Bookmarks & Recommendation Feedback
    bm_count = db.query(Bookmark).count()
    if bm_count == 0:
        sample_bm = Bookmark(
            id="bm_demo_01",
            user_id="usr_student_01",
            item_id="res_crypto_01",
            item_type="resource",
            title="CS301: Cryptography & Network Security Course Notes",
            category="study-materials",
            department="Computer Science",
            saved_at=now,
            metadata_json=json.dumps({"format": "PDF Document", "rating": 4.9})
        )
        db.add(sample_bm)

        sample_feedback = RecommendationFeedback(
            id="fb_demo_01",
            user_id="usr_student_01",
            item_id="res_ckks_02",
            item_type="resource",
            title="Practical Homomorphic Encryption with CKKS in Python",
            category="learning-materials",
            feedback="useful",
            timestamp=now
        )
        db.add(sample_feedback)
        db.commit()

    # 6. Seed Sample Audit Log & Privacy Operation
    audit_count = db.query(AuditLog).count()
    if audit_count == 0:
        init_log = AuditLog(
            id="audit_init_01",
            action="SYSTEM_INITIALIZE_SQLITE",
            admin_id="usr_admin_04",
            admin_email="root.admin@university.edu",
            target_id="database",
            target_type="SQLite_Schema",
            details_json=json.dumps({"database": "data/university_system.db", "status": "Ready"}),
            ip_address="127.0.0.1",
            timestamp=now
        )
        db.add(init_log)

        init_op = PrivacyOperation(
            id="priv_op_01",
            operation_type="HE_KEYSTORE_INITIALIZATION",
            user_id="usr_admin_04",
            algorithm="CKKS 128-bit (N=8192)",
            parameters_json=json.dumps({"security_level": "128-bit", "scale": "2^40"}),
            computation_time_ms=12.4,
            timestamp=now
        )
        db.add(init_op)
        db.commit()
        logger.info("Initialized audit log and privacy operation tables.")
