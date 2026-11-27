import React from 'react';
import { ShieldCheck, Lock, Cpu } from 'lucide-react';
import { cn } from '../utils';

export interface CryptoShieldProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 'standard' | 'high' | 'maximum';
  showParameters?: boolean;
}

export const CryptoShield: React.FC<CryptoShieldProps> = ({
  className,
  level = 'maximum',
  showParameters = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border border-shield-500/30 bg-gradient-to-r from-void-elevated via-shield-950/20 to-void-elevated p-3.5 shadow-shield-glow/20',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-shield-500/10 text-shield-400 border border-shield-500/30">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-semibold text-shield-300">
                SOVEREIGN PRIVACY SHIELD
              </span>
              <span className="rounded-full bg-status-verified/15 px-1.5 py-0.2 text-[9px] font-mono text-status-verified border border-status-verified/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Preferences are encrypted locally. Raw vectors never reach central servers.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate-400 border-l border-border-subtle pl-3">
          <span className="inline-flex items-center gap-1 text-slate-300">
            <Lock className="h-3 w-3 text-shield-400" />
            CKKS-128b
          </span>
          <span className="inline-flex items-center gap-1 text-slate-300">
            <Cpu className="h-3 w-3 text-brand-400" />
            2PC Top-K
          </span>
        </div>
      </div>

      {showParameters && (
        <div className="mt-2.5 pt-2 border-t border-border-subtle grid grid-cols-3 gap-2 font-mono text-[10px] text-slate-400">
          <div>
            <span className="text-slate-500">SCHEME:</span> CKKS (Float Vector)
          </div>
          <div>
            <span className="text-slate-500">POLY DEGREE (N):</span> 8192
          </div>
          <div>
            <span className="text-slate-500">SCALE:</span> 2^40 (Approx Math)
          </div>
        </div>
      )}
    </div>
  );
};

