import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import designTokens from '../../theme/designTokens.json';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({ children, style, padding, ...props }) => {
  return (
    <View 
      style={[
        styles.card, 
        padding !== undefined ? { padding } : null,
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: designTokens.colors['surface-card'],
    borderWidth: 1,
    borderColor: '#d3d1c7',
    borderRadius: parseInt(designTokens.rounded.md),
    width: '100%',
  },
});
