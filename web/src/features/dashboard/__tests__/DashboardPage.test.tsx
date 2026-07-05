import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardPage } from '../DashboardPage';
import { AppLayout } from '../../../shared/components/layout/AppLayout';

describe('DashboardPage', () => {
  it('renders the complete dashboard page layout', () => {
    render(
      <AppLayout user={null} onLogout={() => {}}>
        <DashboardPage />
      </AppLayout>
    );
    
    // Check Sidebar
    expect(screen.getByText('OpsCore')).toBeInTheDocument();
    
    // Check Header
    expect(screen.getByText('Dashboard operacional')).toBeInTheDocument();
    
    // Check Metrics
    expect(screen.getByText('Incidentes esta semana')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
    
    // Check Status summary
    expect(screen.getByText(/abiertos/)).toBeInTheDocument();
    
    // Check Alert banner
    expect(screen.getByText(/requiere revisión manual/)).toBeInTheDocument();
    
    // Check Charts Section
    expect(screen.getByText('Incidentes por día')).toBeInTheDocument();
    
    // Check Incidents Table
    expect(screen.getByText('Incidentes críticos recientes')).toBeInTheDocument();
    expect(screen.getByText('INC-0043')).toBeInTheDocument();
  });
});
