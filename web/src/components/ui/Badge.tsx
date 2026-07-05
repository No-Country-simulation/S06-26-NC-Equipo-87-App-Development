import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'danger' | 'warning' | 'success' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '', ...props }) => {
  let style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
  };

  switch (variant) {
    case 'danger':
      style = { ...style, backgroundColor: '#ffebe6', color: '#bf2600' };
      break;
    case 'warning':
      style = { ...style, backgroundColor: '#fffae6', color: '#ff8b00' };
      break;
    case 'success':
      style = { ...style, backgroundColor: '#e3fcef', color: '#006644' };
      break;
    case 'info':
      style = { ...style, backgroundColor: '#deebff', color: '#0747a6' };
      break;
    default:
      style = { ...style, backgroundColor: '#dfe1e6', color: '#42526e' };
  }

  return (
    <span className={`badge ${className}`} style={style} {...props}>
      {children}
    </span>
  );
};
