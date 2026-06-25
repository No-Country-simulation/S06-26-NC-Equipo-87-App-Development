import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import designTokens from '../../theme/designTokens.json';

export type StatusType = 'open' | 'in-progress' | 'closed' | 'assigned';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const badgeStyle = styles[status];
  const dotStyle = dotStyles[status];
  const labelColor = labelColors[status];

  return (
    <View style={[styles.badge, badgeStyle]}>
      <View style={[styles.dot, dotStyle]} />
      <Typography variant="caption" color={labelColor} style={styles.label}>
        {label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 100,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
  },
  open: {
    backgroundColor: '#faeaea',
  },
  'in-progress': {
    backgroundColor: '#faeeda',
  },
  closed: {
    backgroundColor: '#e1f5ee',
  },
  assigned: {
    backgroundColor: '#E6F1FB',
  },
});

const dotStyles = StyleSheet.create({
  open: {
    backgroundColor: designTokens.colors['status-open'],
  },
  'in-progress': {
    backgroundColor: designTokens.colors['status-in-progress'],
  },
  closed: {
    backgroundColor: designTokens.colors['status-closed'],
  },
  assigned: {
    backgroundColor: designTokens.colors['status-assigned'],
  },
});

const labelColors = {
  open: designTokens.colors['status-open-badge-text'],
  'in-progress': designTokens.colors['status-in-progress-badge-text'],
  closed: designTokens.colors['status-closed-badge-text'],
  assigned: designTokens.colors['status-assigned-badge-text'],
};
