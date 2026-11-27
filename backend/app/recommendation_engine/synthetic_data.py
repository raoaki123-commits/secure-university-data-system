"""
Synthetic Dataset Generator for University Recommendation System.
Generates realistic students, faculty, staff, academic resources, events,
services, and interaction matrices with departmental affinity and cross-disciplinary serendipity.
"""
import random
import time
from typing import List, Dict, Any, Tuple
from .preprocessing import pseudonymize_user_id

DEPARTMENTS = [
    "Computer Science",
    "Data Science & AI",
    "Electrical Engineering",
    "Information Security",
    "Biomedical Engineering",
    "Mathematics & Statistics",
    "Business Administration"
]

INTERESTS_MAP = {
    "Computer Science": ["Algorithms", "Machine Learning", "Cloud Systems", "Distributed Systems", "Web Engineering"],
    "Data Science & AI": ["Deep Learning", "Natural Language Processing", "Computer Vision", "Reinforcement Learning", "Big Data"],
    "Electrical Engineering": ["VLSI Design", "Embedded Systems", "Signal Processing", "Robotics", "IoT Architecture"],
    "Information Security": ["Zero-Knowledge Proofs", "Cryptography", "Network Defense", "Secure Enclaves", "Identity Management"],
    "Biomedical Engineering": ["Computational Genomics", "Neuroimaging", "Biosensors", "Bioinformatics", "Biomechanics"],
    "Mathematics & Statistics": ["Differential Equations", "Stochastic Calculus", "Information Theory", "Linear Algebra", "Optimization"],
    "Business Administration": ["Tech Entrepreneurship", "Quantitative Finance", "Product Management", "Strategic Management", "Operations"]
}

RESOURCE_TEMPLATES = [
    ("Advanced Distributed Systems Lecture Notes", "Academic Notes", "Computer Science", ["Cloud Systems", "Distributed Systems"]),
    ("Neural Network Optimization & Backpropagation Survey", "Research Paper", "Data Science & AI", ["Deep Learning", "Optimization"]),
    ("Zero-Knowledge Cryptography Handbook", "Guide", "Information Security", ["Zero-Knowledge Proofs", "Cryptography"]),
    ("FPGA Architecture and Hardware Synthesis Kit", "Lab Guide", "Electrical Engineering", ["Embedded Systems", "VLSI Design"]),
    ("Computational Genomics Alignment Pipeline Codebase", "Dataset & Code", "Biomedical Engineering", ["Computational Genomics", "Bioinformatics"]),
    ("Convex Optimization in High Dimensions", "Textbook Excerpt", "Mathematics & Statistics", ["Optimization", "Linear Algebra"]),
    ("Tech Venture Capital Valuation Framework", "Case Study", "Business Administration", ["Tech Entrepreneurship", "Quantitative Finance"]),
    ("Secure Multi-Party Computation Benchmark Suite", "Research Paper", "Information Security", ["Cryptography", "Secure Enclaves"]),
    ("Large Language Model Alignment & Safety Guide", "Research Paper", "Data Science & AI", ["Natural Language Processing", "AI Ethics"]),
    ("Robotics Kinematics Simulation Environment", "Software", "Electrical Engineering", ["Robotics", "Control Systems"]),
    ("Privacy-Preserving Federated Learning Survey", "Research Paper", "Computer Science", ["Machine Learning", "Privacy"]),
    ("Stochastic Differential Equations in FinTech", "Lecture Notes", "Mathematics & Statistics", ["Stochastic Calculus", "Quantitative Finance"])
]

EVENT_TEMPLATES = [
    ("Annual AI & Machine Learning Research Symposium", "Symposium", "Data Science & AI", ["Machine Learning", "Deep Learning"], 14),
    ("Institutional Cyber Defense & Cryptography Summit", "Conference", "Information Security", ["Cryptography", "Network Defense"], 21),
    ("Cloud Architecture & Microservices Hackathon", "Hackathon", "Computer Science", ["Cloud Systems", "Distributed Systems"], 7),
    ("Robotics and Autonomous Systems Expo", "Exhibition", "Electrical Engineering", ["Robotics", "Embedded Systems"], 30),
    ("Biomedical Computing & AI Health Forum", "Colloquium", "Biomedical Engineering", ["Bioinformatics", "Biosensors"], 45),
    ("University Venture Pitch & Angel Showcase", "Competition", "Business Administration", ["Tech Entrepreneurship", "Product Management"], 10),
    ("Linear Algebra for Modern Neural Nets Workshop", "Workshop", "Mathematics & Statistics", ["Linear Algebra", "Optimization"], 5),
    ("Quantum Computing Foundations Guest Lecture", "Seminar", "Computer Science", ["Quantum", "Information Theory"], 28)
]

SERVICE_TEMPLATES = [
    ("High-Performance GPU Computing Cluster Access", "Research Computing", "Data Science & AI", ["Cloud Systems", "Big Data", "Deep Learning"]),
    ("Cryptographic Security Enclave & Key Vault Service", "Security Infrastructure", "Information Security", ["Cryptography", "Secure Enclaves"]),
    ("Academic Writing & Peer-Review Advisory Lab", "Academic Support", "Computer Science", ["Peer Review", "Research", "Publishing"]),
    ("Hardware Prototyping & PCB Fabrication Lab", "Lab Facilities", "Electrical Engineering", ["VLSI Design", "Embedded Systems", "Robotics"]),
    ("Bioinformatics Sequencing & Cloud Storage Pipeline", "Bioinformatics", "Biomedical Engineering", ["Computational Genomics", "Bioinformatics"]),
    ("University Technology Incubator & Startup Hub", "Innovation Support", "Business Administration", ["Tech Entrepreneurship", "Product Management"]),
    ("Statistical Consulting & Data Analysis Desk", "Academic Support", "Mathematics & Statistics", ["Optimization", "Stochastic Calculus"])
]


def generate_synthetic_users(n_students: int = 40, n_faculty: int = 8, n_staff: int = 4) -> List[Dict[str, Any]]:
    """Generate realistic synthetic university community users."""
    users = []
    user_counter = 1

    roles = (
        [("student", n_students)] +
        [("faculty", n_faculty)] +
        [("staff", n_staff)]
    )

    for role, count in roles:
        for _ in range(count):
            uid = f"usr_{user_counter:04d}"
            user_counter += 1
            dept = random.choice(DEPARTMENTS)
            dept_interests = INTERESTS_MAP.get(dept, ["General"])
            user_interests = random.sample(dept_interests, k=min(len(dept_interests), random.randint(2, 4)))
            
            # Chance of cross-department interest
            other_dept = random.choice([d for d in DEPARTMENTS if d != dept])
            cross_interest = random.choice(INTERESTS_MAP[other_dept])
            user_interests.append(cross_interest)

            users.append({
                "_id": uid,
                "id": uid,
                "pseudonymous_id": pseudonymize_user_id(uid),
                "name": f"University Member {user_counter}",
                "role": role,
                "department": dept,
                "academic_interests": user_interests,
                "privacy_preferences": {
                    "share_department_with_recommender": True,
                    "enable_differential_privacy": True,
                    "differential_privacy_epsilon": 0.5,
                    "allow_collaborative_filtering": True
                }
            })

    return users


def generate_synthetic_catalog() -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Generate synthetic catalog items: resources, events, and services."""
    resources = []
    for i, (title, cat, dept, tags) in enumerate(RESOURCE_TEMPLATES):
        rid = f"res_{i+1:03d}"
        resources.append({
            "_id": rid,
            "id": rid,
            "title": title,
            "category": cat,
            "department": dept,
            "tags": tags,
            "rating": round(random.uniform(4.0, 5.0), 1),
            "saves_count": random.randint(15, 120),
            "status": "approved",
            "format": "PDF / Code",
            "description": f"Comprehensive {cat.lower()} on {title.lower()} tailored for {dept} researchers.",
            "is_active": True
        })

    events = []
    now = time.time()
    for i, (title, cat, dept, tags, day_offset) in enumerate(EVENT_TEMPLATES):
        eid = f"evt_{i+1:03d}"
        # Set date in future
        event_time = time.strftime("%Y-%m-%d", time.localtime(now + day_offset * 86400))
        events.append({
            "_id": eid,
            "id": eid,
            "title": title,
            "category": cat,
            "department_or_host": dept,
            "department": dept,
            "tags": tags,
            "date": event_time,
            "location": f"{dept} Innovation Auditorium #{random.randint(100, 400)}",
            "attendees_count": random.randint(20, 250),
            "status": "approved",
            "description": f"{title} hosted by {dept}. Open to all university scholars.",
            "is_active": True
        })

    services = []
    for i, (name, cat, dept, tags) in enumerate(SERVICE_TEMPLATES):
        sid = f"srv_{i+1:03d}"
        services.append({
            "_id": sid,
            "id": sid,
            "name": name,
            "title": name,
            "category": cat,
            "department": dept,
            "tags": tags,
            "availability_status": "Active",
            "rating": round(random.uniform(4.2, 5.0), 1),
            "saves_count": random.randint(30, 180),
            "description": f"High-reliability university service for {name}. Dedicated support from {dept}.",
            "is_active": True
        })

    return resources, events, services


def generate_synthetic_interactions(
    users: List[Dict[str, Any]],
    catalog_items: List[Dict[str, Any]],
    interactions_per_user_range: Tuple[int, int] = (6, 14)
) -> List[Dict[str, Any]]:
    """
    Generate realistic user-item interaction records.
    Simulates high probability of interaction when department or interests align,
    with noise and cross-domain interactions.
    """
    interactions = []

    for user in users:
        uid = user["_id"]
        pseudo_id = user["pseudonymous_id"]
        u_dept = user["department"]
        u_interests = set(user["academic_interests"])

        n_inter = random.randint(interactions_per_user_range[0], interactions_per_user_range[1])
        # Sample items with weighted probability
        weights = []
        for item in catalog_items:
            i_dept = item.get("department", "")
            i_tags = set(item.get("tags", []))
            # Affinity score
            score = 1.0
            if i_dept == u_dept:
                score += 4.0
            common_tags = u_interests.intersection(i_tags)
            score += len(common_tags) * 3.0
            weights.append(score)

        sampled_items = random.choices(catalog_items, weights=weights, k=n_inter)
        # Unique items per user
        seen_items = set()
        for item in sampled_items:
            item_id = item["_id"]
            if item_id in seen_items:
                continue
            seen_items.add(item_id)

            # Rating logic: higher if matched
            i_dept = item.get("department", "")
            common_tags = u_interests.intersection(set(item.get("tags", [])))
            
            base_rating = 3.5
            if i_dept == u_dept:
                base_rating += 0.8
            if common_tags:
                base_rating += 0.7
            
            rating = min(5.0, max(1.0, round(base_rating + random.uniform(-0.5, 0.5), 1)))
            norm_rating = (rating - 1.0) / 4.0  # scaled to [0.0, 1.0]

            interactions.append({
                "raw_user_id": uid,
                "user_id": pseudo_id,
                "item_id": item_id,
                "item_type": item.get("category", "resource"),
                "rating": rating,
                "normalized_rating": round(norm_rating, 4),
                "interaction_type": random.choice(["save", "rating", "click", "view"]),
                "timestamp": int(time.time() - random.randint(100, 86400 * 30))
            })

    return interactions


def train_test_split(interactions: List[Dict[str, Any]], test_ratio: float = 0.2, seed: int = 42) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Split interaction dataset into train and test sets avoiding data leakage.
    Ensures cold-start / unseen interactions are placed into test set while maintaining
    representative distribution.
    """
    rng = random.Random(seed)
    shuffled = list(interactions)
    rng.shuffle(shuffled)
    
    n_test = int(len(shuffled) * test_ratio)
    test_set = shuffled[:n_test]
    train_set = shuffled[n_test:]
    return train_set, test_set
