import React from 'react';

interface WarningIconProps {
  size?: number | string;
  className?: string;
}

export const WarningIcon: React.FC<WarningIconProps> = ({
  size = 14,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <path
        d="M12.6758 10.4998L8.00912 2.33314C7.90737 2.15359 7.75981 2.00425 7.5815 1.90035C7.40319 1.79644 7.2005 1.7417 6.99413 1.7417C6.78775 1.7417 6.58507 1.79644 6.40675 1.90035C6.22844 2.00425 6.08088 2.15359 5.97913 2.33314L1.31246 10.4998C1.20961 10.6779 1.15568 10.8801 1.15613 11.0858C1.15659 11.2915 1.21141 11.4934 1.31505 11.671C1.41869 11.8487 1.56746 11.9958 1.74628 12.0975C1.9251 12.1991 2.12761 12.2517 2.33329 12.2498H11.6666C11.8713 12.2496 12.0723 12.1955 12.2495 12.0931C12.4267 11.9906 12.5738 11.8433 12.6761 11.666C12.7783 11.4886 12.8321 11.2875 12.8321 11.0828C12.832 10.8781 12.7781 10.6771 12.6758 10.4998Z"
        stroke="#854F0B"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 5.25V7.58333"
        stroke="#854F0B"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 9.9165H7.00583"
        stroke="#854F0B"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
