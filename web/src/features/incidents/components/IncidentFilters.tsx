import React from 'react';
import { Select } from '../../../shared/components/atoms/Select';
import { DownloadButton } from '../../../shared/components/atoms/DownloadButton';

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
  onDownloadCsv?: () => void;
}

export const IncidentFilters: React.FC<IncidentFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  areaFilter,
  setAreaFilter,
  timeFilter,
  setTimeFilter,
  availableAreas,
  onDownloadCsv,
}) => {
  return (
    <div className="opscore-filters-container" data-testid="incident-filters">
      <Select
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

      <span className="opscore-filter-divider">|</span>

      <DownloadButton onDownloadCsv={onDownloadCsv} />
    </div>
  );
};
