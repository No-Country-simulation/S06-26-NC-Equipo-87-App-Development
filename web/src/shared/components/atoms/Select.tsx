import React, { useState, useEffect, useRef } from 'react';

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
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options: { value: string; label: string }[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === 'option') {
      const optionProps = child.props as { value?: string; children?: React.ReactNode };
      options.push({
        value: String(optionProps.value ?? ''),
        label: String(optionProps.children ?? '')
      });
    }
  });

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const selectedLabel = selectedOption ? selectedOption.label : '';

  const isValueSelected = value !== undefined &&
    value !== '' &&
    value !== 'all' &&
    value !== 'All' &&
    value !== 'week' &&
    value !== 'current';

  const effectiveVariant = variant === 'dark' || isOpen || isValueSelected ? 'dark' : 'light';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onBlur) {
          const focusEvent = {} as React.FocusEvent<HTMLSelectElement>;
          onBlur(focusEvent);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onBlur]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && onFocus) {
      const focusEvent = {} as React.FocusEvent<HTMLSelectElement>;
      onFocus(focusEvent);
    }
    if (!nextState && onBlur) {
      const focusEvent = {} as React.FocusEvent<HTMLSelectElement>;
      onBlur(focusEvent);
    }
  };

  const handleSelectOption = (optValue: string) => {
    if (onChange) {
      const event = {
        target: { value: optValue }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(event);
    }
    setIsOpen(false);
    if (onBlur) {
      const focusEvent = {} as React.FocusEvent<HTMLSelectElement>;
      onBlur(focusEvent);
    }
  };

  const bgColor = effectiveVariant === 'dark' ? 'var(--colors-background-dark)' : '#ffffff';
  const textColor = effectiveVariant === 'dark' ? 'var(--colors-text-on-dark)' : 'var(--colors-text-secondary)';
  const borderColor = effectiveVariant === 'dark' ? 'var(--colors-background-dark)' : '#dcdad4';

  const triggerStyle: React.CSSProperties = {
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
    fontFamily: 'inherit',
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${effectiveVariant === 'dark' ? '%23E8E6DF' : '%235F5E5A'}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '10px',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    width: '100%',
    position: 'relative',
    transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
    ...style
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    minWidth: '100%',
    width: 'max-content',
    backgroundColor: 'var(--colors-background-dark)',
    borderRadius: '12px',
    padding: '8px 0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    display: isOpen ? 'block' : 'none',
    boxSizing: 'border-box',
    border: '1.25px solid var(--colors-background-dark)',
  };

  const optionStyle = (isHovered: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--colors-text-on-dark)',
    backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
    cursor: 'pointer',
    userSelect: 'none',
    fontFamily: 'inherit',
    transition: 'background-color 0.15s'
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', minWidth: style?.minWidth || '120px' }}>
      <select
        value={value}
        onChange={onChange}
        style={{ display: 'none' }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.value}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleToggle}
        style={triggerStyle}
        className={className}
      >
        {effectiveVariant === 'dark' && (
          <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
          {selectedLabel}
        </span>
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          {options.map((opt) => (
            <OptionItem
              key={opt.value}
              label={opt.label}
              onClick={() => handleSelectOption(opt.value)}
              styleFn={optionStyle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const OptionItem: React.FC<{
  label: string;
  onClick: () => void;
  styleFn: (isHovered: boolean) => React.CSSProperties;
}> = ({ label, onClick, styleFn }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={styleFn(hovered)}
    >
      {label}
    </div>
  );
};
