import React, { useEffect, useState } from 'react';
import { Logo } from '../../shared/components/molecules/Logo';
import { Typography } from '../../shared/components/atoms/Typography';
import { Button } from '../../shared/components/atoms/Button';
import { IncidentFilters } from './components/IncidentFilters';
import { IncidentList } from './components/IncidentList';
import { type Incident } from './components/IncidentCard';
import { getRequest, type ApiError } from '../../shared/api/apiClient';

interface IncidentListScreenProps {
  user: Record<string, unknown> | null;
  onLogout: () => void;
}

export const IncidentListScreen: React.FC<IncidentListScreenProps> = ({ user, onLogout }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All');

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRequest<Incident[]>('/api/incidents');
      setIncidents(data || []);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Error al cargar incidentes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadIncidents = async () => {
      try {
        const data = await getRequest<Incident[]>('/api/incidents');
        if (isMounted) {
          setIncidents(data || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const apiErr = err as ApiError;
          setError(apiErr.message || 'Error al cargar incidentes.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadIncidents();
    return () => {
      isMounted = false;
    };
  }, []);

  const getAvailableAreas = () => {
    const areas = incidents.map((i) => i.areaName).filter(Boolean);
    return Array.from(new Set(areas));
  };

  const getAvailableSeverities = () => {
    const severities = incidents.map((i) => i.severityTypeName).filter(Boolean);
    return Array.from(new Set(severities));
  };

  const filteredIncidents = incidents.filter((incident) => {
    if (statusFilter !== 'All') {
      const s = incident.status.toLowerCase();
      const filter = statusFilter.toLowerCase();

      if (filter === 'open' && s !== 'open' && s !== 'abierto') return false;
      if (filter === 'in progress' && s !== 'in progress' && s !== 'in-progress' && s !== 'en proceso' && s !== 'en-proceso') return false;
      if (filter === 'closed' && s !== 'closed' && s !== 'cerrado') return false;
    }
    if (severityFilter !== 'All' && incident.severityTypeName !== severityFilter) {
      return false;
    }
    if (areaFilter !== 'All' && incident.areaName !== areaFilter) {
      return false;
    }
    return true;
  });

  const getGreeting = (): string => {
    if (user && typeof user.firstName === 'string') {
      const lastName = typeof user.lastName === 'string' ? user.lastName : '';
      return `${user.firstName} ${lastName}`.trim();
    }
    return typeof user?.unique_name === 'string' ? user.unique_name : 'Usuario';
  };

  const getUserRoleLabel = (): string => {
    const role = user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || user?.role;
    return typeof role === 'string' ? `(${role})` : '';
  };

  const getOpenCount = () => {
    return incidents.filter((i) => {
      const s = i.status.toLowerCase();
      return s === 'open' || s === 'abierto';
    }).length;
  };

  const getInProgressCount = () => {
    return incidents.filter((i) => {
      const s = i.status.toLowerCase();
      return s === 'in progress' || s === 'in-progress' || s === 'en proceso' || s === 'en-proceso';
    }).length;
  };

  const getClosedCount = () => {
    return incidents.filter((i) => {
      const s = i.status.toLowerCase();
      return s === 'closed' || s === 'cerrado';
    }).length;
  };

  return (
    <div className="opscore-dashboard-layout">
      <aside className="opscore-sidebar">
        <div className="opscore-sidebar-top">
          <div className="opscore-sidebar-brand">
            <Logo size={22} color="#E8E6DF" />
            <span className="opscore-sidebar-brand-text">OpsCore</span>
          </div>
          <nav className="opscore-sidebar-nav">
            <div className="opscore-sidebar-nav-item">
              <svg className="opscore-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span>Dashboard</span>
            </div>
            <div className="opscore-sidebar-nav-item">
              <svg className="opscore-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
              <span>Causa raíz</span>
            </div>
            <div className="opscore-sidebar-nav-item active">
              <svg className="opscore-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
              <span>Tickets</span>
            </div>
          </nav>
        </div>
        <div className="opscore-sidebar-bottom">
          <div className="opscore-user-profile">
            <div className="opscore-user-name">{getGreeting()}</div>
            <div className="opscore-user-role">{getUserRoleLabel() || 'GERENTE DE PLANTA'}</div>
          </div>
          <button onClick={onLogout} className="opscore-sidebar-logout-btn" aria-label="Cerrar sesión">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      <main className="opscore-main-content">
        <div className="opscore-dashboard-header">
          <div className="opscore-header-top-row">
            <h1 className="opscore-dashboard-title">Todos los incidentes</h1>
            <IncidentFilters
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              severityFilter={severityFilter}
              setSeverityFilter={setSeverityFilter}
              areaFilter={areaFilter}
              setAreaFilter={setAreaFilter}
              availableAreas={getAvailableAreas()}
              availableSeverities={getAvailableSeverities()}
            />
          </div>
          <div className="opscore-metrics-summary">
            <span className="opscore-metric-total">{incidents.length} incidentes totales</span>
            <span className="opscore-metric-divider">|</span>
            <span className="opscore-metric-dot opscore-metric-open">• {getOpenCount()} abiertos</span>
            <span className="opscore-metric-divider">|</span>
            <span className="opscore-metric-dot opscore-metric-in-progress">• {getInProgressCount()} en proceso</span>
            <span className="opscore-metric-divider">|</span>
            <span className="opscore-metric-dot opscore-metric-closed">• {getClosedCount()} cerrados</span>
          </div>
        </div>

        {error && (
          <div className="opscore-error-banner" data-testid="dashboard-error">
            <Typography variant="body" color="#791F1F">
              {error}
            </Typography>
            <Button variant="danger" onClick={fetchIncidents}>
              Reintentar
            </Button>
          </div>
        )}

        <IncidentList incidents={filteredIncidents} loading={loading} />
      </main>
    </div>
  );
};

