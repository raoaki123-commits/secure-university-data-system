from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.db_models import User, PrivacyPreference, PrivacyOperation
from app.schemas.privacy import (
    PrivacyPreferencesUpdate, EncryptVectorRequest, DecryptVectorRequest,
    ObliviousDotProductRequest, MPCShareRequest, MPCDotProductRequest
)
from app.services.encryption_service import HomomorphicEncryptionService
from app.services.mpc_service import MPCService
from app.security.jwt import get_current_user

router = APIRouter(tags=["Privacy & Cryptography"])


@router.get("/status", status_code=status.HTTP_200_OK)
def get_privacy_status(current_user: User = Depends(get_current_user)):
    """Return cryptographic subsystem health, CKKS scheme status, and MPC cluster topology."""
    he_status = HomomorphicEncryptionService.get_status()
    mpc_status = MPCService.get_status()

    payload = {
        "homomorphic_encryption": he_status,
        "multi_party_computation": mpc_status,
        "zero_cleartext_guarantee": True,
        "compliance": "OWASP / University Academic Privacy Standard / HomomorphicEncryption.org"
    }

    return {
        "status": 200,
        "message": "Privacy & cryptographic subsystem status retrieved.",
        "privacy_status": payload,
        "data": payload
    }


@router.get("/context", status_code=status.HTTP_200_OK)
def get_public_context(current_user: User = Depends(get_current_user)):
    """Retrieve serialized public CKKS evaluation context for client-side vector encryption."""
    pub_ctx_b64 = HomomorphicEncryptionService.get_public_context_base64()
    if not pub_ctx_b64:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Public cryptographic context is not initialized."
        )

    return {
        "status": 200,
        "message": "Public CKKS evaluation context retrieved successfully.",
        "data": {
            "public_context": pub_ctx_b64,
            "scheme": "CKKS",
            "poly_modulus_degree": 8192,
            "security_level": "128-bit"
        }
    }


@router.post("/encrypt", status_code=status.HTTP_200_OK)
def encrypt_vector(
    payload: EncryptVectorRequest,
    current_user: User = Depends(get_current_user)
):
    """Encrypt a floating-point preference or rating vector using CKKS."""
    if not payload.vector:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vector cannot be empty.")

    res = HomomorphicEncryptionService.encrypt_vector(payload.vector, user_id=current_user.id)
    return {
        "status": 200,
        "message": "Vector homomorphically encrypted using CKKS.",
        **res
    }


@router.post("/decrypt", status_code=status.HTTP_200_OK)
def decrypt_vector(
    payload: DecryptVectorRequest,
    current_user: User = Depends(get_current_user)
):
    """Decrypt a CKKS ciphertext using the server-held secret key (authorized client persona)."""
    if not payload.ciphertext:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ciphertext is required.")

    res = HomomorphicEncryptionService.decrypt_vector(payload.ciphertext, user_id=current_user.id)
    if isinstance(res, dict) and "error" in res:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=res["error"])

    decrypted_vec = res if isinstance(res, list) else res.get("decrypted_vector", [])
    return {
        "status": 200,
        "message": "Vector successfully decrypted.",
        "decrypted_vector": decrypted_vec
    }


@router.post("/oblivious-dot-product", status_code=status.HTTP_200_OK)
def oblivious_dot_product(
    payload: ObliviousDotProductRequest,
    current_user: User = Depends(get_current_user)
):
    """Perform server-side oblivious dot-product without decrypting the student's preference vector."""
    if not payload.ciphertext or not payload.plain_vector:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Both ciphertext and plain_vector are required.")

    res = HomomorphicEncryptionService.compute_oblivious_dot_product(
        payload.ciphertext, payload.plain_vector, user_id=current_user.id
    )
    if isinstance(res, dict) and "error" in res:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=res["error"])

    return {
        "status": 200,
        "message": "Oblivious dot-product evaluated successfully on ciphertext.",
        **res
    }


@router.post("/mpc/share", status_code=status.HTTP_200_OK)
def mpc_share_secret(
    payload: MPCShareRequest,
    current_user: User = Depends(get_current_user)
):
    """Split a scalar secret into additive secret shares across non-colluding MPC nodes."""
    shares = MPCService.share_secret(payload.value, num_parties=payload.num_parties)
    return {
        "status": 200,
        "message": f"Secret split into {len(shares)} additive shares.",
        "shares": shares,
        "num_parties": payload.num_parties
    }


@router.post("/mpc/dot-product", status_code=status.HTTP_200_OK)
def mpc_dot_product(
    payload: MPCDotProductRequest,
    current_user: User = Depends(get_current_user)
):
    """Execute 3-party semi-honest Beaver Triple dot-product across cluster nodes."""
    if len(payload.vector_a) != len(payload.vector_b):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vectors must have matching dimensions.")

    res = MPCService.secure_dot_product_3party(payload.vector_a, payload.vector_b, user_id=current_user.id)
    return {
        "status": 200,
        "message": "3-Party MPC dot-product executed successfully.",
        **res
    }


@router.get("/preferences", status_code=status.HTTP_200_OK)
def get_privacy_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch student privacy consent and algorithmic preferences."""
    pref = db.query(PrivacyPreference).filter(PrivacyPreference.user_id == current_user.id).first()
    if not pref:
        pref = PrivacyPreference(
            id=f"pref_{current_user.id}",
            user_id=current_user.id,
            share_department_with_recommender=True,
            collect_interaction_history=True,
            homomorphic_noise_scale=0.05,
            differential_privacy_epsilon=0.5,
            zero_knowledge_audit_logging=True,
            anonymize_bookmarks=True,
            last_consent_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)

    return {
        "status": 200,
        "preferences": pref.to_dict()
    }


@router.put("/preferences", status_code=status.HTTP_200_OK)
def update_privacy_preferences(
    payload: PrivacyPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update student privacy consent toggles."""
    pref = db.query(PrivacyPreference).filter(PrivacyPreference.user_id == current_user.id).first()
    if not pref:
        pref = PrivacyPreference(id=f"pref_{current_user.id}", user_id=current_user.id)
        db.add(pref)

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        if hasattr(pref, k):
            setattr(pref, k, v)

    pref.updated_at = datetime.now(timezone.utc)
    pref.last_consent_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(pref)

    return {
        "status": 200,
        "message": "Privacy preferences updated successfully.",
        "preferences": pref.to_dict()
    }


@router.get("/audit", status_code=status.HTTP_200_OK)
def get_privacy_audit_logs(
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve cryptographic and privacy operations log."""
    logs = db.query(PrivacyOperation).order_by(
        desc(PrivacyOperation.timestamp)
    ).limit(limit).all()

    return {
        "status": 200,
        "count": len(logs),
        "operations": [l.to_dict() for l in logs]
    }
