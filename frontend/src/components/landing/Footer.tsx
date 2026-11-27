import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-void-950 py-14 text-left border-t border-border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-border-subtle">
          {/* Col 1: Brand & Description (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand-500/10 text-brand-400 border border-brand-500/30">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-display font-extrabold text-sm tracking-tight text-slate-100">
                SHTKS SOVEREIGN
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Secure Resource Recommendation System for University Communities. A privacy-preserving
              platform utilizing Homomorphic Encryption and Secure Multi-Party Computation.
            </p>

            <div className="pt-1 flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>PROJECT CODE: SHTKS (26O2227)</span>
              <span>·</span>
              <span>COMMUNITY SDG</span>
            </div>
          </div>

          {/* Col 2: Navigation Links (2 Cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#hero" className="hover:text-slate-100 transition-colors">
                  Overview
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-slate-100 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-100 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-slate-100 transition-colors">
                  Privacy Engine
                </a>
              </li>
              <li>
                <a href="#technology" className="hover:text-slate-100 transition-colors">
                  Approved Stack
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Research & Security (3 Cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300">
              Cryptographic Specs
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>TenSEAL CKKS Scheme (N=8192)</li>
              <li>2-Party Additive Secret Sharing</li>
              <li>TensorFlow Two-Tower Model</li>
              <li>MongoDB Field-Level Encryption</li>
              <li>FERPA Compliance Boundaries</li>
            </ul>
          </div>

          {/* Col 4: University Community (2 Cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300">
              Stakeholders
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Students</li>
              <li>Faculty Advisors</li>
              <li>Support Staff</li>
              <li>Campus Administrators</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p>© 2026 Team SHTKS (26O2227). All academic and architectural rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">Built with Python, Flask, TensorFlow & MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
