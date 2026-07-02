import React from 'react';
import { Select } from '../../../shared/components/atoms/Select';
import { Button } from '../../../shared/components/atoms/Button';

interface IncidentFiltersProps {
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  severityFilter: string;
  setSeverityFilter: (val: string) => void;
  areaFilter: string;
  setAreaFilter: (val: string) => void;
  timeFilter: string;
  setTimeFilter: (val: string) => void;
  availableAreas: string[];
  availableSeverities: string[];
}

export const IncidentFilters: React.FC<IncidentFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  areaFilter,
  setAreaFilter,
  timeFilter,
  setTimeFilter,
  availableAreas,
}) => {
  return (
    <div className="opscore-filters-container" data-testid="incident-filters">
      <Select
        variant="dark"
        value={timeFilter}
        onChange={(e) => setTimeFilter(e.target.value)}
        pill
      >
        <option value="week">Esta semana</option>
        <option value="month">Este mes</option>
        <option value="year">Este año</option>
      </Select>

      <Select
        value={areaFilter}
        onChange={(e) => setAreaFilter(e.target.value)}
        pill
      >
        <option value="All">Todas las áreas</option>
        {availableAreas.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </Select>

      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        pill
      >
        <option value="All">Todos los tipos</option>
        <option value="Open">Abiertos</option>
        <option value="Assigned">Asignados</option>
        <option value="In-Progress">En proceso</option>
        <option value="Closed">Cerrados</option>
      </Select>

      <span style={{ color: '#dcdad4', margin: '0 var(--spacing-1)', alignSelf: 'center' }}>|</span>

      <Button
        onClick={() => window.print()}
        variant="primary"
        style={{
          backgroundColor: 'var(--colors-background-dark)',
          color: 'var(--colors-text-on-dark)',
          border: 'none',
          padding: '0 var(--spacing-4)',
          borderRadius: 'var(--rounded-md)',
          height: '38px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Descargar
      </Button>
    </div>
  );
};
