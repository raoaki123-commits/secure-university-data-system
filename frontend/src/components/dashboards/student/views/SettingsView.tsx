import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { Input } from '../../../../design-system/components/Input';
import { studentApi } from '../../../../services/studentApi';

export const SettingsView: React.FC = () => {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Notification toggles state (UI preferences)
  const [emailDigest, setEmailDigest] = useState(true);
  const [eventAlerts, setEventAlerts] = useState(true);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);

    if (!currentPassword || !newPassword) {
      setPwMessage({ text: 'All password fields are required.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      setPwMessage({ text: 'New password must contain at least 8 characters.', type: 'error' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await studentApi.changePassword(currentPassword, newPassword);
      if (res.status === 200) {
        setPwMessage({
          text: 'Password successfully changed and re-hashed with Argon2id.',
          type: 'success',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwMessage({
          text: res.error || 'Failed to change password. Please verify current password.',
          type: 'error',
        });
      }
    } catch {
      setPwMessage({ text: 'Error connecting to auth service.', type: 'error' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Password Rotation Card */}
      <Card className="p-6 border-border-default bg-void-surface space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border-default">
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-100 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-brand-400" />
              <span>Rotate Account Password</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Updates your Argon2id hash on the server and terminates stale session tokens.
            </p>
          </div>
          <Badge variant="shield">Argon2id Salted</Badge>
        </div>

        {pwMessage && (
          <div
            className={`p-3 rounded-sm text-xs font-mono flex items-center gap-2 ${
              pwMessage.type === 'success'
                ? 'bg-status-verified/10 border border-status-verified/30 text-status-verified'
                : 'bg-status-danger/10 border border-status-danger/30 text-status-danger'
            }`}
          >
            {pwMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{pwMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="CURRENT PASSWORD"
            type="password"
            placeholder="••••••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="NEW PASSWORD"
              type="password"
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
              helperText="Min 8 chars with uppercase, lowercase, digit, symbol"
            />

            <Input
              label="CONFIRM NEW PASSWORD"
              type="password"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isChangingPassword}
              leftIcon={<KeyRound className="h-4 w-4" />}
            >
              Update Password Hash
            </Button>
          </div>
        </form>
      </Card>

      {/* Notifications Preferences */}
      <Card className="p-6 border-border-default bg-void-surface space-y-4">
        <div className="pb-3 border-b border-border-default">
          <h3 className="font-display text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Bell className="h-4 w-4 text-accent-cyan" />
            <span>Communication Preferences</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure how you receive recommendations and campus alerts.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded bg-void-elevated/60 border border-border-subtle">
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Weekly Recommendation Digest
              </div>
              <div className="text-[11px] text-slate-400">
                Receive a weekly summary of new study guides matching your department.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEmailDigest(!emailDigest)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                emailDigest ? 'bg-brand-500' : 'bg-void-surface border border-border-default'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-50 transition-transform ${
                  emailDigest ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-void-elevated/60 border border-border-subtle">
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Campus Hackathon & Colloquium Alerts
              </div>
              <div className="text-[11px] text-slate-400">
                Direct notices for academic competitions with registration deadlines.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEventAlerts(!eventAlerts)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                eventAlerts ? 'bg-brand-500' : 'bg-void-surface border border-border-default'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-50 transition-transform ${
                  eventAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Session Termination Card */}
      <Card className="p-6 border-status-danger/30 bg-void-surface space-y-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-status-danger flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>Active Session Governance</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Terminating your session immediately invalidates your JWT access token and removes client key material from local memory.
          </p>
        </div>

        <div className="pt-2 flex justify-start">
          <Button
            variant="danger"
            size="md"
            onClick={() => logout()}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Terminate Session & Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
