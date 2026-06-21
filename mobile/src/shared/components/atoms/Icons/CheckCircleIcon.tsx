import React from 'react';
import Svg, { Path, Polyline } from 'react-native-svg';
import designTokens from '../../../theme/designTokens.json';

export const CheckCircleIcon: React.FC = () => (
  <Svg width={52} height={52} viewBox="0 0 52 52" fill="none">
    <Path
      d="M26 4C13.85 4 4 13.85 4 26s9.85 22 22 22 22-9.85 22-22S38.15 4 26 4z"
      fill="#E6F7F3"
      stroke={designTokens.colors['status-closed']}
      strokeWidth="1.5"
    />
    <Polyline
      points="16,26 23,33 36,20"
      stroke={designTokens.colors['status-closed']}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);
