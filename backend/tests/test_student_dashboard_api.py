import pytest
from app.config import TestingConfig

def register_and_get_token(client, email="student.dash@university.edu", role="student"):
    res = client.post('/api/v1/auth/register', json={
        'name': 'Dash Student',
        'email': email,
        'password': 'Password123!',
        'role': role,
        'department': 'Computer Science'
    })
    return res.get_json()['tokens']['access_token']

def test_get_resources(client):
    res = client.get('/api/v1/resources')
    assert res.status_code == 200
    data = res.get_json()
    assert data['total'] >= 8
    assert len(data['resources']) >= 8

def test_filter_resources_by_category_and_search(client):
    # Filter by category
    res_cat = client.get('/api/v1/resources?category=study-materials')
    assert res_cat.status_code == 200
    assert all(r['category'] == 'study-materials' for r in res_cat.get_json()['resources'])

    # Search keyword
    res_search = client.get('/api/v1/resources?search=CKKS')
    assert res_search.status_code == 200
    assert len(res_search.get_json()['resources']) >= 1

def test_resource_detail_and_404(client):
    res = client.get('/api/v1/resources/res_crypto_01')
    assert res.status_code == 200
    assert res.get_json()['resource']['title'] == "CS301: Cryptography & Network Security Course Notes"

    res_404 = client.get('/api/v1/resources/non_existent_id')
    assert res_404.status_code == 404

def test_get_events(client):
    res = client.get('/api/v1/events')
    assert res.status_code == 200
    events = res.get_json()['events']
    assert len(events) >= 4
    assert any(e['title'].startswith('SovereignHacks') for e in events)

def test_get_services(client):
    res = client.get('/api/v1/services')
    assert res.status_code == 200
    services = res.get_json()['services']
    assert len(services) >= 5
    assert any('Counseling' in s['name'] for s in services)

def test_student_recommendations_baseline(client):
    token = register_and_get_token(client, "student.rec@university.edu")
    res = client.get('/api/v1/recommendations/student', headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 200
    data = res.get_json()
    assert data['recommender_metadata']['is_baseline'] is True
    assert len(data['recommendations']) > 0
    # Every recommendation should carry an explicit baseline explanation
    first_rec = data['recommendations'][0]
    assert '[Baseline Heuristic]' in first_rec['explanation']

def test_recommendation_feedback_and_history(client):
    token = register_and_get_token(client, "student.fb@university.edu")
    headers = {'Authorization': f'Bearer {token}'}

    # Submit feedback
    fb_res = client.post('/api/v1/recommendations/feedback', headers=headers, json={
        'item_id': 'res_crypto_01',
        'item_type': 'resource',
        'title': 'CS301: Cryptography Notes',
        'category': 'study-materials',
        'feedback': 'useful'
    })
    assert fb_res.status_code == 200

    # Query history
    hist_res = client.get('/api/v1/recommendations/history', headers=headers)
    assert hist_res.status_code == 200
    history = hist_res.get_json()['history']
    assert len(history) == 1
    assert history[0]['item_id'] == 'res_crypto_01'
    assert history[0]['feedback'] == 'useful'

def test_toggle_bookmark(client):
    token = register_and_get_token(client, "student.bm@university.edu")
    headers = {'Authorization': f'Bearer {token}'}

    # Save bookmark
    save_res = client.post('/api/v1/bookmarks', headers=headers, json={
        'item_id': 'res_crypto_01',
        'item_type': 'resource',
        'item_snapshot': {'title': 'CS301: Cryptography Notes', 'category': 'study-materials'}
    })
    assert save_res.status_code == 201
    assert save_res.get_json()['action'] == 'added'

    # Check bookmarks list
    list_res = client.get('/api/v1/bookmarks', headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.get_json()['bookmarks']) == 1

    # Toggle again -> removes bookmark
    unsave_res = client.post('/api/v1/bookmarks', headers=headers, json={
        'item_id': 'res_crypto_01',
        'item_type': 'resource'
    })
    assert unsave_res.status_code == 200
    assert unsave_res.get_json()['action'] == 'removed'

    # Check bookmarks list is empty
    list_res2 = client.get('/api/v1/bookmarks', headers=headers)
    assert len(list_res2.get_json()['bookmarks']) == 0

def test_privacy_preferences_flow(client):
    token = register_and_get_token(client, "student.priv@university.edu")
    headers = {'Authorization': f'Bearer {token}'}

    # Get initial preferences
    get_res = client.get('/api/v1/privacy/preferences', headers=headers)
    assert get_res.status_code == 200
    prefs = get_res.get_json()['preferences']
    assert prefs['homomorphic_noise_scale'] == 0.05

    # Update preferences
    put_res = client.put('/api/v1/privacy/preferences', headers=headers, json={
        'homomorphic_noise_scale': 0.12,
        'differential_privacy_epsilon': 0.8
    })
    assert put_res.status_code == 200
    updated = put_res.get_json()['preferences']
    assert updated['homomorphic_noise_scale'] == 0.12
    assert updated['differential_privacy_epsilon'] == 0.8

