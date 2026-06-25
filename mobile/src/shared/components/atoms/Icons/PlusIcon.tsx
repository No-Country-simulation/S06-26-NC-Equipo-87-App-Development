import React from 'react';
import Svg, { Circle, SvgProps } from 'react-native-svg';

export const PlusIcon = ({ color = 'currentColor', ...props }: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx="5" cy="12" r="1.5" fill={color as string} />
    <Circle cx="12" cy="12" r="1.5" fill={color as string} />
    <Circle cx="19" cy="12" r="1.5" fill={color as string} />
  </Svg>
);
