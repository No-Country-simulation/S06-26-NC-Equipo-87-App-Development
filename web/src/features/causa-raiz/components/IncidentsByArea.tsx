import React from 'react';
import { BarChartWidget } from '../../../components/ui/BarChartWidget';
import type { AreaIncidentDistribution } from '../analyticalDashboardApi';

interface IncidentsByAreaProps {
  data: AreaIncidentDistribution[];
  style?: React.CSSProperties;
}

export const IncidentsByArea: React.FC<IncidentsByAreaProps> = ({ data, style }) => {
  return (
    <BarChartWidget
      title="Incidentes por área"
      data={data}
      xAxisKey="name"
      yAxisKey="count"
      yAxisDomain={[0, 30]}
      barSize={36}
      style={style}
    />
  );
};

