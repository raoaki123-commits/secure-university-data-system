from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class PrivacyPreferencesUpdate(BaseModel):
    share_department_with_recommender: Optional[bool] = None
    collect_interaction_history: Optional[bool] = None
    homomorphic_noise_scale: Optional[float] = None
    differential_privacy_epsilon: Optional[float] = None
    zero_knowledge_audit_logging: Optional[bool] = None
    anonymize_bookmarks: Optional[bool] = None


class EncryptVectorRequest(BaseModel):
    vector: List[float]


class DecryptVectorRequest(BaseModel):
    ciphertext: str


class ObliviousDotProductRequest(BaseModel):
    ciphertext: str
    plain_vector: List[float]


class MPCShareRequest(BaseModel):
    value: float
    num_parties: int = 3


class MPCDotProductRequest(BaseModel):
    vector_a: List[float]
    vector_b: List[float]
