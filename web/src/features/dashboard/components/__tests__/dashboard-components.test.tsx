import { render, screen, fireEvent } from '@testing-library/react';
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

  it('dismisses alerts and maintains dismissed state on identical re-renders and unmounts', () => {
    // Arrange
    localStorage.clear();
    const firstAlert = '1 incidente sin clasificar esta semana';
    const secondAlert = '2 incidentes con retraso';
    const { rerender, unmount } = render(<AlertBanner insights={[firstAlert, secondAlert]} />);

    // Act
    expect(screen.getByText(firstAlert)).toBeInTheDocument();
    expect(screen.getByText(secondAlert)).toBeInTheDocument();
    
    const dismissButtons = screen.getAllByRole('button', { name: /dismiss alert/i });
    fireEvent.click(dismissButtons[0]);

    // Assert
    expect(screen.queryByText(firstAlert)).not.toBeInTheDocument();
    expect(screen.getByText(secondAlert)).toBeInTheDocument();

    // Act
    rerender(<AlertBanner insights={[firstAlert, secondAlert]} />);

    // Assert
    expect(screen.queryByText(firstAlert)).not.toBeInTheDocument();
    expect(screen.getByText(secondAlert)).toBeInTheDocument();

    // Act
    unmount();
    render(<AlertBanner insights={[firstAlert, secondAlert]} />);

    // Assert
    expect(screen.queryByText(firstAlert)).not.toBeInTheDocument();
    expect(screen.getByText(secondAlert)).toBeInTheDocument();
  });
});
