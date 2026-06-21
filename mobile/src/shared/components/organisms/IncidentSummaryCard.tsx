import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DetailRow } from '../molecules/DetailRow';
import designTokens from '../../theme/designTokens.json';

interface IncidentSummaryCardProps {
  area: string;
  type: string;
  severity: string;
  severityColor: string;
  time: string;
}

export const IncidentSummaryCard: React.FC<IncidentSummaryCardProps> = ({
  area,
  type,
  severity,
  severityColor,
  time,
}) => (
  <View style={styles.card}>
    <DetailRow label="Área"      value={area} />
    <DetailRow label="Tipo"      value={type} />
    <DetailRow label="Severidad" value={severity} valueColor={severityColor} />
    <DetailRow label="Enviado"   value={time} isLast />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: designTokens.colors['surface-card'],
    borderRadius: parseInt(designTokens.rounded.md),
    borderWidth: 1,
    borderColor: '#E0DDD4',
    overflow: 'hidden',
  },
});
