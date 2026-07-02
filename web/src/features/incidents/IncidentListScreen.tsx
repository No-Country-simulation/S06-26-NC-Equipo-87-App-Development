import React, { useEffect } from 'react';
import { Typography } from '../../shared/components/atoms/Typography';
import { Button } from '../../shared/components/atoms/Button';
import { IncidentFilters } from './components/IncidentFilters';
import { IncidentList } from './components/IncidentList';
import { useWebIncidentStore } from './stores/useWebIncidentStore';

interface IncidentListScreenProps {
  user: Record<string, unknown> | null;
  onLogout: () => void;
}

export const IncidentListScreen: React.FC<IncidentListScreenProps> = () => {
  const {
    incidents,
    loading,
    error,
    statusFilter,
    severityFilter,
    areaFilter,
    timeFilter,
    currentPage,
    totalItems,
    availableAreas,
    openCount,
    assignedCount,
    inProgressCount,
    closedCount,
    setStatusFilter,
    setSeverityFilter,
    setAreaFilter,
    setTimeFilter,
    setCurrentPage,
    fetchAreas,
    fetchIncidents,
  } = useWebIncidentStore();

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents, currentPage, statusFilter, areaFilter, severityFilter, timeFilter]);

  return (
    <>
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
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            availableAreas={availableAreas}
            availableSeverities={[]}
          />
        </div>
        <div className="opscore-metrics-summary">
          <span className="opscore-metric-total">{openCount + assignedCount + inProgressCount + closedCount} incidentes totales</span>
          <span style={{ color: '#dcdad4' }}>|</span>
          <span className="opscore-metric-dot opscore-metric-open">
            <span style={{ color: 'var(--colors-status-open)' }}>●</span> {openCount} abiertos
          </span>
          <span style={{ color: '#dcdad4' }}>|</span>
          <span className="opscore-metric-dot opscore-metric-assigned">
            <span style={{ color: 'var(--colors-status-assigned)' }}>●</span> {assignedCount} asignados
          </span>
          <span style={{ color: '#dcdad4' }}>|</span>
          <span className="opscore-metric-dot opscore-metric-in-progress">
            <span style={{ color: 'var(--colors-status-in-progress)' }}>●</span> {inProgressCount} en proceso
          </span>
          <span style={{ color: '#dcdad4' }}>|</span>
          <span className="opscore-metric-dot opscore-metric-closed">
            <span style={{ color: 'var(--colors-status-closed)' }}>●</span> {closedCount} cerrados
          </span>
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

      <IncidentList
        incidents={incidents}
        loading={loading}
        currentPage={currentPage}
        totalCount={totalItems}
        pageSize={10}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

