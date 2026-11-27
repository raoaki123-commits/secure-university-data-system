import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Type,
  Component,
  Lock,
  Search,
  Key,
  Sparkles,
  Activity,
  UserCheck,
  GraduationCap,
  Briefcase,
  Sliders,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Input,
  StatusIndicator,
  CryptoShield,
  Tabs,
  Modal,
  Skeleton,
  EmptyState,
  ResourceCard,
} from './index';

export const DesignSystemShowcase: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'tokens' | 'typography' | 'buttons' | 'inputs' | 'cards' | 'system'>('tokens');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [activeTab, setActiveTab] = useState('academic');

  return (
    <div className="min-h-screen bg-void bg-grid-subtle text-slate-100 flex flex-col">
      {/* Top Architectural Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border-default bg-void/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand-500/10 text-brand-400 border border-brand-500/30">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-tight text-slate-100">
                  SHTKS SOVEREIGN
                </span>
                <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-mono text-brand-300 border border-brand-500/30">
                  PHASE 2 DESIGN SYSTEM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Secure Resource Recommendation System (26O2227)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusIndicator
              status="online"
              label="CKKS-128b"
              subtext="N=8192, Δ=2^40"
              className="hidden md:inline-flex"
            />
            <StatusIndicator
              status="evaluating"
              label="2PC Trustee"
              subtext="Node 2 Ready"
              className="hidden lg:inline-flex"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Key className="h-3.5 w-3.5" />}
            >
              Verify Tokens
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner with Cryptographic Proof */}
        <CryptoShield showParameters={true} />

        {/* Section Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-100">
              Visual Design System & Token Foundation
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Production design language for university stakeholders (Student, Faculty, Staff, Admin)
            </p>
          </div>

          <Tabs
            variant="pills"
            tabs={[
              { id: 'tokens', label: 'Color Tokens', icon: <Layers className="h-3.5 w-3.5" /> },
              { id: 'typography', label: 'Typography', icon: <Type className="h-3.5 w-3.5" /> },
              { id: 'buttons', label: 'Buttons & Badges', icon: <Component className="h-3.5 w-3.5" /> },
              { id: 'inputs', label: 'Inputs & Form', icon: <Sliders className="h-3.5 w-3.5" /> },
              { id: 'cards', label: 'Domain Cards', icon: <Sparkles className="h-3.5 w-3.5" /> },
              { id: 'system', label: 'System & States', icon: <Activity className="h-3.5 w-3.5" /> },
            ]}
            activeTab={activeSection}
            onChange={(id) => setActiveSection(id as any)}
          />
        </div>

        {/* SECTION 1: COLOR TOKENS */}
        {activeSection === 'tokens' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-slate-200">
                1. Semantic Color Tokens & Surfaces
              </h2>
              <span className="font-mono text-xs text-slate-500">
                Calm Obsidian + Sovereign Indigo + Shield Cyan
              </span>
            </div>

            {/* Void Surfaces Grid */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400 mb-3">
                Void Backgrounds & Elevation Surfaces
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <ColorSwatch name="Void Base" hex="#0B0F17" role="Application Canvas Base" bgClass="bg-void" />
                <ColorSwatch name="Void Surface" hex="#111726" role="Default Card Surface" bgClass="bg-void-surface" />
                <ColorSwatch name="Void Elevated" hex="#161E31" role="Inputs & Dropdowns" bgClass="bg-void-elevated" />
                <ColorSwatch name="Void Overlay" hex="#1C263D" role="Modal & Popover Surface" bgClass="bg-void-overlay" />
                <ColorSwatch name="Void 950" hex="#07090E" role="Deepest Backdrop" bgClass="bg-void-950" />
              </div>
            </div>

            {/* Brand Accents Grid */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400 mb-3">
                Brand & Security Accents
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ColorSwatch
                  name="Sovereign Indigo"
                  hex="#6366F1"
                  role="Primary Interactive Accent"
                  bgClass="bg-brand-500 text-slate-900"
                />
                <ColorSwatch
                  name="Deep Indigo"
                  hex="#4F46E5"
                  role="Hover & Active States"
                  bgClass="bg-brand-600 text-slate-100"
                />
                <ColorSwatch
                  name="Shield Cyan"
                  hex="#06B6D4"
                  role="Privacy & Security Signals"
                  bgClass="bg-shield-500 text-slate-900"
                />
                <ColorSwatch
                  name="Deep Cyan"
                  hex="#0891B2"
                  role="Shield Active States"
                  bgClass="bg-shield-600 text-slate-100"
                />
              </div>
            </div>

            {/* Functional Status Grid */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400 mb-3">
                Functional Status Tokens
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ColorSwatch
                  name="Verified Emerald"
                  hex="#10B981"
                  role="Zero-Knowledge / CKKS Valid"
                  bgClass="bg-status-verified text-slate-900"
                />
                <ColorSwatch
                  name="Confidential Purple"
                  hex="#8B5CF6"
                  role="FERPA / Sensitive Services"
                  bgClass="bg-status-confidential text-slate-100"
                />
                <ColorSwatch
                  name="Pending Amber"
                  hex="#F59E0B"
                  role="Consent Required / Worker Queued"
                  bgClass="bg-status-pending text-slate-900"
                />
                <ColorSwatch
                  name="Destructive Red"
                  hex="#EF4444"
                  role="Revoke / Data Purge"
                  bgClass="bg-status-danger text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: TYPOGRAPHY HIERARCHY */}
        {activeSection === 'typography' && (
          <div className="space-y-6">
            <h2 className="font-display text-lg font-semibold text-slate-200">
              2. Typographic Scale & Font Pairings
            </h2>

            <Card className="divide-y divide-border-subtle">
              <div className="p-6">
                <span className="font-mono text-xs text-brand-400 block mb-1">
                  Display Heading · Plus Jakarta Sans 800 · clamp(2.5rem, 5vw, 4rem)
                </span>
                <p className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
                  Privacy-Preserving Intelligence
                </p>
              </div>

              <div className="p-6">
                <span className="font-mono text-xs text-brand-400 block mb-1">
                  Page Heading 1 · Plus Jakarta Sans 700 · 2rem
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
                  Recommended Academic & Support Services
                </h1>
              </div>

              <div className="p-6">
                <span className="font-mono text-xs text-brand-400 block mb-1">
                  Section Heading 2 · Plus Jakarta Sans 600 · 1.5rem
                </span>
                <h2 className="font-display text-xl font-semibold tracking-tight text-slate-200">
                  Zero-Knowledge Student Discovery Feed
                </h2>
              </div>

              <div className="p-6">
                <span className="font-mono text-xs text-brand-400 block mb-1">
                  Body UI · Inter Regular · 0.9375rem (15px)
                </span>
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  User preferences are vectorized locally on-device and homomorphically scored
                  against university resource embeddings using the CKKS cryptosystem. Raw profiles,
                  search queries, and sensitive needs never leave the student device in cleartext.
                </p>
              </div>

              <div className="p-6">
                <span className="font-mono text-xs text-brand-400 block mb-1">
                  Technical Monospace · JetBrains Mono · 0.8125rem (13px)
                </span>
                <p className="font-mono text-xs text-shield-300 bg-void-elevated p-3 rounded-sm border border-border-default inline-block">
                  CKKS::Context(N=8192, scale=2^40, modulus=[60, 40, 40, 60], sec_level=128)
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* SECTION 3: BUTTONS & BADGES */}
        {activeSection === 'buttons' && (
          <div className="space-y-8">
            <h2 className="font-display text-lg font-semibold text-slate-200">
              3. Interactive Buttons, Sizes & States
            </h2>

            {/* Buttons Matrix */}
            <Card className="p-6 space-y-6">
              <div>
                <span className="font-mono text-xs text-slate-400 block mb-3">Button Variants</span>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary Sovereign</Button>
                  <Button variant="secondary">Secondary Elevated</Button>
                  <Button variant="shield" leftIcon={<Shield className="h-4 w-4" />}>
                    Shield Security
                  </Button>
                  <Button variant="outline">Outline Border</Button>
                  <Button variant="ghost">Ghost Neutral</Button>
                  <Button variant="danger">Destructive Action</Button>
                </div>
              </div>

              <div>
                <span className="font-mono text-xs text-slate-400 block mb-3">Button Sizes</span>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small (32px)</Button>
                  <Button size="md">Medium (40px)</Button>
                  <Button size="lg">Large (48px)</Button>
                  <Button size="md" isLoading>
                    Computing Dot Product
                  </Button>
                </div>
              </div>
            </Card>

            {/* Badges Matrix */}
            <div>
              <h3 className="font-display text-base font-semibold text-slate-200 mb-3">
                Badges & Cryptographic Status Tags
              </h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="verified" hasDot pulseDot>
                  CKKS-128b VERIFIED
                </Badge>
                <Badge variant="shield" hasDot>
                  2PC OBLIVIOUS
                </Badge>
                <Badge variant="confidential" hasDot pulseDot>
                  FERPA CONFIDENTIAL
                </Badge>
                <Badge variant="pending" hasDot>
                  CONSENT PENDING
                </Badge>
                <Badge variant="neutral">ACADEMIC RESOURCE</Badge>
                <Badge variant="danger" hasDot>
                  KEY EXPIRED
                </Badge>
              </div>
            </div>

            {/* Role Badges */}
            <div>
              <h3 className="font-display text-base font-semibold text-slate-200 mb-3">
                University Role Badges
              </h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="neutral" className="bg-brand-500/10 text-brand-300 border-brand-500/30">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  STUDENT
                </Badge>
                <Badge variant="neutral" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                  <Briefcase className="h-3 w-3 mr-1" />
                  FACULTY
                </Badge>
                <Badge variant="neutral" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                  <UserCheck className="h-3 w-3 mr-1" />
                  UNIVERSITY STAFF
                </Badge>
                <Badge variant="neutral" className="bg-amber-500/10 text-amber-300 border-amber-500/30">
                  <Shield className="h-3 w-3 mr-1" />
                  ADMINISTRATOR
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: FORM INPUTS & SEARCH */}
        {activeSection === 'inputs' && (
          <div className="space-y-6">
            <h2 className="font-display text-lg font-semibold text-slate-200">
              4. Inputs, Search & Validation States
            </h2>

            <Card className="p-6 max-w-2xl space-y-5">
              <Input
                label="UNIVERSITY EMAIL"
                placeholder="student@university.edu"
                helperText="Must belong to an accredited institutional domain (@*.edu / @*.ac.*)"
              />

              <Input
                label="RESOURCE SEARCH FILTER"
                leftIcon={<Search className="h-4 w-4" />}
                placeholder="Search academic tutoring, events, confidential services..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />

              <Input
                label="CRYPTOGRAPHIC PUBLIC KEY HASH"
                leftIcon={<Key className="h-4 w-4" />}
                placeholder="0x7f8a9b2c3d4e5f..."
                defaultValue="ckks_pk_8192_sec128_64d_live"
                readOnly
                helperText="Generated locally on-device via WebAssembly TenSEAL"
              />

              <Input
                label="CONSENT VALIDATION TEST"
                placeholder="Type 'INVALID' to test error styling..."
                value={inputError}
                onChange={(e) => {
                  setInputError(e.target.value);
                }}
                error={inputError === 'INVALID' ? 'Institutional consent revoked: Vector inference aborted' : undefined}
                helperText="Interactive test: type INVALID to trigger the error token"
              />
            </Card>
          </div>
        )}

        {/* SECTION 5: DOMAIN CARDS */}
        {activeSection === 'cards' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-200">
                  5. Domain Resource Cards (Previewing 3 University Categories)
                </h2>
                <p className="text-xs text-slate-400">
                  Structured cards representing Academic Resources, Campus Events, and Confidential Services
                </p>
              </div>

              <Tabs
                tabs={[
                  { id: 'academic', label: 'Academic' },
                  { id: 'event', label: 'Events' },
                  { id: 'service', label: 'Services' },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <ResourceCard
                id="res-1"
                type="academic"
                title="Quantum Algorithms & Cryptography Seminar"
                description="Graduate-level research seminar covering post-quantum lattice cryptography, homomorphic evaluation, and secure multi-party protocols."
                category="Computer Science & Math"
                provider="CS Dept · Prof. Thorne"
                meta="Hall B & Virtual"
                matchScore={0.96}
                onSelect={(id) => alert(`Selected resource: ${id}`)}
              />

              <ResourceCard
                id="res-2"
                type="event"
                title="Annual Community SDG Innovation Hackathon"
                description="48-hour collaborative development sprint addressing UN Sustainable Development Goals: Quality Education, Strong Institutions, and Privacy."
                category="Campus Life & Innovation"
                provider="Student Union · Innovation Hub"
                meta="Nov 20 · 2:00 PM"
                matchScore={0.88}
                onSelect={(id) => alert(`Selected event: ${id}`)}
              />

              <ResourceCard
                id="res-3"
                type="service"
                title="Confidential Psychological Counseling & Well-being"
                description="100% private, FERPA-protected mental health advisory, exam anxiety recovery, and confidential hardship counseling."
                category="Health & Well-being"
                provider="Dean of Students Wellness"
                meta="Confidential Suite 402"
                isSensitive={true}
                matchScore={0.92}
                onSelect={(id) => alert(`Selected confidential service: ${id}`)}
              />
            </div>
          </div>
        )}

        {/* SECTION 6: SYSTEM & FEEDBACK STATES */}
        {activeSection === 'system' && (
          <div className="space-y-6">
            <h2 className="font-display text-lg font-semibold text-slate-200">
              6. System States, Loaders & Empty Fallbacks
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skeleton Loading State Card */}
              <Card className="p-6 space-y-4">
                <span className="font-mono text-xs text-slate-400 block mb-1">
                  Loading Skeleton Shimmer (Non-jarring, dark-adapted)
                </span>
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" className="h-10 w-10" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </Card>

              {/* Purposeful Empty State */}
              <EmptyState
                icon={<Lock className="h-6 w-6 text-shield-400" />}
                title="No Recommendations Computed Yet"
                description="Your preferences have not been encrypted. Configure your interest sliders in the Privacy Center to generate your zero-knowledge feed."
                actionLabel="Configure Privacy Preferences"
                onAction={() => setIsModalOpen(true)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Interactive Verification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cryptographic Token & State Verification"
        description="Phase 2 Design System verification inspector for Team SHTKS (26O2227)"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-void-elevated rounded-sm border border-border-default space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">STATUS:</span>
              <span className="text-status-verified font-semibold">ALL DESIGN TOKENS LOADED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">FRAMEWORK:</span>
              <span className="text-slate-200">React 19 + TypeScript + Tailwind 3.4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MOTION ENGINE:</span>
              <span className="text-slate-200">Framer Motion (expo-out easing)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">TYPOGRAPHY:</span>
              <span className="text-slate-200">Plus Jakarta Sans / Inter / JetBrains Mono</span>
            </div>
          </div>

          <p className="text-slate-400 leading-relaxed">
            This modal confirms accessible focus trapping, backdrop blur, keyboard escape detection,
            and design token cohesion across all components.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Close Inspector
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                alert('Design tokens verified successfully!');
                setIsModalOpen(false);
              }}
            >
              Confirm Design System
            </Button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="mt-auto border-t border-border-subtle bg-void-950 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SHTKS (26O2227) · Community SDG · Phase 2 Design System</span>
          <span className="text-slate-600">Confidentiality & Integrity by Architecture</span>
        </div>
      </footer>
    </div>
  );
};

const ColorSwatch: React.FC<{ name: string; hex: string; role: string; bgClass: string }> = ({
  name,
  hex,
  role,
  bgClass,
}) => (
  <div className="rounded-sm border border-border-default bg-void-surface p-3 flex flex-col justify-between h-24">
    <div className="flex items-center justify-between">
      <span className="font-display text-xs font-semibold text-slate-200 truncate">{name}</span>
      <div className={`h-4 w-4 rounded-xs border border-border-subtle shrink-0 ${bgClass}`} />
    </div>
    <div>
      <span className="font-mono text-[11px] text-slate-400 block">{hex}</span>
      <span className="text-[10px] text-slate-500 leading-tight block truncate mt-0.5">{role}</span>
    </div>
  </div>
);
