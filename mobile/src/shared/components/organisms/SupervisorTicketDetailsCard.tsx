import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { StatusBadge, StatusType } from '../atoms/StatusBadge';
import { SeverityBadge, SeverityType } from '../atoms/SeverityBadge';
import designTokens from '../../theme/designTokens.json';

interface SupervisorTicketDetailsCardProps {
  status: string;
  statusLabel: string;
  severity: string;
  categoryName: string;
  areaName: string;
  operatorNumber: string;
  elapsedTime: string;
}

const formatElapsedTime = (timeStr: string) => {
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  
  const minMatch = timeStr.match(/^(\d+)\s*min$/i);
  if (minMatch) {
    const totalMinutes = parseInt(minMatch[1], 10);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  
  const hourMatch = timeStr.match(/^(\d+)\s*h$/i);
  if (hourMatch) {
    const hrs = parseInt(hourMatch[1], 10);
    return `${hrs.toString().padStart(2, '0')}:00`;
  }
  
  return timeStr;
};

export const SupervisorTicketDetailsCard: React.FC<SupervisorTicketDetailsCardProps> = ({
  status,
  statusLabel,
  severity,
  categoryName,
  areaName,
  operatorNumber,
  elapsedTime,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.badgeRow}>
        <StatusBadge status={status as StatusType} label={statusLabel} />
        <SeverityBadge severity={severity as SeverityType} />
      </View>

      <Typography variant="heading" color={designTokens.colors['text-primary']} style={styles.ticketTitle}>
        {categoryName}
      </Typography>

      <View style={styles.divider} />

      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <Typography variant="body" color={designTokens.colors['text-secondary']}>
            Área
          </Typography>
          <Typography variant="label" color={designTokens.colors['text-primary']} style={styles.gridValue}>
            {areaName}
          </Typography>
        </View>

        <View style={styles.gridRow}>
          <Typography variant="body" color={designTokens.colors['text-secondary']}>
            Reportado por
          </Typography>
          <Typography variant="label" color={designTokens.colors['text-primary']} style={styles.gridValue}>
            Operador {operatorNumber}
          </Typography>
        </View>

        <View style={styles.gridRow}>
          <Typography variant="body" color={designTokens.colors['text-secondary']}>
            Tiempo de respuesta
          </Typography>
          <Typography variant="mono" color={designTokens.colors['text-primary']} style={styles.gridValueMono}>
            {formatElapsedTime(elapsedTime)}
          </Typography>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: parseInt(designTokens.spacing['4']),
    marginBottom: parseInt(designTokens.spacing['4']),
    borderRadius: parseInt(designTokens.rounded.lg),
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0DDD4',
    marginBottom: 12,
  },
  gridContainer: {
    marginTop: 4,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  gridValue: {
    fontSize: 14,
  },
  gridValueMono: {
    fontSize: 14,
  },
});
