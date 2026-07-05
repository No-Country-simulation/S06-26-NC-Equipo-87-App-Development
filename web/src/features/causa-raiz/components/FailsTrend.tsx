import React from 'react';
import { Typography } from '../../../shared/components/atoms/Typography';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import type { MechanicalFailTrend } from '../analyticalDashboardApi';

interface FailsTrendProps {
  data: MechanicalFailTrend[];
  timeFilter?: string;
}

export const FailsTrend: React.FC<FailsTrendProps> = ({ data, timeFilter }) => {
  const empty = data.every(d => d.count === 0);

  const getTitle = () => {
    if (timeFilter === 'week') {
      return 'Tendencia de fallas mecánicas — últimos 7 días';
    }
    if (timeFilter === 'year') {
      return 'Tendencia de fallas mecánicas — últimos 12 meses';
    }
    return 'Tendencia de fallas mecánicas — últimas 4 semanas';
  };

  return (
    <div style={{
      backgroundColor: 'var(--colors-surface-card)',
      border: '1.25px solid #dcdad4',
      borderRadius: 'var(--rounded-md)',
      padding: 'var(--spacing-4)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-4)'
    }}>
      <Typography variant="heading" style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--colors-text-primary)' }}>
        {getTitle()}
      </Typography>
      <div style={{ height: '180px', width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1efe8" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--colors-text-tertiary)' }} />
            <YAxis domain={[0, 15]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--colors-text-tertiary)' }} />
            {!empty && <Tooltip contentStyle={{ borderRadius: 'var(--rounded-md)', border: '1px solid #dcdad4', backgroundColor: 'var(--colors-surface-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />}
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--colors-background-dark)"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: 'var(--colors-background-dark)' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        {empty && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: '20px', opacity: 0.3 }}>📉</span>
            <Typography variant="caption" style={{ color: 'var(--colors-text-tertiary)', fontSize: '12px', margin: 0 }}>
              Sin fallas mecánicas registradas
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

