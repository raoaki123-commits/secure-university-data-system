import React, { useState } from 'react';
import { Shield, Lock, EyeOff, AlertTriangle, CheckCircle2, Server, Smartphone } from 'lucide-react';
import { Badge } from '../../design-system/components/Badge';
import { Card } from '../../design-system/components/Card';

export const PrivacySection: React.FC = () => {
  const [privacyMode, setPrivacyMode] = useState<'sovereign' | 'centralized'>('sovereign');

  return (
    <section id="privacy" className="py-24 border-b border-border-default bg-void-surface/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <Badge variant="shield" size="md">
            CRYPTOGRAPHIC RIGOR
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Privacy Preserving by Mathematical Architecture
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            We don’t rely on corporate policy promises or vague privacy disclaimers. Confidentiality
            is guaranteed through lattice-based Homomorphic Encryption and 2-Party Computation.
          </p>
        </div>

        {/* Interactive Comparison Playground */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-md border border-border-default bg-void-elevated mb-6">
            <div className="text-left">
              <span className="font-mono text-xs text-brand-400 block mb-0.5">
                INTERACTIVE THREAT MODEL SIMULATOR
              </span>
              <h3 className="font-display text-base font-semibold text-slate-200">
                What Does the Central University IT Server See?
              </h3>
            </div>

            <div className="flex items-center gap-2 p-1 rounded-sm bg-void-base border border-border-default">
              <button
                onClick={() => setPrivacyMode('centralized')}
                className={`px-3 py-1.5 rounded-xs text-xs font-mono transition-colors ${
                  privacyMode === 'centralized'
                    ? 'bg-status-danger/20 text-status-danger font-semibold border border-status-danger/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Standard Platform
              </button>
              <button
                onClick={() => setPrivacyMode('sovereign')}
                className={`px-3 py-1.5 rounded-xs text-xs font-mono transition-colors ${
                  privacyMode === 'sovereign'
                    ? 'bg-status-verified/20 text-status-verified font-semibold border border-status-verified/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SHTKS Sovereign (Active)
              </button>
            </div>
          </div>

          {/* Side by Side Simulated Data Inspector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Box 1: On-Device Student View */}
            <Card className="p-6 border-border-default bg-void-surface">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-brand-400" />
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    USER TERMINAL (STUDENT DEVICE)
                  </span>
                </div>
                <Badge variant="verified" size="sm">
                  TRUSTED BOUNDARY
                </Badge>
              </div>

              <div className="space-y-3 font-mono text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">STUDENT IDENTITY:</span>
                  <p className="text-slate-200">alex.chen@university.edu (Verified Student)</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ACTIVE PREFERENCE VECTOR u:</span>
                  <p className="text-shield-300 bg-void-elevated p-2 rounded-xs border border-border-subtle truncate">
                    [0.4128, -0.1842, 0.6201, 0.0894, ..., 0.2215] (64 dims)
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SELECTED SUPPORT TAGS:</span>
                  <p className="text-purple-300">"Exam Stress", "CS Graduate Seminar", "Career Fair"</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">LOCAL SECRET KEY (sk):</span>
                  <p className="text-status-verified">Held strictly in RAM · Never serialized or transmitted</p>
                </div>
              </div>
            </Card>

            {/* Box 2: What University Central Server Logs */}
            <Card
              className={`p-6 border transition-all ${
                privacyMode === 'centralized'
                  ? 'border-status-danger/40 bg-void-950 shadow-modal'
                  : 'border-status-verified/40 bg-void-surface shadow-subtle'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-slate-400" />
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    CENTRAL IT INGESTION SERVER
                  </span>
                </div>
                <Badge
                  variant={privacyMode === 'centralized' ? 'danger' : 'verified'}
                  size="sm"
                  hasDot
                  pulseDot
                >
                  {privacyMode === 'centralized' ? 'PLAIN INGESTION (HIGH RISK)' : 'ZERO LEAKAGE (ENCRYPTED)'}
                </Badge>
              </div>

              {privacyMode === 'centralized' ? (
                <div className="space-y-3 font-mono text-xs text-status-danger">
                  <div className="flex items-center gap-2 bg-status-danger/10 p-2.5 rounded-xs border border-status-danger/30">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Warning: Plaintext preferences exposed to database admins!</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">LOGGED QUERIES:</span>
                    <p className="text-red-300">"Search: Mental Health Counseling Center suite 402"</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">USER PROFILE DB ROW:</span>
                    <p className="text-red-300">
                      {`{ student_id: "2026-9402", mental_health_risk: "high", gpa: 2.8 }`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2 bg-status-verified/10 p-2.5 rounded-xs border border-status-verified/30 text-status-verified">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>CKKS Protected: Central server inspects zero cleartext profiles!</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">INGESTED PAYLOAD:</span>
                    <p className="text-shield-300 truncate bg-void-elevated p-2 rounded-xs border border-border-subtle">
                      0x7fa4e1b89c3d4f02a991823bc... (CKKS Ciphertext 128 KB)
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">COMPUTATION EXECUTED:</span>
                    <p className="text-slate-200">
                      Blind Inner Products: Enc(u) ⊙ v_i → Enc(score_i)
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">SERVER KNOWLEDGE OF TRUE SCORE:</span>
                    <p className="text-status-verified">0% (Requires 2PC Additive Share from Trustee Node 2)</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Threat Model Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-md border border-border-default bg-void-surface">
            <h4 className="font-display text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-shield-400" />
              Semi-Honest Server Model
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We assume the university central server follows protocol specifications accurately but
              will attempt to infer user attributes from ciphertexts or network metadata if unprotected.
            </p>
          </div>

          <div className="p-5 rounded-md border border-border-default bg-void-surface">
            <h4 className="font-display text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand-400" />
              Non-Collusion Assumption
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              2-Party MPC assumes Node 1 (Central IT) and Node 2 (Student Union Privacy Trustee) do not
              collude. If both parties pooled keys, secret shares could be reconstructed.
            </p>
          </div>

          <div className="p-5 rounded-md border border-border-default bg-void-surface">
            <h4 className="font-display text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-status-verified" />
              Realistic Limitations
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We do not claim "100% unhackable." Network query timing and candidate set sizes can leak
              differential metadata; our architecture applies candidate batching and score noise.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
