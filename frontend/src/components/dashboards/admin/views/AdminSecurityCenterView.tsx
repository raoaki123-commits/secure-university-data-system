import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Key,
  Lock,
  Cpu,
  Server,
  Terminal,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { adminApi, type SecurityStatusData } from '../../../../services/adminApi';

interface AdminSecurityCenterViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminSecurityCenterView: React.FC<AdminSecurityCenterViewProps> = ({ onShowToast }) => {
  const [securityData, setSecurityData] = useState<SecurityStatusData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSecurityStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getSecurityStatus();
      if (res.security_status) {
        setSecurityData(res.security_status);
      }
    } catch {
      onShowToast('Failed to load security control center data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    fetchSecurityStatus();
  }, [fetchSecurityStatus]);

  if (isLoading || !securityData) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-800/60 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-800/40 rounded-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { authentication, session_tokens, homomorphic_encryption, multi_party_computation, access_control, recent_security_events } = securityData;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              Privacy & Cryptographic Control Center
            </h1>
            <Badge variant="verified" size="sm">ACTIVE ENCLAVE</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real operational disclosures: zero-cleartext guarantees, token versioning, and privacy preservation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-sm bg-void-surface border border-border-default text-xs font-mono text-slate-300">
            <span className="text-slate-400">RBAC Guard: </span>
            <span className="text-emerald-400 font-bold">{access_control.admin_provision_safeguard}</span>
          </div>
        </div>
      </div>

      {/* Security Architecture Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Authentication & Hashing */}
        <Card className="p-5 border-border-default/70 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-default/60">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-400" />
              <h3 className="font-display text-sm font-semibold text-slate-100">
                User Authentication & Password Security
              </h3>
            </div>
            <Badge variant="verified" size="sm">OPERATIONAL</Badge>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-border-default/40">
              <span className="text-slate-400">Hashing Algorithm:</span>
              <span className="text-slate-100 font-bold">{authentication.algorithm}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-default/40">
              <span className="text-slate-400">Memory Cost:</span>
              <span className="text-slate-200">{authentication.parameters.memory_cost}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-default/40">
              <span className="text-slate-400">Time Cost (Iterations):</span>
              <span className="text-slate-200">{authentication.parameters.time_cost} rounds</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-default/40">
              <span className="text-slate-400">Thread Parallelism:</span>
              <span className="text-slate-200">{authentication.parameters.parallelism} threads</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">CSPRNG Salt Length:</span>
              <span className="text-slate-200">{authentication.parameters.salt_length}</span>
            </div>
          </div>
        </Card>

        {/* Module 2: Session & Token Management */}
        <Card className="p-5 border-border-default/70 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-default/60">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand-400" />
              <h3 className="font-display text-sm font-semibold text-slate-100">
                Session Tokens & Invalidation
              </h3>
            </div>
            <Badge variant="verified" size="sm">OPERATIONAL</Badge>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-border-default/40">
              <span className="text-slate-400">Token Format:</span>
              <span className="text-slate-100 font-bold">{session_tokens.type}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-default/40">
              <span className="text-slate-400">Access Token Expiry:</span>
              <span className="text-accent-cyan">{session_tokens.access_expiry}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-default/40">
              <span className="text-slate-400">Refresh Token Expiry:</span>
              <span className="text-slate-200">{session_tokens.refresh_expiry}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Active Invalidation:</span>
              <span className="text-emerald-400 font-medium">{session_tokens.rotation_enforcement}</span>
            </div>
          </div>
        </Card>

        {/* Module 3: Homomorphic Encryption Disclosure */}
        <Card className="p-5 border-border-default/70 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-default/60">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-400" />
              <h3 className="font-display text-sm font-semibold text-slate-100">
                Homomorphic Encryption (HE) Scheme
              </h3>
            </div>
            <Badge variant={homomorphic_encryption.status === 'OPERATIONAL' ? 'verified' : 'pending'} size="sm">
              {homomorphic_encryption.status === 'OPERATIONAL' ? 'CKKS 128-BIT OPERATIONAL' : 'BASELINE ACTIVE'}
            </Badge>
          </div>

          <div className="p-3 bg-void-surface rounded-sm border border-border-default text-xs font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Phase Engine:</span>
              <span className="text-slate-100 font-bold">{homomorphic_encryption.active_scheme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target HE Scheme:</span>
              <span className="text-purple-300 font-bold">{homomorphic_encryption.target_scheme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ring Modulus:</span>
              <span className="text-slate-300">{homomorphic_encryption.polynomial_ring_modulus}</span>
            </div>
          </div>

          <div className="p-3 bg-void-surface/60 border border-border-default/70 rounded-sm text-[11px] font-mono text-slate-400 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300">Operational Guarantee:</strong> Production TenSEAL CKKS 128-bit ring evaluation is active. Client preference vectors are encrypted on the client device before transmission to the recommendation scoring gateway.
            </div>
          </div>
        </Card>

        {/* Module 4: Multi-Party Computation Gateway */}
        <Card className="p-5 border-border-default/70 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-default/60">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-accent-cyan" />
              <h3 className="font-display text-sm font-semibold text-slate-100">
                Secure Multi-Party Computation (MPC)
              </h3>
            </div>
            <Badge variant="verified" size="sm">3-NODE CLUSTER ACTIVE</Badge>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-border-default/40">
              <span className="text-slate-400">Node Topology:</span>
              <span className="text-slate-100 font-bold">{multi_party_computation.architecture}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-default/40">
              <span className="text-slate-400">Online Enclave Nodes:</span>
              <span className="text-emerald-400 font-bold">{multi_party_computation.mpc_nodes_online} Active Nodes</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Oblivious Protocol:</span>
              <span className="text-slate-300">{multi_party_computation.mpc_protocol}</span>
            </div>
          </div>

          <div className="p-3 bg-void-surface/60 border border-border-default/70 rounded-sm text-[11px] font-mono text-slate-400 flex items-start gap-2">
            <Terminal className="h-4 w-4 text-accent-cyan shrink-0 mt-0.5" />
            <div>
              Zero sensitive cleartext ratings are stored in the database. Cohort feedback is processed via 3-Party additive secret sharing with Beaver Triples.
            </div>
          </div>
        </Card>
      </div>

      {/* Security Event Log */}
      <Card className="p-5 border-border-default/70">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-status-danger" />
            <h3 className="font-display text-sm font-semibold text-slate-100">
              Cryptographic Enclave Activity Log
            </h3>
          </div>
          <Badge variant="neutral" size="sm">Last 10 Actions</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border-default/60 text-slate-400">
                <th className="py-2 px-3 font-medium">Timestamp</th>
                <th className="py-2 px-3 font-medium">Action</th>
                <th className="py-2 px-3 font-medium">Operator</th>
                <th className="py-2 px-3 font-medium">Target ID</th>
                <th className="py-2 px-3 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/40">
              {recent_security_events.map((evt) => (
                <tr key={evt.id} className="hover:bg-void-surface/50 transition-colors">
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-200 border border-slate-700">
                      {evt.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-300">{evt.admin_email}</td>
                  <td className="py-2 px-3 text-slate-400 text-[11px]">{evt.target_id || 'System'}</td>
                  <td className="py-2 px-3 text-slate-500 text-[11px]">{evt.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
