import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Sliders,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { studentApi } from '../../../../services/studentApi';
import type { PrivacyPreferences } from '../../../../services/studentApi';

export const PrivacyView: React.FC = () => {
  const [prefs, setPrefs] = useState<PrivacyPreferences>({
    share_department_with_recommender: true,
    collect_interaction_history: true,
    homomorphic_noise_scale: 0.05,
    differential_privacy_epsilon: 0.5,
    zero_knowledge_audit_logging: true,
    anonymize_bookmarks: true,
  });
  const [, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadPrefs = async () => {
      setIsLoading(true);
      try {
        const res = await studentApi.getPrivacyPreferences();
        if (res.data?.preferences) {
          setPrefs(res.data.preferences);
        }
      } catch (err) {
        console.error('Failed to load privacy preferences:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPrefs();
  }, []);

  const handleToggle = (key: keyof PrivacyPreferences) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await studentApi.updatePrivacyPreferences(prefs);
      if (res.data?.preferences) {
        setPrefs(res.data.preferences);
        setSuccessMsg('Privacy preferences and consent record successfully updated.');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Failed to save privacy preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-3 rounded-sm bg-status-verified/10 border border-status-verified/30 text-status-verified text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Overview Banner */}
      <div className="p-6 rounded-md bg-gradient-to-r from-void-elevated via-void-surface to-void-elevated border border-border-default space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="verified">ZERO-KNOWLEDGE PRIVACY SUITE</Badge>
          <span className="text-xs font-mono text-status-verified flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Client-Side Isolation Active
          </span>
        </div>
        <h2 className="font-display text-xl font-bold text-slate-100">
          Student Data Sovereignty & Consent Controls
        </h2>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          The SHTKS platform guarantees that your academic preferences, wellness inquiries, and interaction history are never shared with advertisers or third parties. Adjust your computation boundaries below.
        </p>
      </div>

      {/* DATA INVENTORY & TRANSPARENT STORAGE AUDIT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-border-default bg-void-surface space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
            <Database className="h-4 w-4 text-accent-cyan" />
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
              Data Stored On University Servers
            </h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent-cyan shrink-0 mt-0.5" />
              <span>Institutional Email & Hashed Credential (Argon2id salted)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent-cyan shrink-0 mt-0.5" />
              <span>Declared Academic Department (e.g. Computer Science)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent-cyan shrink-0 mt-0.5" />
              <span>Saved Item References (anonymized user hash)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent-cyan shrink-0 mt-0.5" />
              <span>Timestamped Consent Records & Privacy Parameter State</span>
            </li>
          </ul>
        </Card>

        <Card className="p-5 border-border-default bg-void-surface space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
            <EyeOff className="h-4 w-4 text-status-verified" />
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
              Guaranteed Never Stored in Cleartext
            </h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-status-verified shrink-0 mt-0.5" />
              <span>Cleartext User Passwords (Argon2id hashes only)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-status-verified shrink-0 mt-0.5" />
              <span>Raw Topic Interest Vectors (processed in client RAM)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-status-verified shrink-0 mt-0.5" />
              <span>Confidential Counseling Intake Notes & Medical Disclosures</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-status-verified shrink-0 mt-0.5" />
              <span>Cross-Site Tracking Cookies or External Telemetry</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* PRIVACY TOGGLES FORM */}
      <Card className="p-6 border-border-default bg-void-surface space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border-default">
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-100">
              Personal Data Sharing & Telemetry Toggles
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Control which attributes are made accessible to the recommendation scoring baseline.
            </p>
          </div>
          <Badge variant="verified">ACTIVE FERPA COMPLIANCE</Badge>
        </div>

        <div className="space-y-4">
          {/* Toggle 1 */}
          <div className="flex items-center justify-between p-3 rounded bg-void-elevated/60 border border-border-subtle">
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Department Affiliation Sharing
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Allows the recommendation model to prioritize study materials matching your academic division.
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('share_department_with_recommender')}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                prefs.share_department_with_recommender ? 'bg-brand-500' : 'bg-void-surface border border-border-default'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-50 transition-transform ${
                  prefs.share_department_with_recommender ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between p-3 rounded bg-void-elevated/60 border border-border-subtle">
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Collect Interaction & Feedback History
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Logs your 'Useful' and 'Irrelevant' feedback to personalize future recommendation rankings.
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('collect_interaction_history')}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                prefs.collect_interaction_history ? 'bg-brand-500' : 'bg-void-surface border border-border-default'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-50 transition-transform ${
                  prefs.collect_interaction_history ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3 */}
          <div className="flex items-center justify-between p-3 rounded bg-void-elevated/60 border border-border-subtle">
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Anonymize Saved Collection Bookmarks
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Separates saved bookmarks from institutional student directory lookups.
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('anonymize_bookmarks')}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                prefs.anonymize_bookmarks ? 'bg-brand-500' : 'bg-void-surface border border-border-default'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-50 transition-transform ${
                  prefs.anonymize_bookmarks ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ADVANCED CRYPTOGRAPHIC PARAMETER SLIDERS */}
        <div className="pt-4 border-t border-border-default space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-accent-cyan" />
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
              Cryptographic Noise & Differential Privacy Thresholds
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-void-elevated rounded border border-border-subtle space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">CKKS Homomorphic Noise Scale</span>
                <span className="text-accent-cyan font-bold">{prefs.homomorphic_noise_scale}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.20"
                step="0.01"
                value={prefs.homomorphic_noise_scale}
                onChange={(e) =>
                  setPrefs((prev) => ({
                    ...prev,
                    homomorphic_noise_scale: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-1.5 bg-void-surface rounded-lg appearance-none cursor-pointer accent-accent-cyan"
              />
              <p className="text-[10px] text-slate-400 leading-tight">
                Controls Gaussian noise added during client vector scaling before server dot product.
              </p>
            </div>

            <div className="p-3 bg-void-elevated rounded border border-border-subtle space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Differential Privacy Epsilon (ε)</span>
                <span className="text-accent-emerald font-bold">{prefs.differential_privacy_epsilon}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={prefs.differential_privacy_epsilon}
                onChange={(e) =>
                  setPrefs((prev) => ({
                    ...prev,
                    differential_privacy_epsilon: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-1.5 bg-void-surface rounded-lg appearance-none cursor-pointer accent-accent-emerald"
              />
              <p className="text-[10px] text-slate-400 leading-tight">
                Lower epsilon provides mathematically stronger differential privacy with slight utility trade-off.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Submit & Consent Timestamp */}
        <div className="pt-4 border-t border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-400">
            Last Consent Handshake:{' '}
            <span className="text-slate-300">
              {prefs.last_consent_at ? prefs.last_consent_at.replace('T', ' ').split('.')[0] : 'Active'} UTC
            </span>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<ShieldCheck className="h-4 w-4" />}
          >
            Save Privacy Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
};
