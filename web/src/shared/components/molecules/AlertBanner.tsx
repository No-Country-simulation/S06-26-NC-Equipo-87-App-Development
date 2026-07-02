import React from 'react';
import { Typography } from '../atoms/Typography';
import { WarningIcon } from '../atoms/WarningIcon';

interface AlertBannerProps {
  insights?: string[];
  showRecommendation?: boolean;
  style?: React.CSSProperties;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  insights,
  showRecommendation = false,
  style,
}) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-2)',
        width: '100%',
        ...style,
      }}
    >
      {insights.map((insight, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: '#FDF5E6',
            border: '1px solid #A06A38',
            borderRadius: 'var(--rounded-md)',
            padding: 'var(--spacing-3) var(--spacing-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            color: '#6E4720',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          <WarningIcon />
          <Typography
            variant="body"
            style={{ margin: 0, color: 'inherit', fontWeight: 500 }}
          >
            {insight}
            {showRecommendation && insight.includes('concentra') && (
              <span style={{ fontWeight: 400, marginLeft: '4px' }}>
                Se recomienda revisar el plan de mantenimiento preventivo.
              </span>
            )}
          </Typography>
        </div>
      ))}
    </div>
  );
};
