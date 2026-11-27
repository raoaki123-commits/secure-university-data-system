import React, { useState } from 'react';
import { Lock, Mail, Key, ArrowRight, CheckCircle2, User as UserIcon, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Modal } from '../../design-system/components/Modal';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../services/api';

export interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onOpenPortal?: () => void;
  onNavigateFullscreen?: (mode: 'login' | 'register') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onOpenPortal,
  onNavigateFullscreen,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authenticatedRole, setAuthenticatedRole] = useState<string>('');

  React.useEffect(() => {
    setMode(initialMode);
    setIsSuccess(false);
    setError(null);
  }, [initialMode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setIsLoading(false);
      if (res.success && res.user) {
        setAuthenticatedRole(res.user.role);
        setIsSuccess(true);
      } else {
        setError(res.error || 'Invalid email or password.');
      }
    } else {
      if (!name) {
        setError('Full Name is required for registration.');
        setIsLoading(false);
        return;
      }
      if (role === 'admin' && !adminKey) {
        setError('Administrator role requires cluster provisioning key.');
        setIsLoading(false);
        return;
      }

      const res = await register({
        name,
        email,
        password,
        confirm_password: password,
        role,
        admin_provision_key: role === 'admin' ? adminKey : undefined,
      });
      setIsLoading(false);
      if (res.success && res.user) {
        setAuthenticatedRole(res.user.role);
        setIsSuccess(true);
      } else {
        setError(res.error || 'Registration failed.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Access Sovereign Portal' : 'Create Sovereign Account'}
      description={
        mode === 'login'
          ? 'Authenticate with your university credentials to receive a cryptographically signed JWT access token.'
          : 'Register your institutional identity. Passwords are hash-protected with Argon2id; zero cleartext is stored.'
      }
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-status-verified/15 text-status-verified border border-status-verified/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-display text-base font-semibold text-slate-100">
              {mode === 'login' ? 'Session Handshake Successful' : 'Account Initialized & Authenticated'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Authenticated as <span className="text-brand-300 font-mono">{email}</span> with role{' '}
              <span className="text-accent-cyan font-mono uppercase font-semibold">
                {authenticatedRole || role}
              </span>
              . JWT access tokens granted and stored securely.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
            >
              Close
            </Button>
            {onOpenPortal && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenPortal();
                }}
              >
                Enter {authenticatedRole.toUpperCase()} Portal
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <div className="p-2.5 rounded-sm bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-void-elevated rounded-sm border border-border-default text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-1.5 rounded-xs transition-colors ${
                mode === 'login'
                  ? 'bg-brand-500 text-slate-50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-1.5 rounded-xs transition-colors ${
                mode === 'register'
                  ? 'bg-brand-500 text-slate-50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Registration Fields */}
          {mode === 'register' && (
            <>
              <Input
                label="FULL NAME"
                type="text"
                placeholder="Dr. Maya Lin / Alex Mercer"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<UserIcon className="h-4 w-4 text-slate-400" />}
              />

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 font-mono tracking-wide">
                  INSTITUTIONAL ROLE
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  {(['student', 'faculty', 'staff', 'admin'] as const).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`py-1.5 px-2 rounded-xs border uppercase text-[10px] tracking-wide transition-colors ${
                        role === r
                          ? 'bg-brand-500/20 text-brand-300 border-brand-500 font-semibold'
                          : 'bg-void-elevated text-slate-400 border-border-default hover:border-border-hover'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {role === 'admin' && (
                <div className="p-2.5 bg-status-danger/10 border border-status-danger/30 rounded text-xs space-y-1 text-slate-300">
                  <div className="flex items-center gap-1.5 text-status-danger font-mono font-semibold">
                    <ShieldAlert className="h-4 w-4" />
                    Admin Provisioning Safeguard
                  </div>
                  <Input
                    label="PROVISIONING KEY"
                    type="password"
                    placeholder="Enter cluster admin secret"
                    required
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    helperText="Evaluation default: sovereign-admin-provision-token-26O2227"
                  />
                </div>
              )}
            </>
          )}

          {/* Email Input */}
          <Input
            label="UNIVERSITY EMAIL"
            type="email"
            placeholder="name@university.edu"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
            helperText="Accepted domains: @*.edu, @*.ac.*"
          />

          {/* Password Input */}
          <Input
            label="PASSWORD"
            type="password"
            placeholder="••••••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
            helperText={mode === 'register' ? 'Min 8 chars, uppercase, lowercase, number, symbol' : 'Argon2id verified server-side'}
          />

          {/* Cryptographic Keypair Note */}
          <div className="p-2.5 bg-void-elevated rounded-sm border border-border-default flex items-start gap-2.5 text-[11px] font-mono text-slate-400">
            <Key className="h-4 w-4 text-shield-400 shrink-0 mt-0.5" />
            <span>
              Sessions use rotated JWT access tokens (15m expiry) and Argon2id salted credentials.
            </span>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-between">
            {onNavigateFullscreen && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateFullscreen(mode);
                }}
                className="text-[11px] font-mono text-brand-400 hover:text-brand-300 underline"
              >
                Open Full Screen View
              </button>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {mode === 'login' ? 'Authenticate' : 'Initialize Account'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
