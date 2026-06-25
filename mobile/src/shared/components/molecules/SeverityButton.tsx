import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from '../atoms/Typography';
import designTokens from '../../theme/designTokens.json';

type SeverityLevel = string;

interface SeverityButtonProps {
  level: SeverityLevel;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const SeverityButton: React.FC<SeverityButtonProps> = ({
  level,
  selected,
  onPress,
  style,
}) => {
  const normLevel = (level || '').trim().toLowerCase();
  const isHigh = normLevel === 'alto' || normLevel === 'high';
  const isMedium = normLevel === 'medio' || normLevel === 'medium';
  const isLow = normLevel === 'bajo' || normLevel === 'low';

  const getContainerStyle = () => {
    if (!selected) return styles.unselectedContainer;
    if (isHigh) return styles.selectedHighContainer;
    if (isMedium) return styles.selectedMediumContainer;
    if (isLow) return styles.selectedLowContainer;
    return styles.selectedDefaultContainer;
  };

  const getTextColor = () => {
    if (!selected) return designTokens.colors['text-secondary'];
    if (isHigh) return designTokens.components['button-red'].textColor;
    if (isMedium) return designTokens.components['button-yellow'].textColor;
    if (isLow) return designTokens.components['button-green'].textColor;
    return designTokens.colors['text-on-dark'];
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, getContainerStyle(), style]}
    >
      <Typography
        variant="label"
        color={getTextColor()}
      >
        {level}
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedContainer: {
    backgroundColor: designTokens.colors['surface-card'],
    borderColor: '#D3D1C7',
  },
  selectedHighContainer: {
    backgroundColor: designTokens.components['button-red'].background,
    borderColor: designTokens.components['button-red'].borderColor,
  },
  selectedMediumContainer: {
    backgroundColor: designTokens.components['button-yellow'].background,
    borderColor: designTokens.components['button-yellow'].borderColor,
  },
  selectedLowContainer: {
    backgroundColor: designTokens.components['button-green'].background,
    borderColor: designTokens.components['button-green'].borderColor,
  },
  selectedDefaultContainer: {
    backgroundColor: designTokens.colors['background-dark'],
    borderColor: designTokens.colors['background-dark'],
  },
});
