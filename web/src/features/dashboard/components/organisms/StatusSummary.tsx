import React from 'react';
import { StatusSummaryItem } from '../molecules/StatusSummaryItem';
import type { StatusSummaryCounts } from '../../dashboardApi';

interface StatusSummaryProps {
  counts: StatusSummaryCounts;
}

export const StatusSummary: React.FC<StatusSummaryProps> = ({ counts }) => {
  const dividerStyle: React.CSSProperties = {
    color: '#dcdad4',
    margin: '0 var(--spacing-3)',
    fontWeight: 300
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      backgroundColor: 'var(--colors-surface-card)',
      border: '1.25px solid #dcdad4',
      borderRadius: 'var(--rounded-md)',
      padding: 'var(--spacing-3) var(--spacing-4)',
      boxSizing: 'border-box',
      gap: 'var(--spacing-2)'
    }}>
      <StatusSummaryItem
        dotColor="var(--colors-status-open)"
        textColor="var(--colors-status-open-badge-text)"
        count={counts.open}
        label="abiertos"
      />
      <span style={dividerStyle}>|</span>
      <StatusSummaryItem
        dotColor="#3b82f6"
        textColor="#4b6b94"
        count={counts.assigned}
        label="asignados"
      />
      <span style={dividerStyle}>|</span>
      <StatusSummaryItem
        dotColor="var(--colors-status-in-progress)"
        textColor="var(--colors-status-in-progress-badge-text)"
        count={counts.inProgress}
        label="en proceso"
      />
      <span style={dividerStyle}>|</span>
      <StatusSummaryItem
        dotColor="var(--colors-status-closed)"
        textColor="var(--colors-status-closed-badge-text)"
        count={counts.closed}
        label="cerrados"
      />
    </div>
  );
};

