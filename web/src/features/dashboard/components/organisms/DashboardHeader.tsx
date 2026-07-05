import React from 'react';
import { Typography } from '../../../../shared/components/atoms/Typography';
import { Select } from '../../../../shared/components/atoms/Select';
import { DownloadButton } from '../../../../shared/components/atoms/DownloadButton';

interface DashboardHeaderProps {
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  onDownloadCsv?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  timeFilter,
  onTimeFilterChange,
  onDownloadCsv
}) => {
  return (
    <header className="opscore-page-header">
      <Typography variant="display" className="opscore-page-title">
        Dashboard operacional
      </Typography>
      <div className="opscore-page-actions">
        <Select
          value={timeFilter}
          onChange={(e) => onTimeFilterChange(e.target.value)}
          style={{ minWidth: '130px' }}
          pill
        >
          <option value="current">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="year">Este año</option>
        </Select>
        <span className="opscore-filter-divider">|</span>
        <DownloadButton onDownloadCsv={onDownloadCsv} />
      </div>
    </header>
  );
};
