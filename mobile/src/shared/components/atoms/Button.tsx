import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from './Typography';
import designTokens from '../../theme/designTokens.json';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  testID,
}) => {
  const isPrimary = variant === 'primary';
  
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      style={[
        styles.container,
        isPrimary ? styles.primaryContainer : styles.secondaryContainer,
        disabled && styles.disabledContainer,
        style,
      ]}
    >
      <Typography
        variant="label"
        color={disabled ? '#9A9890' : (isPrimary ? designTokens.colors['text-on-dark'] : designTokens.colors['text-primary'])}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryContainer: {
    backgroundColor: designTokens.colors['background-dark'],
  },
  secondaryContainer: {
    backgroundColor: designTokens.colors['background-primary'],
  },
  disabledContainer: {
    backgroundColor: '#E8E6DF',
    borderColor: '#D3D1C7',
    borderWidth: 1,
  },
});
