import React from 'react';

interface StatusDotProps {
  color: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ color }) => {
  return (
    <span style={{ color, marginRight: 'var(--spacing-2)' }}>●</span>
  );
};
