import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const WifiIcon = (props: SvgProps) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 20C12.8284 20 13.5 19.3284 13.5 18.5C13.5 17.6716 12.8284 17 12 17C11.1716 17 10.5 17.6716 10.5 18.5C10.5 19.3284 11.1716 20 12 20Z"
      fill="currentColor"
    />
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 7C14.7614 7 17 4.76142 17 2H19C19 5.86599 15.866 9 12 9C8.13401 9 5 5.86599 5 2H7C7 4.76142 9.23858 7 12 7Z"
      fill="currentColor"
    />
  </Svg>
);
