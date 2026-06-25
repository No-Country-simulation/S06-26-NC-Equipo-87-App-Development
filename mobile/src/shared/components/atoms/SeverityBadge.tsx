import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import designTokens from '../../theme/designTokens.json';

export type SeverityType = 'Alta' | 'Media' | 'Baja' | 'Alto' | 'Medio' | 'Bajo';

interface SeverityBadgeProps {
  severity: SeverityType;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const s = severity.toLowerCase();
  
  let textColor: string;
  let bgColor: string;

  if (s.includes('alt')) {
    textColor = designTokens.colors['status-open-badge-text'];
    bgColor = '#faeaea';
  } else if (s.includes('med')) {
    textColor = designTokens.colors['status-in-progress-badge-text'];
    bgColor = '#faeeda';
  } else {
    textColor = designTokens.colors['status-closed-badge-text'];
    bgColor = '#e1f5ee';
  }

  return (
    <View style={[styles.badge, { borderColor: textColor, backgroundColor: bgColor }]}>
      <Typography variant="caption" color={textColor} style={styles.labelText}>
        {severity}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
  },
  labelText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
