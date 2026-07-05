import React from 'react';

export const Sidebar: React.FC = () => {
  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#1b1d22',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: '24px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
        <div style={{ width: '24px', height: '24px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
        <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>OpsCore</h1>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <a href="#dashboard-operational" style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#333741', color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
          <span style={{ marginRight: '12px' }}>📊</span> Dashboard
        </a>
        <a href="#" style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '6px', color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}>
          <span style={{ marginRight: '12px' }}>🔍</span> Causa raíz
        </a>
        <a href="#tickets" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '6px', color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
             <span style={{ marginRight: '12px' }}>📋</span> Tickets
          </div>
          <span style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '12px', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold' }}>12</span>
        </a>
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid #374151', paddingTop: '16px' }}>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Ing. Roberto Vásquez</div>
        <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '16px' }}>GERENTE DE PLANTA</div>
        <a href="#" style={{ display: 'flex', alignItems: 'center', color: '#9ca3af', textDecoration: 'none', fontSize: '13px' }}>
           <span style={{ marginRight: '8px' }}>🚪</span> Cerrar sesión
        </a>
      </div>
    </aside>
  );
};
