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

const ticketIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.33337 5.99992C1.86381 5.99992 2.37251 6.21063 2.74759 6.5857C3.12266 6.96078 3.33337 7.46949 3.33337 7.99992C3.33337 8.53035 3.12266 9.03906 2.74759 9.41413C2.37251 9.78921 1.86381 9.99992 1.33337 9.99992V11.3333C1.33337 11.6869 1.47385 12.026 1.7239 12.2761C1.97395 12.5261 2.31309 12.6666 2.66671 12.6666H13.3334C13.687 12.6666 14.0261 12.5261 14.2762 12.2761C14.5262 12.026 14.6667 11.6869 14.6667 11.3333V9.99992C14.1363 9.99992 13.6276 9.78921 13.2525 9.41413C12.8774 9.03906 12.6667 8.53035 12.6667 7.99992C12.6667 7.46949 12.8774 6.96078 13.2525 6.5857C13.6276 6.21063 14.1363 5.99992 14.6667 5.99992V4.66659C14.6667 4.31296 14.5262 3.97382 14.2762 3.72378C14.0261 3.47373 13.687 3.33325 13.3334 3.33325H2.66671C2.31309 3.33325 1.97395 3.47373 1.7239 3.72378C1.47385 3.97382 1.33337 4.31296 1.33337 4.66659V5.99992Z" stroke="#B4B2A9" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.66675 3.33325V4.66659" stroke="#B4B2A9" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.66675 11.3333V12.6666" stroke="#B4B2A9" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.66675 7.33325V8.66659" stroke="#B4B2A9" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const clockIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const checkIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_336_4339)">
      <path d="M7.99992 14.6666C11.6818 14.6666 14.6666 11.6818 14.6666 7.99992C14.6666 4.31802 11.6818 1.33325 7.99992 1.33325C4.31802 1.33325 1.33325 4.31802 1.33325 7.99992C1.33325 11.6818 4.31802 14.6666 7.99992 14.6666Z" stroke="#B4B2A9" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 8.00008L7.33333 9.33341L10 6.66675" stroke="#B4B2A9" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_336_4339">
        <rect width="16" height="16" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const alertIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

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
          icon={ticketIcon}
        />
        <MetricCard 
          title="Tiempo promedio de respuesta" 
          value={data?.meanTimeToRepair ?? '--:--'} 
          trendText={data ? relativePercentLabel(data.meanTimeToRepairMinutes, data.meanTimeToRepairLastWeekMinutes) : `0% ${getPeriodLabel()}`}
          trendDirection={data ? mttrTrendDirection(data.meanTimeToRepairMinutes, data.meanTimeToRepairLastWeekMinutes) : 'down'} 
          trendColor={data && data.meanTimeToRepairMinutes <= data.meanTimeToRepairLastWeekMinutes ? 'green' : 'red'} 
          icon={clockIcon}
        />
        <MetricCard 
          title="Tasa de resolución" 
          value={data?.resolutionRate ?? '0%'} 
          trendText={data ? ppDiffLabel(data.resolutionRate, data.resolutionRateLastWeek) : `0% ${getPeriodLabel()}`} 
          trendDirection={data && parseInt(data.resolutionRate) >= parseInt(data.resolutionRateLastWeek) ? 'up' : 'down'} 
          trendColor={data && parseInt(data.resolutionRate) >= parseInt(data.resolutionRateLastWeek) ? 'green' : 'red'} 
          icon={checkIcon}
        />
        <MetricCard 
          title={`Severidad alta — ${getPeriodSuffix()}`} 
          value={data?.highSeverityThisWeek ?? 0} 
          trendText={data ? absoluteDiffLabel(data.highSeverityThisWeek, data.highSeverityLastWeek) : `0 ${getPeriodLabel()}`} 
          trendDirection={data && data.highSeverityThisWeek < data.highSeverityLastWeek ? 'down' : 'up'} 
          trendColor={data && data.highSeverityThisWeek <= data.highSeverityLastWeek ? 'green' : 'red'} 
          icon={alertIcon}
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

