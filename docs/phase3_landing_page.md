# Phase 3 Implementation Report: Cinematic Landing Page

**Project:** Secure Resource Recommendation System for University Communities  
**Team Name:** SHTKS (26O2227)  
**Category:** Community SDG  
**Phase:** 3 — Cinematic Landing Page & Interactive Experience  
**Status:** Successfully Implemented, Built & Validated (Vite + TypeScript + Three.js)  

---

## 1. Executive Summary & Creative Direction

Phase 3 transitions the platform from a design system foundation into a fully interactive, production-minded **Cinematic Landing Page**. 

The design embodies **"Confidential Intelligence. Academic Discovery."** It communicates that privacy and hyper-personalized recommendations are synergistic rather than adversarial. Through custom Three.js spatial depth, smooth Framer Motion layout transitions, and interactive cryptographic simulators, the page establishes an unmistakable visual and technical standard.

```
+-----------------------------------------------------------------------------------------+
| [SHTKS SOVEREIGN]   How It Works   Features   Privacy & Security   Technology   [Sign In] [Get Started] |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  [COMMUNITY SDG · PRIVACY-PRESERVING AI]                     ┌───────────────────────┐  |
|  Confidential Intelligence.                                  │  Three.js 3D Core     │  |
|  Academic Discovery.                                         │  (Rotating Lattice,   │  |
|                                                              │   Polynomial Rings,   │  |
|  A real-time, privacy-preserving recommendation platform     │   Interactive Nodes)  │  |
|  for university communities...                               └───────────────────────┘  |
|  [Get Started]  [Explore How It Works]                                                  |
|                                                                                         |
|  128-bit CKKS Security  ·  Zero Cleartext Ingestion  ·  2-Party Oblivious Argmax       |
+-----------------------------------------------------------------------------------------+
|  01 USER PREFERENCES ────> 02 PRIVACY-PRESERVING COMP ────> 03 INTELLIGENT FEED         |
|  [Inspect Vector u]        [Inspect TenSEAL Ciphertext]     [Inspect 2PC Secret Shares] |
+-----------------------------------------------------------------------------------------+
|  ASYMMETRIC BENTO GRID: Academic Discovery · FERPA Support · Key Autonomy · RBAC       |
+-----------------------------------------------------------------------------------------+
|  INTERACTIVE THREAT MODEL: Standard Centralized Logging vs SHTKS Sovereign Zero-Leakage |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Components Created & Responsibilities

All components were authored in `frontend/src/components/landing/` using the Phase 2 design system tokens:

1. **`HeroCoreCanvas.tsx`:**
   - Bespoke Three.js WebGL canvas rendering an inner glowing sphere, an outer wireframe icosahedron, dual orbital rings (representing polynomial quotient rings $R_q = \mathbb{Z}_q[X]/(X^N+1)$), and a 220-particle floating cloud.
   - Real-time mouse parallax: camera and core coordinates smoothly lerp toward cursor movement.
   - Resource-efficient: pauses render loop when offscreen via `IntersectionObserver`; auto-downscales particle count when `prefers-reduced-motion` is active.
   - Graceful fallback: renders an SVG security ring if WebGL context creation fails.

2. **`Navbar.tsx`:**
   - Fixed header with dynamic blur detection (transitions from transparent to `bg-void/90` with border on scroll).
   - Smooth anchor navigation linking to `#hero`, `#how-it-works`, `#features`, `#privacy`, `#technology`, and `#mission`.
   - Real-time telemetry badge (`CKKS-128b: Zero Cleartext`).
   - Mobile responsive drawer with animated hamburger toggle.

3. **`HeroSection.tsx`:**
   - High-impact editorial composition pairing the main headline with the 3D cryptographic core.
   - Call-to-action button triggers and an institutional trust metric strip (128-bit Security, Zero Cleartext, 2-Party MPC, FERPA-Aligned).

4. **`HowItWorksSection.tsx`:**
   - 3-stage interactive pipeline:
     - `01 — User Preferences`: Local on-device vectorization ($u \in \mathbb{R}^{64}$).
     - `02 — Privacy-Preserving Computation`: TenSEAL CKKS homomorphic inner product evaluation.
     - `03 — Intelligent Recommendations`: 2-Party oblivious Top-$K$ selection.
   - Interactive code console: Clicking any stage displays the exact data transformation happening at that step.

5. **`FeaturesSection.tsx`:**
   - Asymmetric Bento Grid avoiding repetitive card layouts:
     - Large 8-column card: Curriculum-Aligned Academic Discovery (Two-Tower TensorFlow).
     - 4-column card: Confidential Support Services (Mental health, emergency aid).
     - 4-column card: Campus Events & Symposia with blind RSVP.
     - 4-column card: User-Controlled Cryptographic Autonomy (instant key rotation & right to be forgotten).
     - 4-column card: Four-Tier Stakeholder RBAC Governance.

6. **`PrivacySection.tsx`:**
   - Interactive Threat Simulator: Interactive toggle comparing "Standard Platform" (leaks plaintext mental health and search queries to DB admins) vs "SHTKS Sovereign" (only encrypted ciphertext payloads reach the server).
   - Clear and honest threat model callouts: Semi-Honest Server model, Non-Collusion requirement, and timing metadata limitations.

7. **`TechStackSection.tsx`:**
   - Clean presentation of the approved stack: Python/Flask, TensorFlow 2.x, MongoDB 7.x CSFLE, TenSEAL, React + TypeScript.

8. **`MissionSection.tsx`:**
   - University Community SDG focus: Addressing the "chilling effect" in higher education to support SDG 4 (Quality Education) and SDG 16 (Strong Institutions).

9. **`CtaSection.tsx` & `Footer.tsx`:**
   - Closing onboarding trigger and structural footer with project metadata, team attribution (Team SHTKS 26O2227), and research specifications.

10. **`AuthModal.tsx`:**
    - Interactive dialog for Login & Registration supporting role selection (`Student`, `Faculty`, `Staff`, `Admin`), university email validation (`@*.edu`), and simulated client-side CKKS keypair generation.

11. **`LandingPage.tsx`:**
    - Root master container uniting all landing sections. Includes a floating toggle for mentors and reviewers to jump between the live landing page and the Phase 2 Design System Showcase.

---

## 3. Libraries Introduced & Justification

| Library | Version | Purpose & Architectural Justification |
| :--- | :--- | :--- |
| `three` | `^0.187.0` | Lightweight, native WebGL engine for the 3D cryptographic core canvas. Zero heavy wrappers, minimal footprint. |
| `@types/three` | `^0.187.0` | Strict TypeScript definitions for Three.js geometries, materials, and scene objects. |
| `framer-motion` | `^14.14.0` | Fluid layout animations, terminal step transitions, and modal spring reveals. |
| `lucide-react` | `^1.73.0` | Modern iconography for cryptographic, academic, and security indicators. |

---

## 4. Verification & Build Results

The landing page was compiled using Vite and TypeScript:
```bash
$ tsc -b && vite build
vite v8.3.8 building client environment for production...
transforming...
✓ 2545 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     1.13 kB │ gzip:   0.62 kB
dist/assets/index-AT5yk7Wz.css     34.17 kB │ gzip:   6.82 kB
dist/assets/index-CvD18cgG.js   1,024.29 kB │ gzip: 283.83 kB
✓ built in 12.93s
```
- **TypeScript Errors:** 0
- **Lint Errors:** 0
- **Missing Assets:** 0 (all geometries, shaders, and icons are vector-computed or procedural Three.js meshes).

---

## 5. Distinction: Implemented vs. Placeholders

| Feature | Implementation Status | Technical Reality |
| :--- | :--- | :--- |
| **Interactive 3D Core Canvas** | **Fully Implemented** | WebGL canvas with mouse parallax, 220 particles, and visibility observer |
| **Smooth Navigation & Scroll-to** | **Fully Implemented** | Native smooth scrolling to all sections + mobile drawer |
| **Pipeline Step Inspector** | **Fully Implemented** | Live state switching across stages 01, 02, and 03 with code console |
| **Threat Model Comparison** | **Fully Implemented** | Interactive toggle showing Central IT cleartext vs ciphertext view |
| **Auth & Onboarding Modal** | **UI Functional (Mock)** | Modal opens, switches roles, and validates inputs; links to Flask backend in Phase 4 |
| **Flask API Token Issuance** | *Planned (Phase 4)* | Backend auth endpoints will be linked in the next phase |
| **Live TenSEAL WASM Crypto** | *Planned (Phase 8)* | WebAssembly compilation of TenSEAL bindings will link in Phase 8 |

