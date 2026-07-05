import { useState, useEffect } from 'react';
import { LoginScreen } from './features/auth/LoginScreen';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CausaRaizPage } from './features/causa-raiz/CausaRaizPage';
import { IncidentListScreen } from './features/incidents/IncidentListScreen';
import { AppLayout } from './shared/components/layout/AppLayout';
import { useWebAuthStore } from './features/auth/stores/useWebAuthStore';
import { useWebIncidentStore } from './features/incidents/stores/useWebIncidentStore';
import './shared/theme/index.css';
import './App.css';

function App() {
  const { token, user, initializing, initializeSession, logout } = useWebAuthStore();
  const { startSignalR, stopSignalR, fetchIncidents } = useWebIncidentStore();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (!user) return;
    const role = (user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || user.role || '') as string;
    const userRole = role.toLowerCase();

    if (hash === '#dashboard-analytical') {
      if (userRole !== 'plant manager') {
        if (userRole === 'supervisor') {
          window.location.hash = '#dashboard-operational';
        } else {
          window.location.hash = '#tickets';
        }
      }
    } else if (hash === '#dashboard-operational') {
      if (userRole !== 'plant manager' && userRole !== 'supervisor') {
        window.location.hash = '#tickets';
      }
    }
  }, [hash, user]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    if (token) {
      startSignalR();
      fetchIncidents();
    } else {
      stopSignalR();
    }
  }, [token, startSignalR, stopSignalR, fetchIncidents]);

  if (initializing) {
    return (
      <div className="opscore-list-loading" data-testid="app-initializing">
        <span className="opscore-spinner opscore-spinner-large" />
      </div>
    );
  }

  if (!token) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    const role = (user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || user?.role || '') as string;
    const userRole = role.toLowerCase();

    if (hash === '#dashboard-operational') {
      if (userRole === 'plant manager' || userRole === 'supervisor') {
        return <DashboardPage />;
      }
    }
    if (hash === '#dashboard-analytical') {
      if (userRole === 'plant manager') {
        return <CausaRaizPage />;
      }
    }
    return <IncidentListScreen user={user} onLogout={logout} />;
  };

  return (
    <AppLayout user={user} onLogout={logout}>
      {renderContent()}
    </AppLayout>
  );
}

export default App;

