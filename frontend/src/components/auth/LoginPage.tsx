import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, AlertTriangle, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { Card } from '../../design-system/components/Card';

interface LoginPageProps {
  onNavigateHome: () => void;
  onNavigateRegister: () => void;
  onLoginSuccess: (role: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateHome,
  onNavigateRegister,
  onLoginSuccess,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both institutional email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user.role);
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPassword2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-void text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background cryptographic grid & radial glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Back to Home Button */}
      <button
        onClick={onNavigateHome}
        className="fixed top-6 left-6 z-20 flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-100 transition-colors px-3 py-1.5 rounded-full bg-void-elevated/80 border border-border-default backdrop-blur-md"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Return to Overview
      </button>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30 mx-auto">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-100">
            Sovereign Portal Access
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            University Communities Privacy-Preserving Recommendation & Resource Hub
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Badge variant="verified">JWT / HS256</Badge>
            <Badge variant="shield">Argon2id Hash</Badge>
            <Badge variant="confidential">RBAC Protected</Badge>
          </div>
        </div>

        {/* Authentication Card */}
        <Card className="p-6 border-border-default bg-void-surface/90 backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3 rounded-sm bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold font-mono text-[11px] uppercase tracking-wider">Authentication Error</p>
                <p className="mt-0.5 text-slate-300">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Institutional Email Address"
              type="email"
              placeholder="user@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
              helperText="University domain (@*.edu, @*.ac.*) recognized"
            />

            <Input
              label="Account Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              <KeyRound className="h-4 w-4 mr-2" />
              Authenticate Session
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          {/* Quick Evaluator Demo Roles */}
          <div className="mt-6 pt-5 border-t border-border-default">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
                Quick-Fill Demo Identities
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Evaluation mode</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('student.test@university.edu')}
                className="text-left p-2 rounded bg-void-elevated/70 border border-border-default hover:border-brand-500/50 hover:bg-void-elevated transition-all group"
              >
                <div className="text-[11px] font-mono font-medium text-slate-200 group-hover:text-brand-300">
                  Student Persona
                </div>
                <div className="text-[10px] text-slate-400 truncate">student.test@university.edu</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('faculty.lead@university.edu')}
                className="text-left p-2 rounded bg-void-elevated/70 border border-border-default hover:border-brand-500/50 hover:bg-void-elevated transition-all group"
              >
                <div className="text-[11px] font-mono font-medium text-slate-200 group-hover:text-brand-300">
                  Faculty Persona
                </div>
                <div className="text-[10px] text-slate-400 truncate">faculty.lead@university.edu</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('campus.staff@university.edu')}
                className="text-left p-2 rounded bg-void-elevated/70 border border-border-default hover:border-brand-500/50 hover:bg-void-elevated transition-all group"
              >
                <div className="text-[11px] font-mono font-medium text-slate-200 group-hover:text-brand-300">
                  Staff Persona
                </div>
                <div className="text-[10px] text-slate-400 truncate">campus.staff@university.edu</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('root.admin@university.edu')}
                className="text-left p-2 rounded bg-void-elevated/70 border border-border-default hover:border-brand-500/50 hover:bg-void-elevated transition-all group"
              >
                <div className="text-[11px] font-mono font-medium text-slate-200 group-hover:text-brand-300">
                  Admin Persona
                </div>
                <div className="text-[10px] text-slate-400 truncate">root.admin@university.edu</div>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2 font-mono">
              Demo passwords default to <code className="text-accent-cyan">DemoPassword2026!</code>. Register these accounts or any new identity to test live.
            </p>
          </div>
        </Card>

        {/* Switch to Register */}
        <div className="text-center text-xs text-slate-400">
          New to the university cryptographic collective?{' '}
          <button
            onClick={onNavigateRegister}
            className="text-brand-400 hover:text-brand-300 font-medium underline underline-offset-2 ml-1"
          >
            Create an Account
          </button>
        </div>

        {/* Security Footnote */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-status-verified" />
          <span>Zero-Knowledge Architecture • Password hashes never leave the server</span>
        </div>
      </div>
    </div>
  );
};
