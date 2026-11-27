import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { RoleDashboardRouter } from './components/dashboards/RoleDashboardRouter';

type AppView = 'landing' | 'login' | 'register' | 'portal';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage
          onOpenPortal={() => setCurrentView('portal')}
          onNavigateFullscreenAuth={(mode) => setCurrentView(mode)}
        />
      )}

      {currentView === 'login' && (
        <LoginPage
          onNavigateHome={() => setCurrentView('landing')}
          onNavigateRegister={() => setCurrentView('register')}
          onLoginSuccess={() => setCurrentView('portal')}
        />
      )}

      {currentView === 'register' && (
        <RegisterPage
          onNavigateHome={() => setCurrentView('landing')}
          onNavigateLogin={() => setCurrentView('login')}
          onRegisterSuccess={() => setCurrentView('portal')}
        />
      )}

      {currentView === 'portal' && (
        <RoleDashboardRouter
          onNavigateHome={() => setCurrentView('landing')}
          onNavigateLogin={() => setCurrentView('login')}
        />
      )}
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
