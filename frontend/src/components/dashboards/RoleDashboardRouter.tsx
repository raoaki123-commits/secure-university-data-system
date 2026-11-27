import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentDashboard } from './student/StudentDashboard';
import { FacultyDashboard } from './faculty/FacultyDashboard';
import { StaffDashboard } from './staff/StaffDashboard';
import { AdminDashboard } from './admin/AdminDashboard';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface RoleDashboardRouterProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

export const RoleDashboardRouter: React.FC<RoleDashboardRouterProps> = ({
  onNavigateHome,
  onNavigateLogin,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-void text-slate-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center space-y-4 border-status-danger/30 p-6">
          <div className="h-12 w-12 rounded-full bg-status-danger/10 text-status-danger flex items-center justify-center mx-auto border border-status-danger/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-100">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-400">
            Access to role portals requires a cryptographically verified university session token.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <Button variant="secondary" size="sm" onClick={onNavigateHome}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Return Home
            </Button>
            <Button variant="primary" size="sm" onClick={onNavigateLogin}>
              Log In Now
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  switch (user.role) {
    case 'faculty':
      return <FacultyDashboard onNavigateHome={onNavigateHome} />;
    case 'staff':
      return <StaffDashboard onNavigateHome={onNavigateHome} />;
    case 'admin':
      return <AdminDashboard onNavigateHome={onNavigateHome} />;
    case 'student':
    default:
      return <StudentDashboard onNavigateHome={onNavigateHome} />;
  }
};
