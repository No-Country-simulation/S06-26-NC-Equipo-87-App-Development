import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { expect, test, vi, beforeEach } from 'vitest';
import { useWebAuthStore } from './features/auth/stores/useWebAuthStore';

vi.mock('./features/incidents/stores/useWebIncidentStore', () => ({
  useWebIncidentStore: () => ({
    incidents: [],
    loading: false,
    error: null,
    statusFilter: 'All',
    severityFilter: 'All',
    areaFilter: 'All',
    timeFilter: 'All',
    currentPage: 1,
    totalItems: 0,
    availableAreas: [],
    openCount: 5,
    assignedCount: 0,
    inProgressCount: 0,
    closedCount: 0,
    setStatusFilter: vi.fn(),
    setSeverityFilter: vi.fn(),
    setAreaFilter: vi.fn(),
    setTimeFilter: vi.fn(),
    setCurrentPage: vi.fn(),
    fetchAreas: vi.fn(),
    fetchIncidents: vi.fn(),
    startSignalR: vi.fn(),
    stopSignalR: vi.fn(),
  }),
}));

beforeEach(() => {
  window.location.hash = '';
  vi.restoreAllMocks();
});

test('renders login fields after initialization', async () => {
  useWebAuthStore.setState({
    initializing: false,
    token: null,
    user: null,
  });

  render(<App />);

  await waitFor(() => {
    expect(screen.queryByTestId('app-initializing')).not.toBeInTheDocument();
  });

  expect(screen.getByTestId('identifier-input')).toBeInTheDocument();
});

test('operator role only sees tickets and is redirected to tickets from dashboard and causa-raiz', async () => {
  useWebAuthStore.setState({
    initializing: false,
    token: 'mock-operator-token',
    user: {
      role: 'Operator',
      firstName: 'Ana',
      lastName: 'Rosas',
    },
  });

  window.location.hash = '#dashboard-operational';
  const { unmount } = render(<App />);

  await waitFor(() => {
    expect(window.location.hash).toBe('#tickets');
  });

  expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  expect(screen.queryByText('Causa raíz')).not.toBeInTheDocument();
  expect(screen.getByText('Tickets')).toBeInTheDocument();

  unmount();
});

test('supervisor role sees dashboard and tickets but is redirected from causa-raiz to dashboard', async () => {
  useWebAuthStore.setState({
    initializing: false,
    token: 'mock-supervisor-token',
    user: {
      role: 'Supervisor',
      firstName: 'Santiago',
      lastName: 'Mendoza',
    },
  });

  window.location.hash = '#dashboard-analytical';
  const { unmount } = render(<App />);

  await waitFor(() => {
    expect(window.location.hash).toBe('#dashboard-operational');
  });

  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.queryByText('Causa raíz')).not.toBeInTheDocument();
  expect(screen.getByText('Tickets')).toBeInTheDocument();

  unmount();
});

test('plant manager role sees all links and has access to all pages without redirects', async () => {
  useWebAuthStore.setState({
    initializing: false,
    token: 'mock-manager-token',
    user: {
      role: 'Plant Manager',
      firstName: 'Roberto',
      lastName: 'Vazquez',
    },
  });

  window.location.hash = '#dashboard-analytical';
  const { unmount } = render(<App />);

  await waitFor(() => {
    expect(screen.getByText('Causa raíz')).toBeInTheDocument();
  });

  expect(window.location.hash).toBe('#dashboard-analytical');
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Tickets')).toBeInTheDocument();

  unmount();
});
