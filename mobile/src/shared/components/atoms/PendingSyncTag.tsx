import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import designTokens from '../../theme/designTokens.json';

export const PendingSyncTag: React.FC = () => {
  return (
    <View style={styles.pill}>
      <Typography variant="caption" color="#633806" style={styles.label}>
        Pendiente
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    backgroundColor: '#FAEEDA',
    borderWidth: 1,
    borderColor: '#EF9F27',
    borderRadius: 100,
    paddingHorizontal: parseInt(designTokens.spacing['2']),
    paddingVertical: 2,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
  },
});
