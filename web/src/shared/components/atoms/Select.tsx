import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'light' | 'dark';
  pill?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  variant = 'light',
  pill = false,
  className = '',
  style,
  children,
  ...props
}) => {
  const strokeColor = variant === 'dark' ? '%23E8E6DF' : '%235F5E5A';
  const bgColor = variant === 'dark' ? 'var(--colors-background-dark)' : '#ffffff';
  const textColor = variant === 'dark' ? 'var(--colors-text-on-dark)' : 'var(--colors-text-secondary)';
  const borderColor = variant === 'dark' ? 'var(--colors-background-dark)' : '#dcdad4';

  const defaultStyle: React.CSSProperties = {
    padding: '0 32px 0 16px',
    height: '38px',
    borderRadius: pill ? '9999px' : 'var(--rounded-md)',
    border: `1.25px solid ${borderColor}`,
    backgroundColor: bgColor,
    color: textColor,
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    fontFamily: 'inherit',
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${strokeColor}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '10px',
    textAlign: 'left',
    textAlignLast: 'left',
    boxSizing: 'border-box',
    display: 'inline-block',
    verticalAlign: 'middle',
    lineHeight: '34px',
    ...style
  };

  return (
    <select
      className={className}
      style={defaultStyle}
      {...props}
    >
      {children}
    </select>
  );
};
