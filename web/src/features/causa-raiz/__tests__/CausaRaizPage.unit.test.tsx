import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CausaRaizPage } from '../CausaRaizPage';
import { AppLayout } from '../../../shared/components/layout/AppLayout';

describe('CausaRaizPage', () => {
  it('renders the complete root cause analysis page layout', async () => {
    // Arrange
    const globalFetchMock = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/areas')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Zona Norte' },
            { name: 'Línea 3' }
          ]),
        });
      }
      if (url.includes('/api/dashboard/analytical')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            frequentCauses: [
              { label: 'Falla de componente', count: 10 }
            ],
            incidentsByArea: [
              { name: 'Zona Norte', count: 5 }
            ],
            mechanicalFailsTrend: [
              { week: 'Sem 1', count: 2 }
            ],
            technicianPerformance: [
              {
                name: 'Ramírez #042',
                specialty: 'Mecánico',
                ticketsResolved: 10,
                avgResolutionTime: '01:30'
              }
            ],
            insights: [
              'Zona Norte concentra el 58% de las fallas mecánicas.'
            ]
          }),
        });
      }
      return Promise.reject(new Error('Unknown URL requested'));
    });
    vi.stubGlobal('fetch', globalFetchMock);

    render(
      <AppLayout user={null} onLogout={() => {}} >
        <CausaRaizPage />
      </AppLayout>
    );

    // Assert
    expect(screen.getByText('OpsCore')).toBeInTheDocument();
    expect(screen.getByText('Análisis de causa raíz')).toBeInTheDocument();
    expect(screen.getByText('Esta semana')).toBeInTheDocument();
    expect(screen.getByText('Todas las áreas')).toBeInTheDocument();
    expect(screen.getByText('Descargar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Zona Norte concentra el 58%/)).toBeInTheDocument();
      expect(screen.getByText('Causas raíz más frecuentes')).toBeInTheDocument();
      expect(screen.getByText('Incidentes por área')).toBeInTheDocument();
      expect(screen.getByText('Tendencia de fallas mecánicas — últimos 7 días')).toBeInTheDocument();
      expect(screen.getByText('Rendimiento por técnico')).toBeInTheDocument();
      expect(screen.getByText('Ramírez #042')).toBeInTheDocument();
    });
  });
});
