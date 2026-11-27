import hashlib
import re
from typing import Dict, Any, List, Tuple, Optional, Set

ENCLAVE_SALT = "sovereign-recommender-privacy-salt-2026"

def pseudonymize_user_id(user_id: str, salt: str = ENCLAVE_SALT) -> str:
    """
    Produce a deterministic, one-way pseudonymous identifier for a user ID.
    Decouples institutional identity from ML recommendation feature tables.
    """
    if not user_id:
        return "anon_unknown"
    hasher = hashlib.sha256()
    hasher.update(f"{salt}:{str(user_id)}".encode('utf-8'))
    return f"usr_pseudo_{hasher.hexdigest()[:16]}"

def clean_text(text: Optional[str]) -> str:
    """Clean and normalize string text, removing punctuation and lowering case."""
    if not text or not isinstance(text, str):
        return ""
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
    return " ".join(cleaned.split())

def extract_tags(tags_input: Any) -> List[str]:
    """Safely normalize tag lists or comma-separated strings."""
    if not tags_input:
        return []
    if isinstance(tags_input, list):
        tags = []
        for t in tags_input:
            if isinstance(t, str):
                for sub in t.split(','):
                    c = clean_text(sub)
                    if c:
                        tags.append(c)
        return tags
    if isinstance(tags_input, str):
        return [clean_text(t) for t in tags_input.split(',') if t and clean_text(t)]
    return []

class FeatureExtractor:
    """
    Transforms raw MongoDB models (User, Resource, Event, Service)
    into clean, normalized feature vectors for Content-Based and Collaborative models.
    """

    @staticmethod
    def extract_user_features(user_doc: Dict[str, Any], privacy_prefs: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Extract user preference features respecting student privacy consent flags.
        """
        prefs = privacy_prefs or {}
        share_dept = prefs.get('share_department_with_recommender', True)
        raw_user_id = str(user_doc.get('_id', user_doc.get('id', 'anon')))

        department = clean_text(user_doc.get('department', '')) if share_dept else 'privacy_masked'

        return {
            'pseudonymous_id': pseudonymize_user_id(raw_user_id),
            'raw_user_id': raw_user_id,
            'role': clean_text(user_doc.get('role', 'student')),
            'department': department,
            'interests': extract_tags(user_doc.get('academic_interests') or user_doc.get('interests') or [department]),
            'share_department': share_dept
        }

    @staticmethod
    def extract_item_features(item_doc: Dict[str, Any], item_type: str) -> Dict[str, Any]:
        """
        Extract normalized features for a candidate item (resource, event, service).
        """
        item_id = str(item_doc.get('_id', item_doc.get('id', '')))
        title = clean_text(item_doc.get('title') or item_doc.get('name') or '')
        description = clean_text(item_doc.get('description', ''))
        category = clean_text(item_doc.get('category', 'General'))
        department = clean_text(item_doc.get('department') or item_doc.get('department_or_host') or 'General')
        tags = extract_tags(item_doc.get('tags', []))

        # Build composite content bag-of-words
        content_text = f"{title} {description} {category} {department} {' '.join(tags)}"

        # Normalized rating (0.0 to 1.0)
        raw_rating = float(item_doc.get('rating', 4.0))
        norm_rating = max(0.0, min(1.0, raw_rating / 5.0))

        # Normalized engagement (saves or attendees, log scale capped at 1.0)
        saves_count = float(item_doc.get('saves_count', item_doc.get('attendees_count', 0)))
        norm_popularity = min(1.0, saves_count / 100.0)

        return {
            'item_id': item_id,
            'item_type': item_type,
            'title': item_doc.get('title') or item_doc.get('name') or 'Item',
            'clean_title': title,
            'category': category,
            'department': department,
            'tags': tags,
            'content_text': content_text,
            'norm_rating': round(norm_rating, 4),
            'norm_popularity': round(norm_popularity, 4),
            'is_active': item_doc.get('is_active', True),
            'status': item_doc.get('status', 'approved'),
            'date': item_doc.get('date'),
            'location': item_doc.get('location'),
            'format': item_doc.get('format', 'Standard')
        }

class CategoricalVocabulary:
    """
    Maintains integer index mappings for categorical IDs (users, items, categories)
    with dedicated <UNK> (unknown) and <COLD_START> token index for novel entities.
    """
    def __init__(self):
        self.item2idx: Dict[str, int] = {'<UNK>': 0}
        self.idx2item: Dict[int, str] = {0: '<UNK>'}
        self.user2idx: Dict[str, int] = {'<UNK>': 0}
        self.idx2user: Dict[int, str] = {0: '<UNK>'}

    def fit(self, user_ids: List[str], item_ids: List[str]):
        """Build vocabularies from lists of IDs."""
        for u in user_ids:
            if u not in self.user2idx:
                idx = len(self.user2idx)
                self.user2idx[u] = idx
                self.idx2user[idx] = u

        for i in item_ids:
            if i not in self.item2idx:
                idx = len(self.item2idx)
                self.item2idx[i] = idx
                self.idx2item[idx] = i

    def encode_user(self, user_id: str) -> int:
        return self.user2idx.get(user_id, 0)

    def encode_item(self, item_id: str) -> int:
        return self.item2idx.get(item_id, 0)

    @property
    def num_users(self) -> int:
        return len(self.user2idx)

    @property
    def num_items(self) -> int:
        return len(self.item2idx)
