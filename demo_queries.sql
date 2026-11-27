-- ==============================================================================
-- UNIVERSITY SYSTEM DATABASE DEMONSTRATION QUERIES
-- Database File: data/university_system.db
-- Purpose: Live visual queries for teachers using DB Browser for SQLite
-- Project: Secure Resource Recommendation System for University Communities (SDG 4)
-- ==============================================================================

-- 1. System Users & Roles
SELECT id, email, full_name, role, department, is_active, created_at FROM users ORDER BY role ASC;

-- 2. Academic Resources (SDG 4 Quality Education)
SELECT id, title, category, department, tags, rating, rating_count, created_at FROM resources ORDER BY rating DESC;

-- 3. Campus Events & Workshops
SELECT id, title, location, date, department, capacity, attendees_count FROM events ORDER BY date ASC;

-- 4. University Support Services
SELECT id, name, category, building, room, availability, contact_email FROM services;

-- 5. Student Bookmarks
SELECT b.id AS bookmark_id, u.full_name AS student_name, r.title AS resource_title, r.category, b.created_at
FROM bookmarks b
JOIN users u ON b.user_id = u.id
JOIN resources r ON b.resource_id = r.id;

-- 6. Recommendation Feedback
SELECT rf.id AS feedback_id, u.full_name AS student_name, rf.item_id, rf.action_type, rf.rating, rf.created_at
FROM recommendation_feedback rf
JOIN users u ON rf.user_id = u.id
ORDER BY rf.created_at DESC;

-- 7. Privacy Preferences & Consent
SELECT pp.id, u.email, pp.share_department_with_recommender, pp.collect_interaction_history, pp.homomorphic_noise_scale, pp.differential_privacy_epsilon, pp.last_consent_at
FROM privacy_preferences pp
JOIN users u ON pp.user_id = u.id;

-- 8. Cryptographic Operations Log (HE & MPC)
SELECT id, operation_type, user_id, details, timestamp FROM privacy_operations ORDER BY timestamp DESC;

-- 9. Audit Logs
SELECT id, event_type, user_id, severity, ip_address, details, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 20;

-- 10. System Summary Counts
SELECT 
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM resources) AS total_resources,
    (SELECT COUNT(*) FROM events) AS total_events,
    (SELECT COUNT(*) FROM services) AS total_services,
    (SELECT COUNT(*) FROM bookmarks) AS total_bookmarks,
    (SELECT COUNT(*) FROM recommendation_feedback) AS total_feedbacks,
    (SELECT COUNT(*) FROM privacy_preferences) AS total_privacy_settings,
    (SELECT COUNT(*) FROM privacy_operations) AS total_crypto_ops,
    (SELECT COUNT(*) FROM audit_logs) AS total_audit_logs;
