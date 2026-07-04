import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';

interface DownloadButtonProps {
  onDownloadCsv?: () => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ onDownloadCsv }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePdfClick = () => {
    setIsOpen(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleCsvClick = () => {
    if (onDownloadCsv) {
      onDownloadCsv();
    }
    setIsOpen(false);
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 0,
    backgroundColor: 'var(--colors-background-dark)',
    borderRadius: '12px',
    padding: '8px 0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    display: isOpen ? 'block' : 'none',
    minWidth: '120px',
    boxSizing: 'border-box',
    border: '1.25px solid var(--colors-background-dark)'
  };

  const optionStyle = (hovered: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--colors-text-on-dark)',
    cursor: 'pointer',
    userSelect: 'none',
    fontFamily: 'inherit',
    transition: 'background-color 0.15s',
    backgroundColor: hovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
    textAlign: 'left'
  });

  return (
    <div ref={containerRef} className="no-print" style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="primary"
        style={{
          backgroundColor: 'var(--colors-background-dark)',
          color: 'var(--colors-text-on-dark)',
          border: 'none',
          padding: '0 var(--spacing-4)',
          borderRadius: 'var(--rounded-md)',
          height: '38px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Descargar
      </Button>

      <div style={dropdownStyle}>
        <DropdownOption label="PDF" onClick={handlePdfClick} styleFn={optionStyle} />
        {onDownloadCsv && (
          <DropdownOption label="CSV" onClick={handleCsvClick} styleFn={optionStyle} />
        )}
      </div>
    </div>
  );
};

const DropdownOption: React.FC<{
  label: string;
  onClick: () => void;
  styleFn: (hovered: boolean) => React.CSSProperties;
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
