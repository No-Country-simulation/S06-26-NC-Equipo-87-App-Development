import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const WarningIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
