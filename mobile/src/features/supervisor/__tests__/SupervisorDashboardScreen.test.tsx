import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { ActivityIndicator } from 'react-native';
import { SupervisorDashboardScreen } from '../screens/SupervisorDashboardScreen';
import { SupervisorTicketList } from '../../../shared/components/organisms/SupervisorTicketList';

const mockUser = {
  sub: '12345',
  firstName: 'Claudia',
  lastName: 'Martínez',
  role: 'Supervisor',
};

const mockFetchSupervisorIncidents = jest.fn();

jest.mock('../../auth/stores/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => {
    const mockState = {
      user: mockUser,
    };
    return selector(mockState);
  }),
}));

let mockIncidentsList: unknown[] = [];

jest.mock('../../incidents/stores/useIncidentStore', () => ({
  useIncidentStore: jest.fn((selector) => {
    const mockState = {
      incidents: mockIncidentsList,
      fetchSupervisorIncidents: mockFetchSupervisorIncidents,
    };
    return selector(mockState);
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('<SupervisorDashboardScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIncidentsList = [];
  });

  it('renders loading state on mount', async () => {
    // Arrange
    mockFetchSupervisorIncidents.mockReturnValue(new Promise(() => {}));
    let renderResult: renderer.ReactTestRenderer | null = null;

    // Act
    await act(async () => {
      renderResult = renderer.create(<SupervisorDashboardScreen />);
    });

    // Assert
    const indicator = renderResult!.root.findByType(ActivityIndicator);
    expect(indicator).toBeTruthy();
  });

  it('renders tickets list on successful fetch', async () => {
    // Arrange
    const mockIncidents = [
      {
        incidentId: 'INC-0001',
        description: 'Tubería rota',
        areaId: 1,
        areaName: 'Zona A',
        incidentTypeId: 101,
        incidentTypeName: 'Mecánico',
        severityTypeId: 2,
        severityTypeName: 'Medio',
        status: 'open',
        reportedByUserId: 'user-1',
        reportedDate: new Date().toISOString(),
      },
    ];
    mockIncidentsList = mockIncidents;
    mockFetchSupervisorIncidents.mockResolvedValueOnce(mockIncidents);
    let renderResult: renderer.ReactTestRenderer | null = null;

    // Act
    await act(async () => {
      renderResult = renderer.create(<SupervisorDashboardScreen />);
    });

    // Assert
    const list = renderResult!.root.findByType(SupervisorTicketList);
    expect(list).toBeTruthy();
    expect(list.props.tickets.length).toBe(1);
    expect(list.props.tickets[0].id).toBe('INC-0001');
  });

  it('renders error message on fetch failure', async () => {
    // Arrange
    mockFetchSupervisorIncidents.mockRejectedValueOnce(new Error('Server error'));
    let renderResult: renderer.ReactTestRenderer | null = null;

    // Act
    await act(async () => {
      renderResult = renderer.create(<SupervisorDashboardScreen />);
    });

    // Assert
    const errorTypography = renderResult!.root.findByProps({ children: 'Server error' });
    expect(errorTypography).toBeTruthy();
  });
});
