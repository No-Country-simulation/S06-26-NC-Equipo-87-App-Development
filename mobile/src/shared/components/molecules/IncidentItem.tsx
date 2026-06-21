import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { StatusBadge, StatusType } from '../atoms/StatusBadge';
import designTokens from '../../theme/designTokens.json';

interface IncidentItemProps {
  id: string;
  title: string;
  status: StatusType;
  statusLabel: string;
}

export const IncidentItem: React.FC<IncidentItemProps> = ({ id, title, status, statusLabel }) => {
  return (
    <Card style={styles.card} padding={15}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Typography variant="mono" color={designTokens.colors['text-tertiary']} style={styles.id}>
            {id}
          </Typography>
          <Typography variant="label" color={designTokens.colors['text-primary']}>
            {title}
          </Typography>
        </View>
        <StatusBadge status={status} label={statusLabel} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    justifyContent: 'center',
  },
  id: {
    fontSize: 12,
    marginBottom: 0,
  },
});
