import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../atoms/Typography';
import { StatusBadge } from '../atoms/StatusBadge';
import { Card } from '../atoms/Card';
import { PendingSyncTag } from '../atoms/PendingSyncTag';
import designTokens from '../../theme/designTokens.json';

export interface SupervisorTicket {
  id: string;
  incidentCode: string;
  areaName: string;
  elapsedTime: string;
  categoryName: string;
  description: string;
  operatorNumber: string;
  severity: 'Alta' | 'Media' | 'Baja';
  status: 'open' | 'in-progress' | 'closed' | 'assigned';
  statusLabel: string;
  pendingSync?: boolean;
}

interface SupervisorTicketCardProps {
  ticket: SupervisorTicket;
  onPress?: () => void;
}

const severityDotColors: Record<string, string> = {
  Alta: designTokens.colors['status-open'],
  Media: designTokens.colors['status-in-progress'],
  Baja: designTokens.colors['status-closed'],
};

export const SupervisorTicketCard: React.FC<SupervisorTicketCardProps> = ({ ticket, onPress }) => {
  const actionLabel = ticket.status === 'open' ? 'Asignar' : 'Ver';

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card padding={parseInt(designTokens.spacing['4'])}>
        {/* Top row: incident code · area · time + status badge */}
        <View style={styles.topRow}>
          <View style={styles.topRowLeft}>
            <Typography variant="mono" color={designTokens.colors['text-tertiary']} style={styles.incidentCode}>
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
          <View style={styles.topRowRight}>
            {ticket.pendingSync && <PendingSyncTag />}
            <StatusBadge status={ticket.status} label={ticket.statusLabel} />
          </View>
        </View>

        {/* Category name */}
        <Typography
          variant="heading"
          color={designTokens.colors['text-primary']}
          style={styles.categoryName}
        >
          {ticket.categoryName}
        </Typography>

        {/* Description */}
        <Typography
          variant="body"
          color={designTokens.colors['text-secondary']}
          numberOfLines={2}
          style={styles.description}
        >
          {ticket.description}
        </Typography>

        {/* Bottom row: operator + severity + action button */}
        <View style={styles.bottomRow}>
          <View style={styles.bottomRowLeft}>
            <Typography variant="caption" color={designTokens.colors['text-tertiary']}>
              Op. {ticket.operatorNumber}
            </Typography>
            <View style={styles.severityContainer}>
              <View
                style={[
                  styles.severityDot,
                  { backgroundColor: severityDotColors[ticket.severity] },
                ]}
              />
              <Typography variant="caption" color={designTokens.colors['text-tertiary']}>
                {ticket.severity}
              </Typography>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.actionButton}
            onPress={onPress}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Typography variant="label" color={designTokens.colors['text-primary']}>
              {actionLabel}
            </Typography>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
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
  topRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: parseInt(designTokens.spacing['2']),
    marginLeft: parseInt(designTokens.spacing['2']),
  },
  incidentCode: {
    fontSize: 12,
  },
  categoryName: {
    marginBottom: parseInt(designTokens.spacing['1']),
  },
  description: {
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
  actionButton: {
    height: 36,
    minWidth: 80,
    borderRadius: parseInt(designTokens.rounded.md),
    borderWidth: 1,
    borderColor: '#D3D1C7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: parseInt(designTokens.spacing['4']),
  },
});
