import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricCard } from '../molecules/MetricCard';
import { StatusSummary } from '../organisms/StatusSummary';
import { AlertBanner } from '../../../../shared/components/molecules/AlertBanner';

describe('Dashboard Components', () => {
  it('renders MetricCard correctly', () => {
    render(
      <MetricCard 
        title="Test Title" 
        value="47" 
        trendText="12%" 
        trendDirection="up" 
        trendColor="green" 
      />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
    expect(screen.getByText('↑ 12%')).toBeInTheDocument();
  });

  it('renders StatusSummary correctly', () => {
    const mockCounts = { open: 5, assigned: 2, inProgress: 3, closed: 10 };
    render(<StatusSummary counts={mockCounts} />);
    expect(screen.getByText(/abiertos/)).toBeInTheDocument();
    expect(screen.getByText(/cerrados/)).toBeInTheDocument();
  });

  it('renders AlertBanner correctly', () => {
    render(<AlertBanner insights={['1 incidente sin clasificar esta semana, requiere revisión manual.']} />);
    expect(screen.getByText(/requiere revisión manual/)).toBeInTheDocument();
  });
});
