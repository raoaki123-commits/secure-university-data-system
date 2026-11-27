-- ==============================================================================
-- UNIVERSITY SYSTEM DATABASE DEMONSTRATION QUERIES
-- Database File: data/university_system.db
-- Purpose: Live visual queries for teachers using DB Browser for SQLite
-- Project: Secure Resource Recommendation System for University Communities (SDG 4)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. INSPECT SYSTEM USERS & ROLES
-- Demonstrates user account storage, password hashing (Argon2id/Bcrypt), and roles.
-- ------------------------------------------------------------------------------
SELECT 
    id, 
    email, 
    full_name, 
    role, 
    department, 
    is_active, 
    created_at 
FROM users 
ORDER BY role ASC;

-- Query specific personas (Student, Faculty, Staff, Admin)
SELECT email, full_name, role, department FROM users WHERE email LIKE '%@university.edu';


-- ------------------------------------------------------------------------------
-- 2. ACADEMIC RESOURCES (SDG 4: Quality Education)
-- Shows published academic materials, courses, labs, and research papers.
-- ------------------------------------------------------------------------------
SELECT 
    id, 
    title, 
    category, 
    department, 
    tags, 
    rating, 
    rating_count, 
    created_at 
FROM resources 
ORDER BY rating DESC;

-- View Computer Science resources specifically
SELECT title, category, department, url FROM resources WHERE department = 'Computer Science';


-- ------------------------------------------------------------------------------
-- 3. CAMPUS EVENTS & WORKSHOPS
-- Demonstrates academic hackathons, guest lectures, and student workshops.
-- ------------------------------------------------------------------------------
SELECT 
    id, 
    title, 
    location, 
    date, 
    department, 
    capacity, 
    attendees_count 
FROM events 
ORDER BY date ASC;


-- ------------------------------------------------------------------------------
-- 4. UNIVERSITY SUPPORT SERVICES
-- Demonstrates mental health counseling, tutoring, and career services.
-- ------------------------------------------------------------------------------
SELECT 
    id, 
    name, 
    category, 
    building, 
    room, 
    availability, 
    contact_email 
FROM services;


-- ------------------------------------------------------------------------------
-- 5. STUDENT BOOKMARKS & SAVED RESOURCES
-- Shows the relation between users and saved learning resources.
-- ------------------------------------------------------------------------------
SELECT 
    b.id AS bookmark_id,
    u.full_name AS student_name,
    u.department AS student_department,
    r.title AS resource_title,
    r.category,
    b.created_at
FROM bookmarks b
JOIN users u ON b.user_id = u.id
JOIN resources r ON b.resource_id = r.id;


-- ------------------------------------------------------------------------------
-- 6. RECOMMENDATION FEEDBACK & IMPRESSIONS
-- Demonstrates user feedback (clicks, ratings, relevance) used to train the recommender.
-- ------------------------------------------------------------------------------
SELECT 
    rf.id AS feedback_id,
    u.full_name AS student_name,
    rf.item_id,
    rf.action_type,
    rf.rating,
    rf.created_at
FROM recommendation_feedback rf
JOIN users u ON rf.user_id = u.id
ORDER BY rf.created_at DESC;


-- ------------------------------------------------------------------------------
-- 7. STUDENT PRIVACY CONSENT & PREFERENCES
-- Demonstrates zero-knowledge settings, differential privacy epsilon, and consent toggles.
-- ------------------------------------------------------------------------------
SELECT 
    pp.id,
    u.email,
    pp.share_department_with_recommender,
    pp.collect_interaction_history,
    pp.homomorphic_noise_scale,
    pp.differential_privacy_epsilon,
    pp.anonymize_bookmarks,
    pp.last_consent_at
FROM privacy_preferences pp
JOIN users u ON pp.user_id = u.id;


-- ------------------------------------------------------------------------------
-- 8. CRYPTOGRAPHIC OPERATIONS LOG (HOMOMORPHIC ENCRYPTION & MPC)
-- Visual proof of privacy operations: CKKS vector encryptions and 3-Party MPC dot products.
-- ------------------------------------------------------------------------------
SELECT 
    id, 
    operation_type, 
    user_id, 
    details, 
    timestamp 
FROM privacy_operations 
ORDER BY timestamp DESC;


-- ------------------------------------------------------------------------------
-- 9. AUDIT & ACCESS LOGS
-- Complete security and compliance trail of user logins, role checks, and catalog access.
-- ------------------------------------------------------------------------------
SELECT 
    id, 
    event_type, 
    user_id, 
    severity, 
    ip_address, 
    details, 
    timestamp 
FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 20;


-- ------------------------------------------------------------------------------
-- 10. SYSTEM SUMMARY DASHBOARD QUERY
-- Teacher overview counting total rows across all system tables.
-- ------------------------------------------------------------------------------
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
