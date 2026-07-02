import React from 'react';
import { Button } from '../../../shared/components/atoms/Button';
import { Typography } from '../../../shared/components/atoms/Typography';
import { Select } from '../../../shared/components/atoms/Select';

interface CausaRaizHeaderProps {
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  areaFilter: string;
  onAreaFilterChange: (value: string) => void;
  availableAreas: string[];
}

export const CausaRaizHeader: React.FC<CausaRaizHeaderProps> = ({
  timeFilter,
  onTimeFilterChange,
  areaFilter,
  onAreaFilterChange,
  availableAreas
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 'var(--spacing-3)'
    }}>
      <Typography variant="display" style={{ margin: 0, fontSize: '28px', fontWeight: 500 }}>
        Análisis de causa raíz
      </Typography>
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
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
        <span style={{ color: '#dcdad4', margin: '0 var(--spacing-1)' }}>|</span>
        <Button onClick={() => window.print()} variant="primary" style={{ backgroundColor: 'var(--colors-background-dark)', color: 'var(--colors-text-on-dark)', border: 'none', padding: '0 var(--spacing-4)', borderRadius: 'var(--rounded-md)', height: '38px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Descargar
        </Button>
      </div>
    </header>
  );
};
