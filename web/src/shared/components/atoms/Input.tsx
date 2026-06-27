import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'light' | 'dark';
  errorMessage?: string | null;
}

export const Input: React.FC<InputProps> = ({
  variant = 'light',
  errorMessage,
  className = '',
  ...props
}) => {
  const errorClass = errorMessage ? 'opscore-input-error' : '';
  return (
    <div className="opscore-input-wrapper">
      <input
        className={`opscore-input opscore-input-${variant} ${errorClass} ${className}`}
        {...props}
      />
      {errorMessage && (
        <span className="opscore-input-error-message">
          {errorMessage}
        </span>
      )}
    </div>
  );
};
