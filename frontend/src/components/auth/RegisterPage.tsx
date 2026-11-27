import React, { useState, useMemo } from 'react';
import { User, Mail, Lock, ShieldCheck, ArrowRight, AlertTriangle, ArrowLeft, CheckCircle2, ShieldAlert, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../services/api';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { Card } from '../../design-system/components/Card';

interface RegisterPageProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
  onRegisterSuccess: (role: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateHome,
  onNavigateLogin,
  onRegisterSuccess,
}) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [adminProvisionKey, setAdminProvisionKey] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time password strength checks
  const passwordChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const isPasswordValid =
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.digit &&
    passwordChecks.special;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not satisfy institutional complexity requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (role === 'admin' && !adminProvisionKey.trim()) {
      setError('Administrator role requires a cluster provisioning authorization key.');
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      name,
      email,
      password,
      confirm_password: confirmPassword,
      role,
      admin_provision_key: role === 'admin' ? adminProvisionKey : undefined,
      department: department || undefined,
    });
    setIsSubmitting(false);

    if (res.success && res.user) {
      onRegisterSuccess(res.user.role);
    } else {
      setError(res.error || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-void text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background cryptographic grid & radial glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-accent-violet/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Back to Home Button */}
      <button
        onClick={onNavigateHome}
        className="fixed top-6 left-6 z-20 flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-100 transition-colors px-3 py-1.5 rounded-full bg-void-elevated/80 border border-border-default backdrop-blur-md"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Return to Overview
      </button>

      {/* Main Container */}
      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-violet/10 text-accent-violet border border-accent-violet/30 mx-auto">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-100">
            Initialize Sovereign Identity
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create an accredited university profile with zero-knowledge credential protection
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Badge variant="verified">Role-Based Access</Badge>
            <Badge variant="shield">Argon2id Salted</Badge>
            <Badge variant="confidential">SDG 4 / 9 / 11</Badge>
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-6 border-border-default bg-void-surface/90 backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3 rounded-sm bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold font-mono text-[11px] uppercase tracking-wider">Registration Error</p>
                <p className="mt-0.5 text-slate-300">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Dr. Alex Mercer or Maya Lin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              leftIcon={<User className="h-4 w-4 text-slate-400" />}
            />

            {/* Email */}
            <Input
              label="Institutional Email Address"
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
              helperText="University or institutional domain required"
            />

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Institutional Role
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-void-elevated rounded-sm border border-border-default">
                {(['student', 'faculty', 'staff', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 px-2 text-xs font-mono uppercase tracking-wider rounded-xs transition-all ${
                      role === r
                        ? 'bg-brand-500 text-slate-50 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                {role === 'student' && 'Access study tools, academic peer feeds, counseling & campus events.'}
                {role === 'faculty' && 'Publish academic resources, manage advisees & host department workshops.'}
                {role === 'staff' && 'Administer campus wellness services, accessibility & facilities.'}
                {role === 'admin' && 'System-wide governance, audit log inspection & privacy parameter controls.'}
              </p>
            </div>

            {/* Admin Key Safeguard Banner & Input */}
            {role === 'admin' && (
              <div className="p-3 rounded-sm bg-accent-amber/10 border border-accent-amber/30 text-accent-amber space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold font-mono">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Administrative Privilege Safeguard Active</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  To prevent unauthorized privilege escalation, registration for the ADMIN role requires an authorized cluster provisioning key.
                </p>
                <Input
                  label="Cluster Admin Provisioning Key"
                  type="password"
                  placeholder="Enter authorized ADMIN_PROVISION_KEY"
                  value={adminProvisionKey}
                  onChange={(e) => setAdminProvisionKey(e.target.value)}
                  required
                  leftIcon={<Key className="h-4 w-4 text-accent-amber" />}
                  helperText="Default lab evaluation key: sovereign-admin-provision-token-26O2227"
                />
              </div>
            )}

            {/* Department (Optional) */}
            <Input
              label="Department / Faculty Division (Optional)"
              type="text"
              placeholder="e.g. Computer Science, Molecular Biology, Student Affairs"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
              />
            </div>

            {/* Password Strength Checklist */}
            <div className="p-3 bg-void-elevated rounded-sm border border-border-default space-y-1.5">
              <div className="text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password Security Requirements
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono">
                <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-status-verified' : 'text-slate-400'}`}>
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.uppercase ? 'text-status-verified' : 'text-slate-400'}`}>
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>Uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.lowercase ? 'text-status-verified' : 'text-slate-400'}`}>
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>Lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.digit ? 'text-status-verified' : 'text-slate-400'}`}>
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>Numeric digit (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.special ? 'text-status-verified' : 'text-slate-400'}`}>
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>Special character (!@#$)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.match ? 'text-status-verified' : 'text-slate-400'}`}>
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Register Account & Generate Keypair
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </Card>

        {/* Switch to Login */}
        <div className="text-center text-xs text-slate-400">
          Already possess verified university credentials?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-brand-400 hover:text-brand-300 font-medium underline underline-offset-2 ml-1"
          >
            Access Existing Session
          </button>
        </div>
      </div>
    </div>
  );
};
