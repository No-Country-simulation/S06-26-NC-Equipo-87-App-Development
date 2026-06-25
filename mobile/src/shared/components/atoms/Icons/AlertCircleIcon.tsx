import React from 'react';
import Svg, { Circle, Line, SvgProps } from 'react-native-svg';

interface AlertCircleIconProps extends SvgProps {
  color?: string;
}

export const AlertCircleIcon: React.FC<AlertCircleIconProps> = ({
  color = '#E8E6DF',
  width = 22,
  height = 22,
  ...props
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line
      x1="12"
      y1="8"
      x2="12"
      y2="12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line
      x1="12"
      y1="16"
      x2="12.01"
      y2="16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
