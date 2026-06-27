import React from 'react';

interface IncidentFiltersProps {
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  severityFilter: string;
  setSeverityFilter: (val: string) => void;
  areaFilter: string;
  setAreaFilter: (val: string) => void;
  availableAreas: string[];
  availableSeverities: string[];
}

export const IncidentFilters: React.FC<IncidentFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  areaFilter,
  setAreaFilter,
  availableAreas,
}) => {
  return (
    <div className="opscore-filters-container" data-testid="incident-filters">
      <select className="opscore-pill-select opscore-pill-select-dark" defaultValue="week">
        <option value="week">Esta semana</option>
        <option value="all">Todo el tiempo</option>
      </select>

      <select
        value={areaFilter}
        onChange={(e) => setAreaFilter(e.target.value)}
        className="opscore-pill-select"
      >
        <option value="All">Todas las áreas</option>
        {availableAreas.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="opscore-pill-select"
      >
        <option value="All">Todos los tipos</option>
        <option value="Open">Abiertos</option>
        <option value="In Progress">En proceso</option>
        <option value="Closed">Cerrados</option>
      </select>
    </div>
  );
};

