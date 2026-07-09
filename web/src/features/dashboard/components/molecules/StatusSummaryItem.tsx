import React from 'react';
import { StatusDot } from '../atoms/StatusDot';
import { Typography } from '../../../../shared/components/atoms/Typography';

interface StatusSummaryItemProps {
  dotColor: string;
  textColor: string;
  count: number;
  label: string;
}

export const StatusSummaryItem: React.FC<StatusSummaryItemProps> = ({
  dotColor,
  textColor,
  count,
  label
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
      <StatusDot color={dotColor} />
      <Typography variant="label" style={{ color: textColor, fontWeight: 400 }}>
        {count} {label}
      </Typography>
    </div>
  );
};
