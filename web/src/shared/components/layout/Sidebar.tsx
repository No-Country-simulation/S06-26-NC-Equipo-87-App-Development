import React, { useEffect, useState } from 'react';
import { Logo } from '../molecules/Logo';
import { BarChartIcon } from '../atoms/BarChartIcon';
import { ScatterChartIcon } from '../atoms/ScatterChartIcon';
import { ClipboardIcon } from '../atoms/ClipboardIcon';
import { useWebIncidentStore } from '../../../features/incidents/stores/useWebIncidentStore';

interface SidebarProps {
  user: Record<string, unknown> | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const { openCount } = useWebIncidentStore();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const getGreeting = (): string => {
    if (user && typeof user.firstName === 'string') {
      const lastName = typeof user.lastName === 'string' ? user.lastName : '';
      return `${user.firstName} ${lastName}`.trim();
    }
    return typeof user?.unique_name === 'string' ? user.unique_name : 'Usuario';
  };

  const getUserRoleLabel = (): string => {
    const role = user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || user?.role;
    return typeof role === 'string' ? role.toUpperCase() : '';
  };

  const isDashboardActive = hash === '#dashboard-operational';
  const isCausaRaizActive = hash === '#dashboard-analytical';
  const isTicketsActive = !isDashboardActive && !isCausaRaizActive;

  const userRole = getUserRoleLabel().toLowerCase();
  const canAccessDashboard = userRole === 'plant manager' || userRole === 'supervisor';
  const canAccessCausaRaiz = userRole === 'plant manager';

  return (
    <aside className="opscore-sidebar">
      <div className="opscore-sidebar-top">
        <div className="opscore-sidebar-brand">
          <Logo size={22} color="#E8E6DF" />
          <span className="opscore-sidebar-brand-text">OpsCore</span>
        </div>
        <nav className="opscore-sidebar-nav">
          {canAccessDashboard && (
            <a
              href="#dashboard-operational"
              className={`opscore-sidebar-nav-item ${isDashboardActive ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <BarChartIcon className="opscore-nav-icon" size={18} />
              <span>Dashboard</span>
            </a>
          )}
          {canAccessCausaRaiz && (
            <a
              href="#dashboard-analytical"
              className={`opscore-sidebar-nav-item ${isCausaRaizActive ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <ScatterChartIcon className="opscore-nav-icon" size={18} />
              <span>Causa raíz</span>
            </a>
          )}
          <a
            href="#tickets"
            className={`opscore-sidebar-nav-item ${isTicketsActive ? 'active' : ''}`}
            style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ClipboardIcon className="opscore-nav-icon" size={18} />
              <span>Tickets</span>
            </div>
            {openCount > 0 && (
              <span style={{
                backgroundColor: 'var(--colors-status-open, #ef4444)',
                color: '#fff',
                borderRadius: '12px',
                padding: '2px 6px',
                fontSize: '11px',
                fontWeight: 'bold',
                lineHeight: 1,
                minWidth: '16px',
                textAlign: 'center'
              }}>
                {openCount}
              </span>
            )}
          </a>
        </nav>
      </div>
      <div className="opscore-sidebar-bottom">
        <div className="opscore-user-profile">
          <div className="opscore-user-name">{getGreeting()}</div>
          <div className="opscore-user-role">{getUserRoleLabel() || 'GERENTE DE PLANTA'}</div>
        </div>
        <div className="opscore-sidebar-divider" />
        <button onClick={onLogout} className="opscore-sidebar-logout-btn" aria-label="Cerrar sesión">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
