import logging
from datetime import datetime

logger = logging.getLogger(__name__)

INITIAL_RESOURCES = [
    {
        "_id": "res_crypto_01",
        "id": "res_crypto_01",
        "title": "CS301: Cryptography & Network Security Course Notes",
        "description": "Comprehensive institutional lecture notes covering AES-256, RSA key exchange, discrete logarithms, and zero-knowledge proofs.",
        "category": "study-materials",
        "department": "Computer Science",
        "author_or_source": "Prof. Aris Thorne",
        "tags": ["Cryptography", "Zero-Knowledge", "Network Security", "Algorithms"],
        "format": "PDF Document",
        "access_level": "University Accredited",
        "rating": 4.9,
        "saves_count": 84,
        "url": "https://cs.university.edu/courses/cs301/notes.pdf",
        "created_at": "2026-09-10T10:00:00Z"
    },
    {
        "_id": "res_ckks_02",
        "id": "res_ckks_02",
        "title": "Practical Homomorphic Encryption with CKKS in Python",
        "description": "Step-by-step tutorial on polynomial arithmetic, encoding floating-point vectors, scaling, and rescale operations in Pyfhel / TenSEAL.",
        "category": "learning-materials",
        "department": "Computer Science",
        "author_or_source": "Sovereign Systems Lab",
        "tags": ["CKKS", "Homomorphic Encryption", "TenSEAL", "Python"],
        "format": "Jupyter Notebook",
        "access_level": "University Accredited",
        "rating": 4.8,
        "saves_count": 126,
        "url": "https://github.com/university/ckks-hands-on-tutorial",
        "created_at": "2026-10-01T14:30:00Z"
    },
    {
        "_id": "res_lin_alg_03",
        "id": "res_lin_alg_03",
        "title": "Linear Algebra for Machine Learning: SVD & Eigendecomposition",
        "description": "Rigorous mathematical reference on singular value decomposition, low-rank approximations, and spectral graph theory.",
        "category": "study-materials",
        "department": "Mathematics",
        "author_or_source": "Dr. Elena Rostova",
        "tags": ["Mathematics", "Linear Algebra", "SVD", "Optimization"],
        "format": "Interactive Reference",
        "access_level": "Public",
        "rating": 4.7,
        "saves_count": 62,
        "url": "https://math.university.edu/refs/linear-algebra-ml.pdf",
        "created_at": "2026-08-15T09:15:00Z"
    },
    {
        "_id": "res_research_04",
        "id": "res_research_04",
        "title": "IEEE Preprint: Multi-Party Private Recommendation Protocols",
        "description": "Peer-reviewed analysis comparing Yao's Garbled Circuits, GMW protocol, and Homomorphic Encryption for high-throughput collaborative filtering.",
        "category": "research-resources",
        "department": "Computer Science",
        "author_or_source": "Cybersecurity & Privacy Institute",
        "tags": ["Research Paper", "MPC", "Recommendation Systems", "Privacy"],
        "format": "PDF Document",
        "access_level": "University Accredited",
        "rating": 4.95,
        "saves_count": 93,
        "url": "https://arxiv.org/abs/2602.08819",
        "created_at": "2026-10-18T16:00:00Z"
    },
    {
        "_id": "res_fellowship_05",
        "id": "res_fellowship_05",
        "title": "NSF Undergraduate Fellowship in Trustworthy Artificial Intelligence",
        "description": "Competitive student grant providing $6,000 summer stipend, faculty mentorship, and high-performance computing allocations.",
        "category": "academic-opportunities",
        "department": "Interdisciplinary",
        "author_or_source": "Office of Undergraduate Research",
        "tags": ["Grants", "Fellowship", "NSF", "Undergraduate Research"],
        "format": "Grant Application Guide",
        "access_level": "University Accredited",
        "rating": 4.6,
        "saves_count": 145,
        "url": "https://research.university.edu/grants/nsf-tai-2026",
        "created_at": "2026-10-25T11:00:00Z"
    },
    {
        "_id": "res_tut_docker_06",
        "id": "res_tut_docker_06",
        "title": "Containerized ML Clusters with Docker & Slurm",
        "description": "Practical DevOps tutorial on packaging TensorFlow jobs for academic supercomputer batch execution with GPU passthrough.",
        "category": "tutorials",
        "department": "Electrical Engineering",
        "author_or_source": "Campus High Performance Computing Core",
        "tags": ["DevOps", "Docker", "HPC", "TensorFlow"],
        "format": "Code Repository & Guide",
        "access_level": "University Accredited",
        "rating": 4.75,
        "saves_count": 78,
        "url": "https://hpc.university.edu/docs/docker-slurm-guide",
        "created_at": "2026-09-28T13:20:00Z"
    },
    {
        "_id": "res_support_tutoring_07",
        "id": "res_support_tutoring_07",
        "title": "Departmental Peer Tutoring Hub: Discrete Math & Proofs",
        "description": "Weekly peer-led tutoring sessions covering induction, predicate logic, recurrence relations, and graph traversals.",
        "category": "academic-support",
        "department": "Mathematics",
        "author_or_source": "Math Learning Center",
        "tags": ["Tutoring", "Discrete Math", "Study Groups", "Peer Mentoring"],
        "format": "Schedule & Booking",
        "access_level": "University Accredited",
        "rating": 4.85,
        "saves_count": 110,
        "url": "https://math.university.edu/tutoring/discrete",
        "created_at": "2026-09-01T08:00:00Z"
    },
    {
        "_id": "res_bio_08",
        "id": "res_bio_08",
        "title": "Computational Genomics & Biological Database Queries",
        "description": "Reference manual on NCBI E-utilities, UniProt REST queries, and AlphaFold structural database integration.",
        "category": "learning-materials",
        "department": "Interdisciplinary",
        "author_or_source": "Bioinformatics Group",
        "tags": ["Bioinformatics", "Genomics", "Databases", "Python"],
        "format": "Online Manual",
        "access_level": "Public",
        "rating": 4.65,
        "saves_count": 42,
        "url": "https://bioinfo.university.edu/handbook",
        "created_at": "2026-10-12T15:45:00Z"
    }
]

INITIAL_EVENTS = [
    {
        "_id": "evt_hack_01",
        "id": "evt_hack_01",
        "title": "SovereignHacks 2026: Privacy-Preserving Computing Hackathon",
        "description": "36-hour collegiate hackathon focused on Zero-Knowledge systems, homomorphic encryption, and Community SDG challenges.",
        "category": "Hackathon",
        "department_or_host": "ACM Student Chapter & Cyber Institute",
        "date": "2026-11-28",
        "time": "09:00 - 21:00 EST",
        "location": "Turing Center for Computational Innovation",
        "is_virtual": False,
        "registration_required": True,
        "registration_deadline": "2026-11-25",
        "tags": ["Hackathon", "SDG", "Cryptography", "Cash Prizes"],
        "attendees_count": 240
    },
    {
        "_id": "evt_colloq_02",
        "id": "evt_colloq_02",
        "title": "Distinguished Lecture: Frontiers of Fully Homomorphic Encryption",
        "description": "Keynote by Prof. Shafi Goldwasser on lattice-based cryptography, bootstrapping acceleration, and privacy in consumer AI.",
        "category": "Guest Lecture",
        "department_or_host": "Department of Computer Science",
        "date": "2026-12-02",
        "time": "16:00 - 17:30 EST",
        "location": "Von Neumann Hall Auditorium & Zoom Stream",
        "is_virtual": True,
        "registration_required": False,
        "registration_deadline": "2026-12-01",
        "tags": ["Lecture", "Lattice Cryptography", "FHE", "Distinguished Speaker"],
        "attendees_count": 380
    },
    {
        "_id": "evt_career_03",
        "id": "evt_career_03",
        "title": "STEM Career Expo & Technical Interview Practicum",
        "description": "Over 50 university industry partners recruiting for co-ops, internships, and full-time software and research positions.",
        "category": "Career Fair",
        "department_or_host": "University Career Center",
        "date": "2026-12-05",
        "time": "10:00 - 16:00 EST",
        "location": "University Grand Pavilion, Level 2",
        "is_virtual": False,
        "registration_required": True,
        "registration_deadline": "2026-12-03",
        "tags": ["Career Fair", "Internships", "Networking", "Industry"],
        "attendees_count": 850
    },
    {
        "_id": "evt_wellness_04",
        "id": "evt_wellness_04",
        "title": "Midterm Wellness & Mindfulness Study Break",
        "description": "Certified wellness counselors offering guided relaxation, ergonomic consultations, and free healthy study nourishment.",
        "category": "Workshop",
        "department_or_host": "Campus Health & Psychological Services",
        "date": "2026-11-22",
        "time": "13:00 - 15:00 EST",
        "location": "Student Commons Garden Terrace",
        "is_virtual": False,
        "registration_required": False,
        "registration_deadline": "2026-11-22",
        "tags": ["Wellness", "Mental Health", "Mindfulness", "Community"],
        "attendees_count": 120
    }
]

INITIAL_SERVICES = [
    {
        "_id": "srv_counseling_01",
        "id": "srv_counseling_01",
        "name": "Confidential Psychological Counseling & Crisis Support",
        "description": "Licensed campus clinical staff providing 1-on-1 confidential counseling, stress management, and 24/7 crisis hotlines.",
        "category": "Student Support",
        "contact_email": "confidential.wellness@university.edu",
        "location": "Health Sciences Complex, Suite 320",
        "hours": "Mon-Fri: 08:30 - 18:00 (24/7 on call)",
        "confidentiality_tier": "High (Zero-Knowledge Intake)",
        "is_active": True,
        "tags": ["Counseling", "Mental Health", "Confidential", "Crisis Support"]
    },
    {
        "_id": "srv_access_02",
        "id": "srv_access_02",
        "name": "University Disability & Accessibility Services (UDAS)",
        "description": "Academic accommodation plans, assistive software licenses, extended exam time coordination, and campus transit escorts.",
        "category": "Student Support",
        "contact_email": "accessibility@university.edu",
        "location": "Student Center, Room 112",
        "hours": "Mon-Fri: 09:00 - 17:00",
        "confidentiality_tier": "Standard FERPA",
        "is_active": True,
        "tags": ["Accessibility", "Accommodations", "Assistive Tech", "Equity"]
    },
    {
        "_id": "srv_library_carrels_03",
        "id": "srv_library_carrels_03",
        "name": "Main Library Silent Research Carrels & Archive Access",
        "description": "Reserve individual sound-isolated study carrels equipped with high-speed Ethernet and dual 4K monitors.",
        "category": "Library Services",
        "contact_email": "library.carrels@university.edu",
        "location": "Main Research Library, Floors 4-6",
        "hours": "Open 24 Hours with Student ID",
        "confidentiality_tier": "Standard FERPA",
        "is_active": True,
        "tags": ["Library", "Quiet Study", "Study Spaces", "Monitors"]
    },
    {
        "_id": "srv_tech_lending_04",
        "id": "srv_tech_lending_04",
        "name": "Hardware Loaner Program & Technical Repair Depot",
        "description": "Short-term loans of MacBook Pros, Linux ThinkPads, GPU compute nodes, graphing calculators, and free hardware diagnosis.",
        "category": "Technical Support",
        "contact_email": "tech.depot@university.edu",
        "location": "Engineering Hall Basement, Lab B02",
        "hours": "Mon-Fri: 10:00 - 16:00",
        "confidentiality_tier": "Standard FERPA",
        "is_active": True,
        "tags": ["Hardware Loaners", "Laptops", "Repairs", "IT Support"]
    },
    {
        "_id": "srv_career_coaching_05",
        "id": "srv_career_coaching_05",
        "name": "Academic & Career Coaching Center",
        "description": "1-on-1 resume reviews, mock behavioral and coding interview preparation, and graduate school application guidance.",
        "category": "Career Guidance",
        "contact_email": "career.coaching@university.edu",
        "location": "Student Union, 2nd Floor",
        "hours": "Mon-Thu: 09:00 - 18:00, Fri: 09:00 - 15:00",
        "confidentiality_tier": "Standard FERPA",
        "is_active": True,
        "tags": ["Career", "Resume Review", "Mock Interviews", "Advising"]
    }
]

def seed_database(db):
    """Seed initial resources, events, and services if collections are empty."""
    try:
        res_col = db['resources']
        if res_col.count_documents({}) == 0:
            res_col.insert_many(INITIAL_RESOURCES)
            logger.info(f"Seeded {len(INITIAL_RESOURCES)} initial academic resources.")

        evt_col = db['events']
        if evt_col.count_documents({}) == 0:
            evt_col.insert_many(INITIAL_EVENTS)
            logger.info(f"Seeded {len(INITIAL_EVENTS)} initial university events.")

        srv_col = db['services']
        if srv_col.count_documents({}) == 0:
            srv_col.insert_many(INITIAL_SERVICES)
            logger.info(f"Seeded {len(INITIAL_SERVICES)} initial university services.")
    except Exception as e:
        logger.error(f"Error seeding database collections: {e}")
