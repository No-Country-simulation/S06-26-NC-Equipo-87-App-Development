import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from '../atoms/Typography';
import designTokens from '../../theme/designTokens.json';

interface IncidentTypeCardProps {
  label: string;
  icon: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const IncidentTypeCard: React.FC<IncidentTypeCardProps> = ({
  label,
  icon,
  selected,
  onPress,
  style,
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={[
      styles.container,
      selected ? styles.selectedContainer : styles.unselectedContainer,
      style,
    ]}
  >
    {React.cloneElement(icon as React.ReactElement<{ color: string }>, {
      color: selected ? designTokens.colors['text-on-dark'] : designTokens.colors['text-secondary'],
    })}
    <Typography
      variant="caption"
      style={styles.label}
      color={selected ? designTokens.colors['text-on-dark'] : designTokens.colors['text-secondary']}
    >
      {label}
    </Typography>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 80,
    borderRadius: 8,
    borderWidth: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  selectedContainer: {
    backgroundColor: designTokens.colors['background-dark'],
    borderColor: designTokens.colors['background-dark'],
  },
  unselectedContainer: {
    backgroundColor: designTokens.colors['surface-card'],
    borderColor: '#D3D1C7',
  },
  label: {
    textAlign: 'center',
  },
});
