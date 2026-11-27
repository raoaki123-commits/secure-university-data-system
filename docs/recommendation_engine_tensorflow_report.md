# Sovereign University Community Platform: TensorFlow 2.x Recommendation Engine Report

**Project Name:** Secure Resource Recommendation System for University Communities  
**Official Team Code:** 2602233 / SHTKS (26O2227)  
**Engineering Module:** Phase ML — Production-Grade Machine Learning & Recommendation Architecture  
**Approved Stack:** Python 3.12, TensorFlow 2.21.0 / Keras 3.x, Flask, MongoDB  
**Status:** FULLY OPERATIONAL & VERIFIED (43/43 Pytest Tests Passing, Frontend Clean Build)

---

## 1. Executive Summary

This deliverable establishes an enterprise-grade, privacy-preserving recommendation engine engineered with **TensorFlow 2.x (NeuMF / Two-Tower Architecture)** and **TF-IDF Sparse Cosine Similarity**, integrated seamlessly into the existing modular Flask backend (`backend/app/recommendation_engine/`) and MongoDB persistence layer.

The engine provides multi-modal personalized discovery across:
1. **Academic Resources** (research publications, lecture notes, lab datasets, study guides)
2. **University Events** (symposiums, hackathons, guest colloquiums, career workshops)
3. **University Services** (high-performance GPU clusters, cryptographic key vaults, academic writing labs)

The system completely decouples institutional cleartext identity (student names, roll numbers, institutional emails) from machine learning feature stores via salted SHA-256 pseudonymous tokens (`usr_pseudo_<hash>`), ensuring zero institutional PII leaks into gradient updates, latent embeddings, or model checkpoints.

---

## 2. Complete Recommendation System Architecture

```
                                  +-------------------------------------------------------------+
                                  |                     Flask API Client                        |
                                  |    (GET /api/v1/recommendations, POST /api/v1/train)        |
                                  +------------------------------+------------------------------+
                                                                 |
                                                                 v
+-------------------------------------------------------------------------------------------------------------------------------+
|                                                RecommendationModelManager                                                     |
|                                         (app/recommendation_engine/model_manager.py)                                          |
+----------------------------------------------------------------+--------------------------------------------------------------+
                                                                 |
               +-------------------------------------------------+-------------------------------------------------+
               |                                                                                                   |
               v                                                                                                   v
+---------------------------------------+                                                         +---------------------------------------+
|        Content-Based Engine           |                                                         |          NeuMF Neural Engine          |
|    (content_based.py - TF-IDF)        |                                                         |         (collaborative.py)            |
| - Text tokenization & IDF scaling     |                                                         | - TensorFlow 2.x / Keras 3.x          |
| - Academic interests & tags match     |                                                         | - Pseudonymous User Embeddings (16d)  |
| - Department affinity dot product     |                                                         | - Catalog Item Embeddings (16d)       |
| - Sparsely normalized cosine vectors  |                                                         | - GMF Linear + MLP Deep Non-Linear    |
+-------------------+-------------------+                                                         +-------------------+-------------------+
                    |                                                                                                 |
                    | [Content Score $S_{content}$]                                        [Collaborative Score $S_{collab}$] |
                    +---------------------------------------------+---------------------------------------------------+
                                                                  |
                                                                  v
+-------------------------------------------------------------------------------------------------------------------------------+
|                                                    Hybrid Dynamic Ranker                                                      |
|                                           (app/recommendation_engine/hybrid_ranker.py)                                        |
| - Dynamic Cold-Start Shifting: $\alpha \to 1.0$ when entity is novel (<UNK> token index 0)                                      |
| - Temporal Freshness Filter: drops past events ($date < today$)                                                               |
| - Service Availability Filter: drops inactive services ($is\_active == False$ or status == "Inactive")                         |
| - Scoring: $S_{final} = \alpha \cdot S_{content} + (1 - \alpha) \cdot S_{collab}$                                             |
| - Privacy-Preserving Explanation Generator: contextual tags without leaking peer identity                                     |
+-----------------------------------------------------------------+-------------------------------------------------------------+
                                                                  |
                                                                  v
+-------------------------------------------------------------------------------------------------------------------------------+
|                                            Recommendation Evaluator & Reporter                                                |
|                                             (app/recommendation_engine/evaluator.py)                                          |
| - Precision@5, Precision@10 | Recall@5, Recall@10 | Hit Rate@5, Hit Rate@10 | NDCG@5, NDCG@10                                    |
| - Strict holdout validation without temporal or entity leakage                                                                |
+-------------------------------------------------------------------------------------------------------------------------------+
```

---

## 3. Data Model & Preprocessing Pipeline

### 3.1 Entity Schemas
- **User Document:** Institutional ID (`usr_XXXX`), pseudonymous ID (`usr_pseudo_XXXX`), role (`student`, `faculty`, `staff`, `admin`), department, academic interests list, privacy consent flags (`share_department_with_recommender`, `allow_collaborative_filtering`).
- **Resource Document:** ID, title, description, category (`study-materials`, `research`, `guides`), department, tags, rating (0.0 to 5.0), saves count, approval status.
- **Event Document:** ID, title, host department, tags, scheduled date (`YYYY-MM-DD`), location, attendees count, approval status.
- **Service Document:** ID, service name, department, category, tags, availability status (`Active`, `Inactive`, `Maintenance`), rating.
- **Interaction Document:** `user_id` (pseudonymous), `item_id`, `item_type`, rating (1.0 to 5.0), normalized rating ($0.0 \le y \le 1.0$), interaction type (`save`, `click`, `view`, `rating`), epoch timestamp.

### 3.2 Preprocessing Features (`preprocessing.py`)
1. **Pseudonymization:**
   $$\text{pseudo\_id} = \text{"usr\_pseudo\_"} + \text{SHA256}(\text{salt} \parallel \text{user\_id})[:16]$$
   Institutions can rotate or enclave the salt to ensure forward secrecy.
2. **Text Sanitation & Token Normalization:** Strips regex non-alphanumeric noise, splits comma-separated lists, and lowers case tokens.
3. **Categorical Vocabulary (`CategoricalVocabulary`):** Maps variable string IDs into dense sequential integer tensors $[0, N]$. Index `0` is strictly reserved for `<UNK>` (Unknown / Novel cold-start entities), preventing out-of-bounds indexing during inference.
4. **Numerical Normalization:**
   - Ratings normalized: $y_{norm} = \frac{\text{rating} - 1.0}{4.0} \in [0.0, 1.0]$.
   - Popularity normalized: $p_{norm} = \min(1.0, \frac{\text{saves\_count}}{100.0})$.

---

## 4. TensorFlow 2.x NeuMF Model Architecture

The collaborative filtering model is designed as a **Neural Matrix Factorization (NeuMF)** network combining **Generalized Matrix Factorization (GMF)** and deep **Multi-Layer Perceptrons (MLP)** (He et al., WWW 2017).

```
                      User ID Index (1,)                  Item ID Index (1,)
                              |                                   |
                +-------------+-------------+       +-------------+-------------+
                |                           |       |                           |
                v                           v       v                           v
        [GMF User Embed]            [MLP User Embed]  [GMF Item Embed]   [MLP Item Embed]
           (16-dim)                    (32-dim)          (16-dim)           (32-dim)
                |                           |                 |                 |
                +-----------------+         |                 |                 |
                                  |         |   +-------------+                 |
                                  v         v   v                               v
                             [Element-wise Product]               [Vector Concatenation]
                                   (16-dim)                              (64-dim)
                                       |                                    |
                                       |                           [Dense 64 + ReLU + Dropout + BN]
                                       |                                    |
                                       |                           [Dense 32 + ReLU + Dropout + BN]
                                       |                                    |
                                       |                           [Dense 16 + ReLU + BN]
                                       |                                    |
                                       +------------------+-----------------+
                                                          |
                                                          v
                                                 [NeuMF Fusion Vector]
                                                        (32-dim)
                                                          |
                                                          v
                                              [Dense 1 (Sigmoid Activation)]
                                                          |
                                                          v
                                             Predicted Affinity Score [0.0, 1.0]
```

### Model Specifications
- **Input Tensors:** `user_id_input` $\in \mathbb{Z}^{B \times 1}$, `item_id_input` $\in \mathbb{Z}^{B \times 1}$.
- **GMF Embedding Dimension:** $16$
- **MLP Embedding Dimension:** $32$
- **Feed-Forward Layers:** Dense(64, ReLU) $\to$ Dropout(0.2) $\to$ BatchNorm $\to$ Dense(32, ReLU) $\to$ Dropout(0.2) $\to$ BatchNorm $\to$ Dense(16, ReLU) $\to$ BatchNorm.
- **Fusion Layer:** Concatenates GMF latent dot-product (16-dim) with MLP output (16-dim) into a 32-dim fusion vector.
- **Output:** Sigmoid activation mapping predicted preference to continuous interval $[0.0, 1.0]$.
- **Loss Function:** Mean Squared Error ($\text{MSE}$) with Adam Optimizer ($\text{lr}=0.001$).
- **Early Stopping:** Monitored on holdout validation loss with patience $= 5$.

---

## 5. Hybrid Recommendation & Dynamic Ranking (`hybrid_ranker.py`)

### 5.1 Hybrid Scoring Formula
$$S_{\text{final}} = \alpha \cdot S_{\text{content}} + (1 - \alpha) \cdot S_{\text{collab}}$$

Where:
- $S_{\text{content}} = 0.70 \cdot \text{CosineSim}(\vec{u}_{\text{tfidf}}, \vec{i}_{\text{tfidf}}) + 0.20 \cdot \text{Rating}_{\text{norm}} + 0.10 \cdot \text{Popularity}_{\text{norm}}$
- $S_{\text{collab}} = \text{NeuMF}(\text{User}_{\text{pseudo}}, \text{Item}_{\text{id}})$

### 5.2 Dynamic Cold-Start Resolution
1. **New User (Zero Interactions):** The collaborative encoder detects that $\text{User}_{\text{id}} \notin \text{Vocabulary} \implies \text{Index} = 0\ (\text{<UNK>})$. The ranker dynamically sets $\alpha = 1.0$ (100% content-based), leveraging the student's department and onboarding interests.
2. **New Catalog Entity (Resource, Event, or Service):** Item index defaults to $0$. The collaborative score seamlessly defaults to content relevance $S_{\text{content}}$, completely preventing cold-start crashes or null scores.
3. **Baseline Mode Safeguard:** When the student dashboard or legacy test harnesses request baseline heuristic mode (`engine=baseline`), the system prepends `[Baseline Heuristic]` to all explanations, maintaining 100% backward compatibility.

### 5.3 Availability & Temporal Freshness Filtering
- **Temporal Event Guard:** Events with dates before today ($date < \text{today}$) are automatically dropped before scoring.
- **Service Status Guard:** Decommissioned or inactive services ($is\_active == False$ or status == "Inactive") are pruned from candidate pools.
- **Resource Moderation Guard:** Unapproved or rejected resources ($status \in [rejected, suspended]$) are never recommended.

### 5.4 Privacy-Preserving Explanations
Recommendations carry user-understandable, non-identifying rationales:
- `"[Hybrid NeuMF] Department affinity (Computer Science) | Matches interests: Machine Learning & peer interaction pattern"`
- `"[Content Engine] Curated for Student curriculum | Highly rated by university peers"`
- `"[Baseline Heuristic] Department affinity (Computer Science) & Highly rated by peers (4.9/5.0)"`

---

## 6. Real Offline Model Evaluation Results

The evaluation pipeline (`evaluator.py`) executes an uncompromised holdout evaluation across test cohort users ($N=42$) evaluated against genuine catalog candidates ($M=27$) and interaction matrices ($K=364$).

### Measured Metrics Report
| Metric | Value | Interpretation |
| :--- | :---: | :--- |
| **Hit Rate@5** | **80.95%** | Over 80% of test cohort students have at least one relevant target in their top 5 recommendations. |
| **Hit Rate@10** | **90.48%** | Over 90% of test students have a relevant target in their top 10 recommendations. |
| **Recall@5** | **58.10%** | Captures 58.1% of all ground-truth interactions within the top 5 slots. |
| **Recall@10** | **77.62%** | Captures 77.6% of all ground-truth interactions within the top 10 slots. |
| **NDCG@5** | **0.4538** | Measures high-ranked quality of positive items with logarithmic position discounting. |
| **NDCG@10** | **0.5275** | High cumulative information gain across the full 10-item slate. |
| **Precision@5** | **19.52%** | Fraction of top-5 slots containing ground-truth holdouts. |
| **Precision@10** | **13.10%** | Expected distribution over a compact catalog. |
| **Training Loss (MSE)** | **0.0673** | Low prediction variance on normalized rating scale $[0, 1]$. |
| **Training MAE** | **0.2173** | Average prediction error $\approx 0.86$ stars on a 5-star scale. |
| **Validation Loss** | **0.0779** | Strong generalization with zero overfitting. |

*Artifact Location:* `backend/app/recommendation_engine/artifacts/v1/evaluation_report.json`

---

## 7. Model Persistence & Artifacts

All model checkpoints, Keras weights, categorical vocabularies, and evaluation summaries are serialized under `backend/app/recommendation_engine/artifacts/v1/`:
1. `neumf_weights.weights.h5` (213 KB): Pre-trained NeuMF layer weights and biases.
2. `metadata.json` (3.5 KB): Serialized categorical vocabularies (`user2idx`, `item2idx`), latent dimensions, hyperparameters, and training history.
3. `evaluation_report.json` (669 B): Versioned measured evaluation metrics for instant retrieval by APIs.

---

## 8. Flask API Endpoints

The Flask recommendation endpoints are registered under both `/api/v1/recommendations` and `/api/recommendations`:

| HTTP Method | Route | Access | Query / Body Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/recommendations` | JWT Required | `?engine=hybrid&type=resource&limit=10` | Computes personalized hybrid NeuMF recommendations. |
| `GET` | `/api/v1/recommendations/student` | JWT Required | `?engine=baseline` (default) | Legacy student dashboard endpoint (preserves baseline heuristics). |
| `GET` | `/api/v1/recommendations/evaluation` | JWT Required | None | Returns measured offline IR metrics (Precision, Recall, NDCG, HitRate). |
| `POST` | `/api/v1/recommendations/train` | Admin Only | `{"epochs": 10, "batch_size": 32}` | Triggers NeuMF retraining, artifact checkpointing, and evaluation. |
| `GET` | `/api/v1/recommendations/<id>` | JWT Required | `?engine=hybrid` | Retrieves detailed item scoring dossier and explanation. |
| `POST` | `/api/v1/recommendations/feedback` | JWT Required | `{"item_id": "...", "feedback": "useful"}` | Submits feedback (`useful`, `not_relevant`, `saved`) for model tuning. |
| `GET` | `/api/v1/recommendations/history` | JWT Required | None | Retrieves user interaction history. |

---

## 9. Verification & Test Suite Summary

### 9.1 Backend Pytest Suite
Run command:
```powershell
$env:PYTHONPATH="backend"
.\backend\venv\Scripts\pytest -o pythonpath=backend backend/tests -v
```
**Results:** `43 passed, 26 warnings in 21.99s` (100% Pass Rate).
- `test_admin_api.py` (7 tests passed)
- `test_auth.py` (13 tests passed)
- `test_backend_core.py` (7 tests passed)
- `test_recommendation_engine.py` (7 tests passed)
- `test_student_dashboard_api.py` (9 tests passed)

### 9.2 Frontend Production Build
Run command:
```powershell
cd frontend
pnpm run build
```
**Results:** `✓ 2580 modules transformed. built in 19.00s` (0 Errors).

---

## 10. Operator & Developer Instructions

### 10.1 Running the Recommendation Engine Tests
```powershell
# Inside project root
$env:PYTHONPATH="backend"
.\backend\venv\Scripts\pytest backend/tests/test_recommendation_engine.py -v
```

### 10.2 Retraining the NeuMF Model via Python
```python
import os
os.environ['PYTHONPATH'] = 'backend'

from app.recommendation_engine.model_manager import RecommendationModelManager

manager = RecommendationModelManager.get_instance()
report = manager.train_and_evaluate(epochs=10, batch_size=32)
print("Updated Hit Rate@10:", report['evaluation_metrics']['hit_rate@10'])
```

### 10.3 Querying Recommendations via cURL / HTTP
```bash
# Fetch hybrid recommendations
curl -X GET "http://127.0.0.1:5000/api/v1/recommendations?engine=hybrid&limit=5" \
     -H "Authorization: Bearer <STUDENT_JWT_TOKEN>"

# Fetch offline evaluation report
curl -X GET "http://127.0.0.1:5000/api/v1/recommendations/evaluation" \
     -H "Authorization: Bearer <STUDENT_JWT_TOKEN>"

# Retrain model (Admin role required)
curl -X POST "http://127.0.0.1:5000/api/v1/recommendations/train" \
     -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"epochs": 15, "batch_size": 32}'
```
