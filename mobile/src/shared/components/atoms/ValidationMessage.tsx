import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { AlertCircleIcon } from './Icons/AlertCircleIcon';
import designTokens from '../../theme/designTokens.json';

interface ValidationMessageProps {
  message: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ message }) => (
  <View style={styles.container}>
    <AlertCircleIcon
      color={designTokens.colors['status-open']}
      width={14}
      height={14}
    />
    <Typography variant="caption" color={designTokens.colors['status-open']} style={styles.text}>
      {message}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  text: {
    flexShrink: 1,
  },
});
