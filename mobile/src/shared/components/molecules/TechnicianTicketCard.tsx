import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../atoms/Typography';
import { StatusBadge } from '../atoms/StatusBadge';
import { Card } from '../atoms/Card';
import designTokens from '../../theme/designTokens.json';

export interface TechnicianTicket {
  id: string;
  incidentCode: string;
  areaName: string;
  elapsedTime: string;
  categoryName: string;
  description?: string;
  operatorNumber: string;
  severity: string;
  status: 'open' | 'in-progress' | 'closed' | 'assigned';
  statusLabel: string;
  serviceStarted: boolean;
}

interface TechnicianTicketCardProps {
  ticket: TechnicianTicket;
  onStartAttention?: () => void;
  onViewDetail?: () => void;
}

const getSeverityColor = (severity: string): string => {
  const s = severity.toLowerCase();
  if (s.includes('alt')) {
    return designTokens.colors['status-open'];
  }
  if (s.includes('med')) {
    return designTokens.colors['status-in-progress'];
  }
  return designTokens.colors['status-closed'];
};

export const TechnicianTicketCard: React.FC<TechnicianTicketCardProps> = ({
  ticket,
  onStartAttention,
  onViewDetail,
}) => {
  const { serviceStarted } = ticket;

  return (
    <Card padding={parseInt(designTokens.spacing['4'])}>
      {/* Top row: incident code · area · time + status badge */}
      <View style={styles.topRow}>
        <View style={styles.topRowLeft}>
          <Typography
            variant="mono"
            color={designTokens.colors['text-tertiary']}
            style={styles.incidentCode}
          >
            {ticket.incidentCode}
          </Typography>
          <Typography variant="caption" color={designTokens.colors['text-tertiary']}>
            {' · '}
          </Typography>
          <Typography variant="caption" color={designTokens.colors['text-tertiary']}>
            {ticket.areaName}
          </Typography>
          <Typography variant="caption" color={designTokens.colors['text-tertiary']}>
            {' · '}
          </Typography>
          <Typography variant="caption" color={designTokens.colors['text-tertiary']}>
            {ticket.elapsedTime}
          </Typography>
        </View>
        <StatusBadge status={ticket.status} label={ticket.statusLabel} />
      </View>

      {/* Category name */}
      <Typography
        variant="heading"
        color={designTokens.colors['text-primary']}
        style={styles.categoryName}
      >
        {ticket.categoryName}
      </Typography>

      {/* Conditional description (only if service has not started and description is provided) */}
      {!serviceStarted && ticket.description && (
        <Typography
          variant="body"
          color={designTokens.colors['text-secondary']}
          numberOfLines={2}
          style={styles.description}
        >
          {ticket.description}
        </Typography>
      )}

      {/* Bottom row layout based on serviceStarted state */}
      {!serviceStarted && ticket.status !== 'closed' ? (
        <View>
          {/* Metadata line before full width button */}
          <View style={styles.metaRow}>
            <Typography variant="caption" color={designTokens.colors['text-tertiary']}>
              Op. {ticket.operatorNumber}
            </Typography>
            <View style={styles.severityContainer}>
              <View
                style={[
                  styles.severityDot,
                  { backgroundColor: getSeverityColor(ticket.severity) },
                ]}
              />
              <Typography variant="caption" color={designTokens.colors['text-tertiary']}>
                {ticket.severity}
              </Typography>
            </View>
          </View>

          {/* Full-width Iniciar atención button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onStartAttention}
            style={styles.fullWidthButton}
          >
            <Typography variant="label" color={designTokens.colors['text-primary']}>
              Iniciar atención
            </Typography>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bottomRow}>
          {/* Combined metadata & action button side-by-side */}
          <View style={styles.bottomRowLeft}>
            <Typography variant="caption" color={designTokens.colors['text-tertiary']}>
              Op. {ticket.operatorNumber}
            </Typography>
            <View style={styles.severityContainer}>
              <View
                style={[
                  styles.severityDot,
                  { backgroundColor: getSeverityColor(ticket.severity) },
                ]}
              />
              <Typography variant="caption" color={designTokens.colors['text-tertiary']}>
                {ticket.severity}
              </Typography>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onViewDetail}
            style={styles.compactButton}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Typography variant="label" color={designTokens.colors['text-primary']}>
              Ver detalle
            </Typography>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: parseInt(designTokens.spacing['2']),
  },
  topRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  incidentCode: {
    fontSize: 12,
  },
  categoryName: {
    marginBottom: parseInt(designTokens.spacing['2']),
  },
  description: {
    marginBottom: parseInt(designTokens.spacing['3']),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: parseInt(designTokens.spacing['4']),
    marginBottom: parseInt(designTokens.spacing['3']),
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: parseInt(designTokens.spacing['4']),
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: parseInt(designTokens.spacing['1']),
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fullWidthButton: {
    height: 48,
    width: '100%',
    borderRadius: parseInt(designTokens.rounded.md),
    borderWidth: 1,
    borderColor: '#D3D1C7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  compactButton: {
    height: 36,
    minWidth: 90,
    borderRadius: parseInt(designTokens.rounded.md),
    borderWidth: 1,
    borderColor: '#D3D1C7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: parseInt(designTokens.spacing['3']),
  },
});
