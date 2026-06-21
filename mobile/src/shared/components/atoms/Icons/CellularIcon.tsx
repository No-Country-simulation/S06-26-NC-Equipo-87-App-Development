import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const CellularIcon = (props: SvgProps) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M3 18H5V21H3V18Z" fill="currentColor" />
    <Path d="M7 14H9V21H7V14Z" fill="currentColor" />
    <Path d="M11 10H13V21H11V10Z" fill="currentColor" />
    <Path d="M15 6H17V21H15V6Z" fill="currentColor" />
    <Path d="M19 2H21V21H19V2Z" fill="currentColor" />
  </Svg>
);
