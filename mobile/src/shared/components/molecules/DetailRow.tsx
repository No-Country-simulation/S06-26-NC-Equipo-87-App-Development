import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import designTokens from '../../theme/designTokens.json';

interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
  isLast?: boolean;
  valueVariant?: 'display' | 'heading' | 'body' | 'label' | 'caption' | 'micro' | 'mono';
}

export const DetailRow: React.FC<DetailRowProps> = ({ label, value, valueColor, isLast, valueVariant = 'label' }) => (
  <View>
    <View style={styles.row}>
      <Typography variant="body" color={designTokens.colors['text-secondary']} style={styles.label}>
        {label}
      </Typography>
      <Typography
        variant={valueVariant}
        color={valueColor ?? designTokens.colors['text-primary']}
        style={styles.value}
      >
        {value}
      </Typography>
    </View>
    {!isLast && <View style={styles.divider} />}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EDE5',
    marginHorizontal: 16,
  },
});
