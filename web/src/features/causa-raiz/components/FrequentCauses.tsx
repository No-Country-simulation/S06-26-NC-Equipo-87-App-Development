import React from 'react';
import { HorizontalBarChartWidget } from '../../../components/ui/HorizontalBarChartWidget';
import type { FrequentCause } from '../analyticalDashboardApi';

interface FrequentCausesProps {
  data: FrequentCause[];
  style?: React.CSSProperties;
}

export const FrequentCauses: React.FC<FrequentCausesProps> = ({ data, style }) => {
  return (
    <HorizontalBarChartWidget
      title="Causas raíz más frecuentes"
      data={data}
      xAxisKey="count"
      yAxisKey="label"
      yAxisWidth={200}
      barSize={10}
      style={style}
      backgroundFill="#faf9f6"
      labelFontWeight={600}
      yAxisFontColor="var(--colors-text-secondary)"
      yAxisFontWeight={400}
    />
  );
};

