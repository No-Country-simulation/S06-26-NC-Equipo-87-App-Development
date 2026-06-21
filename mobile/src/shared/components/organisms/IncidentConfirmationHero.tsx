import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckCircleIcon } from '../atoms/Icons/CheckCircleIcon';
import { Typography } from '../atoms/Typography';
import designTokens from '../../theme/designTokens.json';

interface IncidentConfirmationHeroProps {
  incidentId: string;
}

export const IncidentConfirmationHero: React.FC<IncidentConfirmationHeroProps> = ({ incidentId }) => (
  <View style={styles.container}>
    <View style={styles.iconWrapper}>
      <CheckCircleIcon />
    </View>
    <Typography variant="mono" style={styles.incidentId}>
      {incidentId}
    </Typography>
    <Typography
      variant="body"
      color={designTokens.colors['text-secondary']}
      style={styles.subtitle}
    >
      Reporte enviado. El supervisor ya fue notificado.
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  incidentId: {
    fontSize: 20,
    color: designTokens.colors['text-primary'],
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
});
