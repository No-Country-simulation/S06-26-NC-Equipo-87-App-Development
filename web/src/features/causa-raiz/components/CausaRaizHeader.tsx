import React from 'react';
import { Typography } from '../../../shared/components/atoms/Typography';
import { Select } from '../../../shared/components/atoms/Select';
import { DownloadButton } from '../../../shared/components/atoms/DownloadButton';

interface CausaRaizHeaderProps {
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  areaFilter: string;
  onAreaFilterChange: (value: string) => void;
  availableAreas: string[];
  onDownloadCsv?: () => void;
}

export const CausaRaizHeader: React.FC<CausaRaizHeaderProps> = ({
  timeFilter,
  onTimeFilterChange,
  areaFilter,
  onAreaFilterChange,
  availableAreas,
  onDownloadCsv
}) => {
  return (
    <header className="opscore-page-header">
      <Typography variant="display" className="opscore-page-title">
        Análisis de causa raíz
      </Typography>
      <div className="opscore-page-actions">
        <Select
          value={timeFilter}
          onChange={(e) => onTimeFilterChange(e.target.value)}
          style={{ minWidth: '130px' }}
          pill
        >
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="year">Este año</option>
        </Select>
        <Select
          value={areaFilter}
          onChange={(e) => onAreaFilterChange(e.target.value)}
          style={{ minWidth: '145px' }}
          pill
        >
          <option value="all">Todas las áreas</option>
          {availableAreas.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </Select>
        <span className="opscore-filter-divider">|</span>
        <DownloadButton onDownloadCsv={onDownloadCsv} />
      </div>
    </header>
  );
};
