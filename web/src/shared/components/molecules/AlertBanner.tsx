import React, { useState } from 'react';
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
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem('dismissed_insights');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  const handleDismiss = (insight: string) => {
    setDismissed((prev) => {
      const updated = [...prev, insight];
      try {
        localStorage.setItem('dismissed_insights', JSON.stringify(updated));
      } catch (error) {
        console.error(error);
      }
      return updated;
    });
  };

  if (!insights || insights.length === 0) {
    return null;
  }

  const visibleInsights = insights.filter((insight) => !dismissed.includes(insight));

  if (visibleInsights.length === 0) {
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
      {insights.map((insight, idx) => {
        if (dismissed.includes(insight)) {
          return null;
        }
        return (
          <div
            key={idx}
            style={{
              backgroundColor: '#FDF5E6',
              borderLeft: '2px solid #E59D42',
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
            <div style={{ flex: 1 }}>
              <Typography
                variant="body"
                style={{ margin: 0, color: 'inherit', fontWeight: 400 }}
              >
                {insight}
                {showRecommendation && insight.includes('concentra') && (
                  <span style={{ fontWeight: 400, marginLeft: '4px' }}>
                    Se recomienda revisar el plan de mantenimiento preventivo.
                  </span>
                )}
              </Typography>
            </div>
            <button
              onClick={() => handleDismiss(insight)}
              aria-label="Dismiss alert"
              style={{
                marginLeft: 'var(--spacing-2)',
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '20px',
                padding: 'var(--spacing-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                opacity: 0.6,
                transition: 'opacity 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '0.6')}
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
};


