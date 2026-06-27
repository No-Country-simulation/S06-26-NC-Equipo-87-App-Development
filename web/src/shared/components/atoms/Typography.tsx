import React from 'react';

type TypographyVariant = 'display' | 'heading' | 'body' | 'label' | 'caption' | 'micro' | 'mono';

interface TypographyProps extends React.AllHTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  color?: string;
  component?: React.ElementType;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  component,
  children,
  className = '',
  style,
  ...props
}) => {
  const Component = component || (
    variant === 'display' ? 'h1' :
    variant === 'heading' ? 'h2' :
    variant === 'body' ? 'p' :
    variant === 'mono' ? 'code' : 'span'
  );

  const customStyle: React.CSSProperties = {
    ...(color ? { color } : {}),
    ...style
  };

  return (
    <Component
      className={`opscore-${variant} ${className}`}
      style={customStyle}
      {...props}
    >
      {children}
    </Component>
  );
};
