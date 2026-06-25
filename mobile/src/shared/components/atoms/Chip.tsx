import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from './Typography';
import designTokens from '../../theme/designTokens.json';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({ label, selected, onPress, style }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        selected ? styles.selectedContainer : styles.unselectedContainer,
        style,
      ]}
    >
      <Typography
        variant="caption"
        color={selected ? designTokens.colors['text-on-dark'] : designTokens.colors['text-secondary']}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: parseInt(designTokens.spacing['4']),
    paddingVertical: parseInt(designTokens.spacing['2']),
    borderRadius: parseInt(designTokens.rounded.full),
    borderWidth: 1.25,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedContainer: {
    backgroundColor: designTokens.colors['background-dark'],
    borderColor: designTokens.colors['background-dark'],
  },
  unselectedContainer: {
    backgroundColor: 'transparent',
    borderColor: '#D3D1C7', // From Figma
  },
});
