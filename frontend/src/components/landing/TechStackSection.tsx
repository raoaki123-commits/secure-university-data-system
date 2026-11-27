import React from 'react';
import { Database, Cpu, Terminal, Lock, Globe } from 'lucide-react';
import { Badge } from '../../design-system/components/Badge';

export const TechStackSection: React.FC = () => {
  const stack = [
    {
      role: 'CORE BACKEND FRAMEWORK',
      name: 'Python & Flask',
      version: 'Flask 3.x / Python 3.10+',
      description:
        'Asynchronous Modular Monolith orchestrating authentication, candidate query dispatch, and Redis background cryptographic worker tasks.',
      status: 'APPROVED CORE STACK',
      badgeVariant: 'verified' as const,
      icon: <Terminal className="h-5 w-5 text-brand-400" />,
    },
    {
      role: 'INTELLIGENCE & EMBEDDINGS',
      name: 'TensorFlow 2.x',
      version: 'Keras Two-Tower Pipeline',
      description:
        'Offline neural representation learning. Encodes multi-attribute catalog texts and interest taxonomies into dense 64-dimensional latent vectors.',
      status: 'APPROVED CORE STACK',
      badgeVariant: 'verified' as const,
      icon: <Cpu className="h-5 w-5 text-amber-400" />,
    },
    {
      role: 'DATABASE & DATA GOVERNANCE',
      name: 'MongoDB 7.x',
      version: 'CSFLE Field-Level Encryption',
      description:
        'Document-oriented storage for academic, event, and service catalogs. Sensitive user PII is protected via Client-Side Field-Level Encryption.',
      status: 'APPROVED CORE STACK',
      badgeVariant: 'verified' as const,
      icon: <Database className="h-5 w-5 text-emerald-400" />,
    },
    {
      role: 'HOMOMORPHIC ENCRYPTION',
      name: 'TenSEAL (Microsoft SEAL)',
      version: 'CKKS Vector Cryptosystem',
      description:
        'Executes blind inner products over encrypted real-number float vectors with 128-bit classical security under the Learning With Errors assumption.',
      status: 'PROPOSED CORE CRYPTO',
      badgeVariant: 'shield' as const,
      icon: <Lock className="h-5 w-5 text-cyan-400" />,
    },
    {
      role: 'CLIENT CRYPTO & INTERFACE',
      name: 'React 18 & TypeScript',
      version: 'Vite · Tailwind · Three.js',
      description:
        'Enables client-side vector normalization, WebAssembly cryptographic key generation, and 60fps cinematic 3D visual storytelling.',
      status: 'PROPOSED FRONTEND',
      badgeVariant: 'shield' as const,
      icon: <Globe className="h-5 w-5 text-purple-400" />,
    },
  ];

  return (
    <section id="technology" className="py-24 border-b border-border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left max-w-2xl space-y-3 mb-16">
          <Badge variant="shield" size="md">
            ENGINEERING SPECIFICATION
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Validated Technology Architecture
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Preserving the approved institutional stack while integrating high-performance
            cryptographic and frontend additions verified in Phase 1.
          </p>
        </div>

        {/* Technology Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {stack.map((item) => (
            <div
              key={item.name}
              className="p-6 rounded-md border border-border-default bg-void-surface hover:border-border-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 rounded-sm bg-void border border-border-default">
                    {item.icon}
                  </span>
                  <Badge variant={item.badgeVariant} size="sm">
                    {item.status}
                  </Badge>
                </div>

                <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider block mb-1">
                  {item.role}
                </span>

                <h3 className="font-display text-lg font-bold text-slate-100 mb-0.5">
                  {item.name}
                </h3>

                <p className="font-mono text-xs text-brand-400 mb-3">{item.version}</p>

                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Phase 1 Architecture</span>
                <span className="text-status-verified font-medium">Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
