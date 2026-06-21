import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { AlertCircleIcon } from '../atoms/Icons/AlertCircleIcon';
import { Typography } from '../atoms/Typography';
import designTokens from '../../theme/designTokens.json';

interface ReportButtonProps {
  onPress?: () => void;
}

export const ReportButton: React.FC<ReportButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.button}>
      <View style={styles.content}>
        <AlertCircleIcon color={designTokens.colors['text-on-dark']} width={22} height={22} />
        <Typography variant="heading" style={styles.label}>
          Reportar falla
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: designTokens.colors['background-dark'],
    borderRadius: parseInt(designTokens.rounded.lg),
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    color: designTokens.colors['text-on-dark'],
    fontSize: 17,
    fontWeight: '500',
  },
});
