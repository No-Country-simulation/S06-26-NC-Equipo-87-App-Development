import React, { useEffect } from 'react';
import { MetricCard } from './components/molecules/MetricCard';
import { DashboardHeader } from './components/organisms/DashboardHeader';
import { StatusSummary } from './components/organisms/StatusSummary';
import { ChartsSection } from './components/organisms/ChartsSection';
import { IncidentsTable } from './components/organisms/IncidentsTable';
import { AlertBanner } from '../../shared/components/molecules/AlertBanner';
import { useWebDashboardStore } from './stores/useWebDashboardStore';
import { useWebIncidentStore } from '../incidents/stores/useWebIncidentStore';
import { downloadCsv } from '../../shared/utils/csv';


export const DashboardPage: React.FC = () => {
  const { data, timeFilter, setTimeFilter, loadDashboardData } = useWebDashboardStore();

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, timeFilter]);


  const getPeriodLabel = (): string => {
    if (timeFilter === 'current') {
      return 'vs semana anterior';
    }
    if (timeFilter === 'month') {
      return 'vs mes anterior';
    }
    if (timeFilter === 'year') {
      return 'vs año anterior';
    }
    return 'vs período anterior';
  };

  const relativePercentLabel = (current: number, previous: number): string => {
    const label = getPeriodLabel();
    if (previous === 0 && current === 0) {
      return `0% ${label}`;
    }
    if (previous === 0) {
      return `+100% ${label}`;
    }
    if (current === 0) {
      return `-100% ${label}`;
    }
    const pct = Math.round(((current - previous) / previous) * 100);
    const prefix = pct > 0 ? '+' : '';
    return `${prefix}${pct}% ${label}`;
  };

  const ppDiffLabel = (current: string, previous: string): string => {
    const label = getPeriodLabel();
    const curr = parseInt(current);
    const prev = parseInt(previous);
    if (isNaN(curr) || isNaN(prev)) {
      return `0% ${label}`;
    }
    const diff = curr - prev;
    const prefix = diff > 0 ? '+' : '';
    return `${prefix}${diff}% ${label}`;
  };

  const absoluteDiffLabel = (current: number, previous: number): string => {
    const label = getPeriodLabel();
    const diff = current - previous;
    const prefix = diff > 0 ? '+' : '';
    return `${prefix}${diff} ${label}`;
  };

  const getPeriodSuffix = (): string => {
    if (timeFilter === 'current') {
      return 'esta semana';
    }
    if (timeFilter === 'month') {
      return 'este mes';
    }
    if (timeFilter === 'year') {
      return 'este año';
    }
    return 'este período';
  };

  const mttrTrendDirection = (curr: number, prev: number): 'up' | 'down' =>
    curr <= prev ? 'down' : 'up';

  const handleDownloadCsv = async () => {
    const allIncidents = await useWebIncidentStore.getState().fetchAllIncidentsForExport({
      status: 'All',
      area: 'All',
      severity: 'All',
      time: timeFilter
    });
    if (allIncidents && allIncidents.length > 0) {
      downloadCsv(allIncidents, 'incidentes_dashboard.csv');
    }
  };

  return (
    <>
      <DashboardHeader
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        onDownloadCsv={handleDownloadCsv}
      />
      
      <AlertBanner insights={data?.insights} />

      <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
        <MetricCard 
          title={`Incidentes ${getPeriodSuffix()}`} 
          value={data?.incidentsThisWeek ?? 0} 
          trendText={data ? relativePercentLabel(data.incidentsThisWeek, data.incidentsLastWeek) : `0% ${getPeriodLabel()}`} 
          trendDirection={data && data.incidentsThisWeek < data.incidentsLastWeek ? 'down' : 'up'} 
          trendColor={data && data.incidentsThisWeek <= data.incidentsLastWeek ? 'green' : 'red'} 
        />
        <MetricCard 
          title="Tiempo promedio de respuesta" 
          value={data?.meanTimeToRepair ?? '--:--'} 
          trendText={data ? relativePercentLabel(data.meanTimeToRepairMinutes, data.meanTimeToRepairLastWeekMinutes) : `0% ${getPeriodLabel()}`}
          trendDirection={data ? mttrTrendDirection(data.meanTimeToRepairMinutes, data.meanTimeToRepairLastWeekMinutes) : 'down'} 
          trendColor={data && data.meanTimeToRepairMinutes <= data.meanTimeToRepairLastWeekMinutes ? 'green' : 'red'} 
        />
        <MetricCard 
          title="Tasa de resolución" 
          value={data?.resolutionRate ?? '0%'} 
          trendText={data ? ppDiffLabel(data.resolutionRate, data.resolutionRateLastWeek) : `0% ${getPeriodLabel()}`} 
          trendDirection={data && parseInt(data.resolutionRate) >= parseInt(data.resolutionRateLastWeek) ? 'up' : 'down'} 
          trendColor={data && parseInt(data.resolutionRate) >= parseInt(data.resolutionRateLastWeek) ? 'green' : 'red'} 
        />
        <MetricCard 
          title={`Severidad alta — ${getPeriodSuffix()}`} 
          value={data?.highSeverityThisWeek ?? 0} 
          trendText={data ? absoluteDiffLabel(data.highSeverityThisWeek, data.highSeverityLastWeek) : `0 ${getPeriodLabel()}`} 
          trendDirection={data && data.highSeverityThisWeek < data.highSeverityLastWeek ? 'down' : 'up'} 
          trendColor={data && data.highSeverityThisWeek <= data.highSeverityLastWeek ? 'green' : 'red'} 
        />
      </div>

      {data && <StatusSummary counts={data.statusCounts} />}

      {data && (
        <ChartsSection
          incidentsByDay={data.incidentsByDay}
          incidentsByType={data.incidentsByType}
          incidentsByShift={data.incidentsByShift}
        />
      )}

      {data && <IncidentsTable incidents={data.recentCriticalIncidents} />}
    </>
  );
};

