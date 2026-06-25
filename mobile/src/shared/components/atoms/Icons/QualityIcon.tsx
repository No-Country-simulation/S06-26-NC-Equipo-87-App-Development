import React from 'react';
import Svg, { Path, Rect, Polyline, SvgProps } from 'react-native-svg';

export const QualityIcon = ({ color = 'currentColor', ...props }: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect
      x="9"
      y="2"
      width="6"
      height="4"
      rx="1"
      stroke={color as string}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3"
      stroke={color as string}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="9 12 11 14 15 10"
      stroke={color as string}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
