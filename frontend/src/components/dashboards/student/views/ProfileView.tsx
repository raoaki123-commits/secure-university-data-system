import React, { useState } from 'react';
import {
  User,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { Input } from '../../../../design-system/components/Input';
import { studentApi } from '../../../../services/studentApi';

export const ProfileView: React.FC = () => {
  const { user, refreshSession } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const departments = [
    'Computer Science',
    'Mathematics',
    'Electrical Engineering',
    'Chemistry',
    'Bioinformatics',
    'Interdisciplinary',
  ];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ text: 'Full name cannot be empty.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await studentApi.updateProfile({ name, department });
      if (res.status === 200) {
        await refreshSession();
        setMessage({ text: 'Student profile successfully updated.', type: 'success' });
      } else {
        setMessage({ text: res.error || 'Failed to update profile.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error connecting to server.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile Header Card */}
      <div className="p-6 bg-void-surface rounded-md border border-border-default flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30 flex items-center justify-center font-display text-xl font-bold">
            {user?.name ? user.name[0].toUpperCase() : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-slate-100">
                {user?.name}
              </h2>
              <Badge variant="verified">STUDENT</Badge>
            </div>
            <p className="text-xs font-mono text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="p-2.5 rounded bg-void-elevated border border-border-subtle font-mono text-xs">
          <div className="text-[10px] text-slate-400 uppercase">System Identity ID</div>
          <div className="text-slate-200 font-semibold">{user?.id}</div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-sm text-xs font-mono flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-status-verified/10 border border-status-verified/30 text-status-verified'
              : 'bg-status-danger/10 border border-status-danger/30 text-status-danger'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Editable Fields */}
      <Card className="p-6 border-border-default bg-void-surface space-y-5">
        <div className="pb-3 border-b border-border-default">
          <h3 className="font-display text-sm font-semibold text-slate-100">
            Institutional Record Information
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Keep your department and legal academic name current for accurate recommendation alignment.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="FULL NAME"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            leftIcon={<User className="h-4 w-4 text-slate-400" />}
          />

          <Input
            label="INSTITUTIONAL EMAIL (READ-ONLY)"
            type="email"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
            helperText="Institutional email is cryptographically bound to your registration record."
          />

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              ACADEMIC DEPARTMENT / DIVISION
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-sm bg-void-elevated border border-border-default text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              The recommendation engine prioritizes course study guides and research papers for this department.
            </p>
          </div>

          <div className="pt-3 border-t border-border-default flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
