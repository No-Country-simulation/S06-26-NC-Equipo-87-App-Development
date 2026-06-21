import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import { IncidentItem } from '../molecules/IncidentItem';
import { StatusType } from '../atoms/StatusBadge';
import designTokens from '../../theme/designTokens.json';

interface Incident {
  id: string;
  title: string;
  status: StatusType;
  statusLabel: string;
}

interface IncidentListProps {
  title: string;
  incidents: Incident[];
  footerNote?: string;
}

export const IncidentList: React.FC<IncidentListProps> = ({ title, incidents, footerNote }) => {
  return (
    <View style={styles.container}>
      <Typography variant="micro" color={designTokens.colors['text-tertiary']} style={styles.title}>
        {title}
      </Typography>
      <View style={styles.items}>
        {incidents.map((incident) => (
          <IncidentItem
            key={incident.id}
            id={incident.id}
            title={incident.title}
            status={incident.status}
            statusLabel={incident.statusLabel}
          />
        ))}
      </View>
      {footerNote && (
        <Typography variant="caption" color={designTokens.colors['text-tertiary']} style={styles.footerNote}>
          {footerNote}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    marginBottom: parseInt(designTokens.spacing['2']),
    letterSpacing: 0.6,
  },
  items: {
    gap: parseInt(designTokens.spacing['2']),
  },
  footerNote: {
    marginTop: parseInt(designTokens.spacing['3']),
    textAlign: 'center',
    opacity: 0.75,
  },
});
