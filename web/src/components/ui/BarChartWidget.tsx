import React from 'react';
import { Typography } from '../../shared/components/atoms/Typography';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface BarChartWidgetProps<T> {
  title: string;
  data: T[];
  xAxisKey: string;
  yAxisKey: string;
  yAxisDomain?: [number, number];
  barSize?: number;
  style?: React.CSSProperties;
}

const hasActivity = <T,>(data: T[], yAxisKey: string) =>
  data.some(d => (d as unknown as Record<string, number>)[yAxisKey] > 0);

export const BarChartWidget = <T,>({
  title,
  data,
  xAxisKey,
  yAxisKey,
  yAxisDomain,
  barSize = 24,
  style
}: BarChartWidgetProps<T>) => {
  const empty = data.length === 0 || !hasActivity(data, yAxisKey);

  return (
    <div style={{
      backgroundColor: 'var(--colors-surface-card)',
      border: '1.25px solid #dcdad4',
      borderRadius: 'var(--rounded-md)',
      padding: 'var(--spacing-4)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-4)',
      ...style
    }}>
      <Typography variant="heading" style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--colors-text-primary)' }}>
        {title}
      </Typography>
      <div style={{ height: '180px', width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1efe8" />
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--colors-text-tertiary)' }} />
            <YAxis domain={yAxisDomain} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--colors-text-tertiary)' }} />
            {!empty && <Tooltip cursor={{ fill: 'rgba(27, 30, 34, 0.03)' }} contentStyle={{ borderRadius: 'var(--rounded-md)', border: '1px solid #dcdad4', backgroundColor: 'var(--colors-surface-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />}
            <Bar dataKey={yAxisKey} fill="var(--colors-background-dark)" radius={[4, 4, 0, 0]} barSize={barSize} />
          </BarChart>
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
            <span style={{ fontSize: '20px', opacity: 0.3 }}>📊</span>
            <Typography variant="caption" style={{ color: 'var(--colors-text-tertiary)', fontSize: '12px', margin: 0 }}>
              Sin actividad registrada
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

