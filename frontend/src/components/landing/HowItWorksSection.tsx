import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Binary, Sparkles, ArrowRight, Terminal } from 'lucide-react';
import { Badge } from '../../design-system/components/Badge';
import { Card } from '../../design-system/components/Card';

export const HowItWorksSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(2);

  const steps = [
    {
      num: '01',
      id: 1 as const,
      title: 'User Preferences',
      subtitle: 'Local On-Device Vectorization',
      icon: <UserCheck className="h-5 w-5 text-brand-400" />,
      description:
        'Users configure interest tags, academic curriculum, and confidential service needs. The client normalizes these into a 64-dimensional embedding vector u in R^64 on the browser. Cleartext data never leaves the device.',
      badgeText: 'CLIENT-SIDE BOUNDARY',
      badgeVariant: 'neutral' as const,
      technicalNote: 'Vector dimension: d = 64 · L2 Normalized (||u||2 = 1.0)',
      terminalTitle: 'STEP 1: CLIENT-SIDE VECTOR GENERATION',
      terminalContent: `// Evaluated inside user browser memory:
const userInterests = ["Quantum Computing", "Exam Anxiety Support", "Hackathons"];
const u_vector = Vectorizer.embed(userInterests);
// u_vector = [ 0.4128, -0.1842, 0.6201, 0.0894, ..., 0.2215 ] (length: 64)
// Status: Plaintext strictly held in ephemeral browser memory.`,
    },
    {
      num: '02',
      id: 2 as const,
      title: 'Privacy Computation',
      subtitle: 'TenSEAL CKKS Homomorphic Scoring',
      icon: <Binary className="h-5 w-5 text-shield-400" />,
      description:
        'The client encrypts the vector u into ciphertext Enc(u) using a locally generated CKKS public key. The central university server computes inner products against 300+ item embeddings homomorphically without knowing the scores or user preferences.',
      badgeText: 'HOMOMORPHIC INFERENCE',
      badgeVariant: 'shield' as const,
      technicalNote: 'Scheme: CKKS · N = 8192 · Modulus: [60, 40, 40, 60] · Δ = 2^40',
      terminalTitle: 'STEP 2: ENCRYPTED HOMOMORPHIC EVALUATION',
      terminalContent: `// Client sends serialized CKKS ciphertext (128 KB) to Flask API:
Enc(u) = (c0, c1) ∈ (Z_q[X] / (X^N + 1))^2
// Central Server evaluates inner product blindly:
for item in CandidatePool:
    c_score_i = TenSEAL.dot_product(Enc(u), item.v_embedding)
// Server result: [ c_score_1, c_score_2, ..., c_score_M ]
// Key: Server DOES NOT have Secret Key sk. Server CANNOT decrypt scores!`,
    },
    {
      num: '03',
      id: 3 as const,
      title: 'Intelligent Feed',
      subtitle: '2PC Oblivious Top-K Selection',
      icon: <Sparkles className="h-5 w-5 text-status-verified" />,
      description:
        'To prevent the server from learning the user’s score distribution or item associations, a 2-Party MPC protocol (Central Server + Student Union Trustee) uses additive secret sharing to output only the Top-K item IDs without leaking intermediate values.',
      badgeText: 'OBLIVIOUS SELECTION',
      badgeVariant: 'verified' as const,
      technicalNote: 'Additive Secret Shares: S1 + S2 = True Score (mod p)',
      terminalTitle: 'STEP 3: 2-PARTY SECRET SHARING RANKING',
      terminalContent: `// Node 1 (Central IT) and Node 2 (Trustee) run 2PC protocol:
Node_1.share = S1 = [ s1_1, s1_2, ..., s1_M ]
Node_2.share = S2 = [ s2_1, s2_2, ..., s2_M ]
// Neither node knows the actual score value.
// Garbled Circuit evaluates argmax and outputs ONLY indices:
Output_Top5_IDs = [ "res_cs_seminar_04", "serv_wellness_confidential", "event_hackathon_2026", ... ]
// Client renders personalized feed. Central server learns zero score distributions.`,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-b border-border-default bg-void-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <Badge variant="shield" size="md">
            ARCHITECTURAL PIPELINE
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            How The Privacy-Preserving Engine Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Personalization and confidentiality are not mutually exclusive. The platform decouples
            preference vectorization from scoring through homomorphic encryption and 2-party computation.
          </p>
        </div>

        {/* 3 Step Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {steps.map((s) => {
            const isCurrent = activeStep === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`relative p-6 rounded-md border text-left cursor-pointer transition-all duration-200 ${
                  isCurrent
                    ? 'bg-void-elevated border-brand-500/60 shadow-brand-glow/30'
                    : 'bg-void-surface border-border-default hover:border-border-hover hover:bg-void-surface/80'
                }`}
              >
                {/* Step Indicator Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-extrabold text-slate-600">
                    {s.num}
                  </span>
                  <Badge variant={s.badgeVariant} size="sm">
                    {s.badgeText}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 rounded-sm bg-void border border-border-default">
                    {s.icon}
                  </span>
                  <h3 className="font-display text-base font-semibold text-slate-100">
                    {s.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 font-mono mb-3">{s.subtitle}</p>

                <p className="text-xs text-slate-300 leading-relaxed">{s.description}</p>

                <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>{isCurrent ? '● Active Inspection' : 'Click to inspect code'}</span>
                  <ArrowRight className={`h-3 w-3 ${isCurrent ? 'text-brand-400' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Technical Inspection Console */}
        <Card className="border-border-default bg-void-950/90 overflow-hidden text-left shadow-modal">
          <div className="p-3 bg-void-elevated border-b border-border-subtle flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Terminal className="h-4 w-4 text-shield-400" />
              <span>{steps[activeStep - 1].terminalTitle}</span>
            </div>
            <span className="text-[11px] text-slate-500">
              {steps[activeStep - 1].technicalNote}
            </span>
          </div>

          <div className="p-5 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto leading-relaxed">
            <AnimatePresence mode="wait">
              <motion.pre
                key={activeStep}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-shield-300/90 whitespace-pre"
              >
                {steps[activeStep - 1].terminalContent}
              </motion.pre>
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </section>
  );
};
