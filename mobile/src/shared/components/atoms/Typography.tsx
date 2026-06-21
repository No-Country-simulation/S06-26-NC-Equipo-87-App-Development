import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle, Platform } from 'react-native';
import designTokens from '../../theme/designTokens.json';

type TypographyVariant = 'display' | 'heading' | 'body' | 'label' | 'caption' | 'micro' | 'mono';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  children,
  style,
  ...props
}) => {
  const variantStyle = styles[variant];
  const textColor = color || (['display', 'heading', 'label', 'mono'].includes(variant)
    ? designTokens.colors['text-primary']
    : designTokens.colors['text-secondary']);

  // Handle Android custom font weight mapping
  const isMedium = ['display', 'heading', 'label', 'micro', 'mono'].includes(variant);
  const isMono = variant === 'mono';

  const fontFamilyStyle: TextStyle = {
    fontFamily: isMono
      ? (Platform.OS === 'android' ? 'IBMPlexMono-Medium' : 'IBMPlexMono')
      : (isMedium 
          ? (Platform.OS === 'android' ? 'IBMPlexSans-Medium' : 'IBMPlexSans') 
          : 'IBMPlexSans'),
    fontWeight: (isMedium && Platform.OS === 'ios') ? '500' : undefined,
  };

  return (
    <Text
      style={[variantStyle, fontFamilyStyle, { color: textColor }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  display: {
    fontSize: parseInt(designTokens.typography.display.fontSize),
    lineHeight: parseInt(designTokens.typography.display.fontSize) * parseFloat(designTokens.typography.display.lineHeight),
  },
  heading: {
    fontSize: parseInt(designTokens.typography.heading.fontSize),
    lineHeight: parseInt(designTokens.typography.heading.fontSize) * parseFloat(designTokens.typography.heading.lineHeight),
  },
  body: {
    fontSize: parseInt(designTokens.typography.body.fontSize),
    lineHeight: parseInt(designTokens.typography.body.fontSize) * parseFloat(designTokens.typography.body.lineHeight),
  },
  label: {
    fontSize: parseInt(designTokens.typography.label.fontSize),
    lineHeight: parseInt(designTokens.typography.label.fontSize) * parseFloat(designTokens.typography.label.lineHeight),
  },
  caption: {
    fontSize: parseInt(designTokens.typography.caption.fontSize),
    lineHeight: parseInt(designTokens.typography.caption.fontSize) * parseFloat(designTokens.typography.caption.lineHeight),
  },
  micro: {
    fontSize: parseInt(designTokens.typography.micro.fontSize),
    textTransform: designTokens.typography.micro.textTransform as 'none' | 'uppercase' | 'lowercase' | 'capitalize',
    letterSpacing: parseFloat(designTokens.typography.micro.letterSpacing) * parseInt(designTokens.typography.micro.fontSize),
  },
  mono: {
    fontSize: parseInt(designTokens.typography.mono.fontSize),
  },
});

