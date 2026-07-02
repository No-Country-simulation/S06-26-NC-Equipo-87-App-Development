import React from 'react';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  user: Record<string, unknown> | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ user, onLogout, children }) => {
  return (
    <div className="opscore-dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="opscore-main-content">
        {children}
      </main>
    </div>
  );
};
