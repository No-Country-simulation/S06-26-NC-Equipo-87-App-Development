import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { LogoutConfirmModal } from '../molecules/LogoutConfirmModal';

interface AppLayoutProps {
  user: Record<string, unknown> | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ user, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="opscore-dashboard-layout">
      <header className="opscore-mobile-header">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="opscore-hamburger-btn"
          aria-label="Abrir menú"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="opscore-mobile-brand">
          <span className="opscore-sidebar-brand-text"><span>Ops</span><span>Core</span></span>
        </div>
        <div style={{ width: '24px' }} />
      </header>

      <div className={`opscore-sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
        <div className="opscore-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
        <Sidebar user={user} onLogout={handleLogoutClick} onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="opscore-main-content">
        {children}
      </main>

      {isLogoutModalOpen && (
        <LogoutConfirmModal
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      )}
    </div>
  );
};
