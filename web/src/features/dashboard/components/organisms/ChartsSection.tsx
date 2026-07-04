import React from 'react';
import { BarChartWidget } from '../../../../components/ui/BarChartWidget';
import { HorizontalBarChartWidget } from '../../../../components/ui/HorizontalBarChartWidget';
import type { DailyIncidentTrend, IncidentTypeDistribution, ShiftDistribution } from '../../dashboardApi';

interface ChartsSectionProps {
  incidentsByDay: DailyIncidentTrend[];
  incidentsByType: IncidentTypeDistribution[];
  incidentsByShift: ShiftDistribution[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  incidentsByDay,
  incidentsByType,
  incidentsByShift,
}) => {
  return (
    <div className="opscore-charts-section" style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
      <BarChartWidget
        title="Incidentes por día"
        data={incidentsByDay}
        xAxisKey="day"
        yAxisKey="value"
        barSize={24}
        style={{ flex: 2, minWidth: '300px', minHeight: '240px' }}
      />
      
      <HorizontalBarChartWidget
        title="Por tipo de incidente"
        data={incidentsByType}
        xAxisKey="percent"
        yAxisKey="label"
        yAxisWidth={100}
        barSize={8}
        valueFormatter={(val: unknown) => `${val}%`}
        style={{ flex: 1, minWidth: '240px', minHeight: '240px' }}
      />

      <HorizontalBarChartWidget
        title="Por turno"
        data={incidentsByShift}
        xAxisKey="count"
        yAxisKey="label"
        yAxisWidth={80}
        barSize={8}
        style={{ flex: 1, minWidth: '240px', minHeight: '240px' }}
      />
    </div>
  );
};

