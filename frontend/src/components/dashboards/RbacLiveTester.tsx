import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { Terminal, CheckCircle2, XCircle } from 'lucide-react';

export const RbacLiveTester: React.FC = () => {
  const { probePortal, user } = useAuth();
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    endpoint: string;
    status: number;
    data?: any;
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async (portalRole: string) => {
    setActiveTest(portalRole);
    setIsLoading(true);
    const res = await probePortal(portalRole);
    setIsLoading(false);
    setTestResult({
      endpoint: `/api/v1/portal/${portalRole}`,
      status: res.status,
      data: res.data,
      error: res.error,
    });
  };

  return (
    <Card className="p-5 border-border-default bg-void-surface">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-border-default mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-accent-cyan" />
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
              Live Backend RBAC Enforcement Prober
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Probe Flask server endpoints using your active JWT token to verify cryptographic privilege boundaries in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="verified">JWT Attached</Badge>
          <Badge variant={user?.role === 'admin' ? 'danger' : 'shield'}>
            Role: {user?.role.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Button
          variant={activeTest === 'student' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => runTest('student')}
          isLoading={isLoading && activeTest === 'student'}
          className="font-mono text-xs"
        >
          Probe /portal/student
        </Button>

        <Button
          variant={activeTest === 'faculty' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => runTest('faculty')}
          isLoading={isLoading && activeTest === 'faculty'}
          className="font-mono text-xs"
        >
          Probe /portal/faculty
        </Button>

        <Button
          variant={activeTest === 'staff' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => runTest('staff')}
          isLoading={isLoading && activeTest === 'staff'}
          className="font-mono text-xs"
        >
          Probe /portal/staff
        </Button>

        <Button
          variant={activeTest === 'admin' ? 'danger' : 'secondary'}
          size="sm"
          onClick={() => runTest('admin')}
          isLoading={isLoading && activeTest === 'admin'}
          className="font-mono text-xs"
        >
          Probe /portal/admin
        </Button>
      </div>

      {/* Output Console */}
      {testResult && (
        <div className="rounded-sm bg-void-pure border border-border-default p-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Endpoint:</span>
              <span className="text-accent-cyan">{testResult.endpoint}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {testResult.status === 200 ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-status-verified" />
                  <span className="text-status-verified font-bold">200 OK — GRANTED</span>
                </>
              ) : testResult.status === 403 ? (
                <>
                  <XCircle className="h-3.5 w-3.5 text-status-danger" />
                  <span className="text-status-danger font-bold">403 FORBIDDEN — RBAC REJECTED</span>
                </>
              ) : (
                <span className="text-accent-amber font-bold">{testResult.status} RESPONSE</span>
              )}
            </div>
          </div>

          <pre className="text-slate-300 text-[11px] overflow-x-auto p-2 bg-void-elevated rounded border border-border-subtle max-h-40">
            {JSON.stringify(testResult.data, null, 2)}
          </pre>

          <p className="mt-2 text-[10px] text-slate-500">
            {testResult.status === 200
              ? 'Access allowed by backend @roles_required decorator based on your verified role claims.'
              : 'Privilege escalation attempt intercepted and denied by Flask backend security middleware.'}
          </p>
        </div>
      )}
    </Card>
  );
};
