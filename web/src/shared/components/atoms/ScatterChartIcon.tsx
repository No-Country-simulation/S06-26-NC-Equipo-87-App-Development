import React from 'react';

interface ScatterChartIconProps {
  size?: number | string;
  className?: string;
}

export const ScatterChartIcon: React.FC<ScatterChartIconProps> = ({
  size = 18,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4.99996 5.33341C5.18405 5.33341 5.33329 5.18418 5.33329 5.00008C5.33329 4.81599 5.18405 4.66675 4.99996 4.66675C4.81586 4.66675 4.66663 4.81599 4.66663 5.00008C4.66663 5.18418 4.81586 5.33341 4.99996 5.33341Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.3333 3.99992C12.5174 3.99992 12.6667 3.85068 12.6667 3.66659C12.6667 3.48249 12.5174 3.33325 12.3333 3.33325C12.1492 3.33325 12 3.48249 12 3.66659C12 3.85068 12.1492 3.99992 12.3333 3.99992Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.66671 7.99992C7.8508 7.99992 8.00004 7.85068 8.00004 7.66659C8.00004 7.48249 7.8508 7.33325 7.66671 7.33325C7.48261 7.33325 7.33337 7.48249 7.33337 7.66659C7.33337 7.85068 7.48261 7.99992 7.66671 7.99992Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.99996 11.3334C5.18405 11.3334 5.33329 11.1842 5.33329 11.0001C5.33329 10.816 5.18405 10.6667 4.99996 10.6667C4.81586 10.6667 4.66663 10.816 4.66663 11.0001C4.66663 11.1842 4.81586 11.3334 4.99996 11.3334Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6667 9.99992C11.8508 9.99992 12 9.85068 12 9.66659C12 9.48249 11.8508 9.33325 11.6667 9.33325C11.4826 9.33325 11.3334 9.48249 11.3334 9.66659C11.3334 9.85068 11.4826 9.99992 11.6667 9.99992Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 2V12.6667C2 13.0203 2.14048 13.3594 2.39052 13.6095C2.64057 13.8595 2.97971 14 3.33333 14H14"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
