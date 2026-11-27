# Visual Design System Specification: SHTKS Sovereign

**Platform:** Secure Resource Recommendation System for University Communities  
**Team Name:** SHTKS (26O2227)  
**Phase:** 2 — Visual Identity, Design Tokens & Component Foundation  
**Status:** Implemented & Verified in TypeScript & Tailwind CSS  

---

## 1. Design Philosophy: "Sovereign Academic"

The platform represents the intersection of three sensitive institutional domains: **Private Personal Data**, **Secure Cryptographic Computation**, and **Intelligent Resource Matching**. 

Traditional university software often suffers from institutional drabness, cluttered portals, or generic student assignment templates. Conversely, commercial consumer apps overuse gratuitous neon glows, aggressive glassmorphism, and noisy AI aesthetics.

**The SHTKS Sovereign design philosophy balances:**
1. **Calm Authority:** Deep obsidian surfaces with subtle navy tinting (`#0B0F17`) provide a focused, low-fatigue environment for academic exploration.
2. **Cryptographic Transparency:** Security is treated as an active architectural element. Cryptographic verification states (CKKS-128b, 2PC Oblivious Argmax, FERPA protection) are rendered with purposeful emerald (`#10B981`) and cyan (`#06B6D4`) indicator seals.
3. **Restrained Elegance:** 1px architectural borders (`rgba(255, 255, 255, 0.08)`), micro-radii (4px–8px), and purposeful typography eliminate visual clutter.
4. **Zero AI Cliché:** No arbitrary purple-to-cyan gradient text, no floating 3D spheres without semantic purpose, and no card-in-card visual debt.

```
       [ STUDENT PREFERENCES ]
        (Encrypted On-Device)
                  │
                  ▼
    ┌───────────────────────────┐
    │  SOVEREIGN PRIVACY SHIELD  │ ◄── TenSEAL CKKS (N=8192, Δ=2^40)
    │   Zero-Knowledge Pipeline │ ◄── 2PC Oblivious Top-K Selection
    └─────────────┬─────────────┘
                  │
                  ▼
    [ INTELLIGENT DISCOVERY FEED ]
    (Academic · Events · Services)
```

---

## 2. Final Colour Palette & Token Hierarchy

The design system uses CSS custom properties and Tailwind utility classes with calibrated OKLCH perception curves and hex fallbacks.

### 2.1 Void Background & Elevation Tokens
| Token | Hex Value | RGB Triplet | Semantic Usage |
| :--- | :--- | :--- | :--- |
| `void-950` | `#07090E` | `7, 9, 14` | Deepest canvas layer, modal backdrop |
| `void-base` | `#0B0F17` | `11, 15, 23` | Default application body canvas |
| `void-surface`| `#111726` | `17, 23, 38` | Standard card surface, list containers |
| `void-elevated`| `#161E31` | `22, 30, 49` | Form inputs, dropdown menus, button surfaces |
| `void-overlay`| `#1C263D` | `28, 38, 61` | Modals, floating popovers, tooltips |

### 2.2 Brand & Privacy Accent Tokens
| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `brand-500` | `#6366F1` | Primary interactive accent (Sovereign Indigo) |
| `brand-600` | `#4F46E5` | Active / Hover primary button fill |
| `brand-glow`| `rgba(99, 102, 241, 0.25)` | Micro-glow on primary button and focused inputs |
| `shield-500`| `#06B6D4` | Security & Privacy Shield primary accent |
| `shield-600`| `#0891B2` | Shield active states, confidentiality badges |
| `shield-glow`| `rgba(6, 182, 212, 0.20)` | Micro-glow on active cryptographic badges |

### 2.3 Functional Status Tokens
| Token | Hex Value | RGB Triplet | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| `status-verified` | `#10B981` | `16, 185, 129` | Zero-Knowledge Proof Valid, CKKS Verified |
| `status-confidential`| `#8B5CF6` | `139, 92, 246` | FERPA Protected / Sensitive Student Service |
| `status-pending` | `#F59E0B` | `245, 158, 11` | Consent Required / Inference Worker Queued |
| `status-danger` | `#EF4444` | `239, 68, 68` | Cryptographic Key Expired / Data Purge |

### 2.4 Neutral Slate Scale
- `slate-50` (`#F8FAFC`): Primary high-contrast text and active headings.
- `slate-200` (`#E2E8F0`): Body text, high legibility.
- `slate-400` (`#94A3B8`): Secondary text, card descriptions, labels.
- `slate-500` (`#64748B`): Helper text, disabled states, subtle metadata.
- `border-default` (`rgba(255, 255, 255, 0.12)`): Primary architectural borders.
- `border-subtle` (`rgba(255, 255, 255, 0.07)`): Interior dividers and table rows.

---

## 3. Typography System

The typography pairs a geometric, authoritative display typeface with a neutral UI body font and a monospaced font for cryptographic parameters.

### 3.1 Typeface Selection
- **Display & Headings:** `Plus Jakarta Sans` (weights: 600, 700, 800)
- **Body & UI Elements:** `Inter` (weights: 400, 500, 600)
- **Code & Hashes:** `JetBrains Mono` (weights: 400, 500)

### 3.2 Modular Scale & Fluid Clamps
| Level | Font Family | Size (Fluid / Fixed) | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Plus Jakarta Sans | `clamp(2.5rem, 5vw, 4rem)` | 800 | 1.05 | `-0.03em` |
| **Heading 1**| Plus Jakarta Sans | `clamp(1.875rem, 3.5vw, 2.5rem)` | 700 | 1.15 | `-0.025em`|
| **Heading 2**| Plus Jakarta Sans | `clamp(1.5rem, 2.5vw, 2rem)` | 700 | 1.25 | `-0.02em` |
| **Heading 3**| Plus Jakarta Sans | `1.25rem` (20px) | 600 | 1.35 | `-0.015em`|
| **Body Large**| Inter | `1.125rem` (18px) | 400 | 1.6 | normal |
| **Body UI** | Inter | `0.9375rem` (15px) | 400 | 1.5 | normal |
| **Small UI** | Inter | `0.8125rem` (13px) | 500 | 1.4 | `+0.01em` |
| **Mono Token**| JetBrains Mono | `0.75rem` (12px) | 500 | 1.4 | `+0.02em` |

---

## 4. Spacing, Elevation & Layout Grid

### 4.1 Base Unit: 4px Grid
- `space-1`: 4px | `space-2`: 8px | `space-3`: 12px | `space-4`: 16px
- `space-5`: 20px | `space-6`: 24px | `space-8`: 32px | `space-12`: 48px

### 4.2 Border Radii (Architectural Restraint)
- `rounded-xs`: 4px (inputs, badges, code chips)
- `rounded-sm`: 6px (buttons, small items)
- `rounded-md`: 8px (standard cards, popovers, dropdowns)
- `rounded-lg`: 12px (modals, hero containers)
- `rounded-full`: 9999px (pill tags, status dots)

### 4.3 Shadow & Elevation Layers
- `shadow-subtle`: `0 1px 2px 0 rgba(0, 0, 0, 0.4)`
- `shadow-elevated`: `0 4px 14px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06)`
- `shadow-modal`: `0 16px 36px -6px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)`
- `shadow-brand-glow`: `0 0 25px -4px rgba(99, 102, 241, 0.3)`
- `shadow-shield-glow`: `0 0 25px -4px rgba(6, 182, 212, 0.25)`

---

## 5. Component Inventory & Specifications

The design system establishes 11 core UI components in `src/design-system/components/`:

1. **`Button`:**
   - *Variants:* `primary`, `secondary`, `shield`, `outline`, `ghost`, `danger`.
   - *Sizes:* `sm` (32px), `md` (40px), `lg` (48px).
   - *States:* Default, Hover, Active (`whileTap: 0.985`), Disabled, Loading (`Loader2` spinner).
2. **`Badge`:**
   - *Variants:* `verified` (Emerald), `shield` (Cyan), `confidential` (Purple), `pending` (Amber), `neutral` (Slate), `danger` (Red).
   - *Features:* Optional pinging live status dot (`hasDot`, `pulseDot`).
3. **`Card`:**
   - Composable primitives: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
   - *Interactive:* Smooth translateY hover lift (-2px) with border highlight.
4. **`Input`:**
   - Accessible label, prefix icon, suffix clear button, helper text, and error validation states.
5. **`StatusIndicator`:**
   - Real-time engine telemetry badges (`online`, `evaluating`, `warning`, `offline`) with animated ping dots.
6. **`CryptoShield`:**
   - Signature brand component showcasing active encryption level (CKKS-128b, 2PC Top-K) with technical parameter breakdowns ($N=8192, \Delta=2^{40}$).
7. **`Tabs`:**
   - Accessible keyboard-navigable tabs (`pills` or `underline` variants) with animated Framer Motion layout indicator.
8. **`Modal`:**
   - Accessible dialog with backdrop blur, focus trap, Escape key listener, and `modalVariants` spring animation.
9. **`Skeleton`:**
   - Non-jarring dark loading placeholder shimmer for cards and data tables.
10. **`EmptyState`:**
    - Guided educational fallback state with action button.
11. **`ResourceCard`:**
    - Domain card representing Academic Resources, Campus Events, and Confidential Services with match score badges and action triggers.

---

## 6. Motion Design Guidelines

- **Exponential Deceleration (`transitionExpo`):**
  - Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
  - Natural physics deceleration where objects snap into focus quickly and settle smoothly.
- **Micro-Interactions (`transitionSpring`):**
  - Stiffness: 400, Damping: 30 (zero tacky bounce, clean tactical feedback).
- **Staggered Container Entrance:**
  - Stagger delay: 0.06s between children to create rhythmic reveals.
- **Accessibility (`prefers-reduced-motion`):**
  - All transforms and animations collapse to duration `0.01ms` when reduced motion is detected.

---

## 7. Responsive Design Rules

- **Mobile (< 640px):** Single-column stacked cards, full-width inputs, hidden secondary badges, compact navigation.
- **Tablet (640px – 1024px):** 2-column resource grids, segmented controls, collapsible side panel.
- **Desktop (1024px – 1280px):** 3-column discovery feed, persistent system status telemetry in header.
- **Wide Screens (> 1280px):** Maximum container constraint (`max-w-7xl` = 1280px) centered with breathing room to preserve visual hierarchy.

---

## 8. Accessibility & Quality Standards

- **Color Contrast:** All body text (`#F8FAFC` and `#E2E8F0` on `#0B0F17` / `#111726`) meets or exceeds **WCAG 2.1 AAA** contrast ratios ($> 12:1$).
- **Focus Indicators:** Accessible, high-contrast 2px focus ring (`ring-brand-500` with 2px offset).
- **Reduced Motion:** Integrated into `src/index.css` media queries.
- **Semantic HTML:** `<header>`, `<main>`, `<button role="tab">`, `<dialog role="dialog">` used across all components.

