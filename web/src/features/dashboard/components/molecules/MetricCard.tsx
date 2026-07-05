import React from 'react';
import { Typography } from '../../../../shared/components/atoms/Typography';

export interface MetricCardProps {
  title: string;
  value: string | number;
  trendText: string;
  trendDirection: 'up' | 'down';
  trendColor: 'green' | 'red';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trendText,
  trendDirection,
  trendColor,
  icon
}) => {
  const tColor = trendColor === 'green' ? 'var(--colors-status-closed)' : 'var(--colors-status-open)';
  const arrow = trendDirection === 'up' ? '↑' : '↓';

  return (
    <div style={{
      flex: 1,
      minWidth: '220px',
      backgroundColor: 'var(--colors-surface-card)',
      border: '1.25px solid #dcdad4',
      borderRadius: 'var(--rounded-md)',
      padding: 'var(--spacing-4)',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="display" style={{ margin: 0, color: 'var(--colors-text-primary)', fontSize: '32px', fontWeight: 600 }}>
          {value}
        </Typography>
        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <Typography variant="label" style={{ color: 'var(--colors-text-tertiary)', fontSize: '13px' }}>
            {title}
          </Typography>
        </div>
        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <Typography variant="caption" style={{ color: tColor, fontWeight: 500, fontSize: '12px' }}>
            {arrow} {trendText}
          </Typography>
        </div>
      </div>
      {icon && (
        <div style={{
          position: 'absolute',
          top: 'var(--spacing-4)',
          right: 'var(--spacing-4)',
          color: 'var(--colors-text-tertiary)',
          opacity: 0.6
        }}>
          {icon}
        </div>
      )}
    </div>
  );
};
