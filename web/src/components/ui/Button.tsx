import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.2s',
  };

  let variantStyle = {};
  if (variant === 'primary') {
    variantStyle = { backgroundColor: '#1d2125', color: '#fff' };
  } else if (variant === 'secondary') {
    variantStyle = { backgroundColor: '#f4f5f7', color: '#172b4d' };
  } else if (variant === 'outline') {
    variantStyle = { backgroundColor: 'transparent', border: '1px solid #dfe1e6', color: '#42526e' };
  }

  let sizeStyle = {};
  if (size === 'sm') {
    sizeStyle = { padding: '4px 8px', fontSize: '12px' };
  } else if (size === 'md') {
    sizeStyle = { padding: '8px 16px', fontSize: '14px' };
  }

  return (
    <button
      className={`btn ${className}`}
      style={{ ...baseStyle, ...variantStyle, ...sizeStyle }}
      {...props}
    >
      {children}
    </button>
  );
};
