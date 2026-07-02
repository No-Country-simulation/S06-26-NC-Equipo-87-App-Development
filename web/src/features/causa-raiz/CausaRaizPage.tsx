import React, { useEffect } from 'react';
import { CausaRaizHeader } from './components/CausaRaizHeader';
import { AlertBanner } from '../../shared/components/molecules/AlertBanner';
import { FrequentCauses } from './components/FrequentCauses';
import { IncidentsByArea } from './components/IncidentsByArea';
import { FailsTrend } from './components/FailsTrend';
import { TechnicianPerformanceTable } from './components/TechnicianPerformanceTable';
import { useWebCausaRaizStore } from './stores/useWebCausaRaizStore';

export const CausaRaizPage: React.FC = () => {
  const {
    data,
    timeFilter,
    areaFilter,
    availableAreas,
    setTimeFilter,
    setAreaFilter,
    loadAreas,
    loadAnalyticalData,
  } = useWebCausaRaizStore();

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  useEffect(() => {
    loadAnalyticalData();
  }, [loadAnalyticalData, timeFilter, areaFilter]);

  return (
    <>
      <CausaRaizHeader
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        areaFilter={areaFilter}
        onAreaFilterChange={setAreaFilter}
        availableAreas={availableAreas}
      />
      <AlertBanner insights={data?.insights} showRecommendation />
      
      {data && (
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-4)',
          flexWrap: 'wrap',
          width: '100%'
        }}>
          <FrequentCauses data={data.frequentCauses} style={{ flex: '1.6 1 360px' }} />
          <IncidentsByArea data={data.incidentsByArea} style={{ flex: '1 1 280px' }} />
        </div>
      )}

      {data && <FailsTrend data={data.mechanicalFailsTrend} timeFilter={timeFilter} />}
      {data && <TechnicianPerformanceTable data={data.technicianPerformance} />}
    </>
  );
};


