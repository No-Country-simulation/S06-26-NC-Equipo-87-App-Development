import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const ClipboardCheckIcon = ({ color = 'currentColor', ...props }: SvgProps) => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
      stroke={color as string}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
      stroke={color as string}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 13.5l2 2 4-4"
      stroke={color as string}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
