import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { ActivityIndicator, FlatList } from 'react-native';
import { TechnicianDashboardScreen } from '../screens/TechnicianDashboardScreen';

const mockUser = {
  sub: '12345',
  firstName: 'Mario',
  lastName: 'Bros',
  role: 'Technician',
};

const mockFetchSupervisorIncidents = jest.fn();
const mockStartAttention = jest.fn();

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
      startAttention: mockStartAttention,
    };
    return selector(mockState);
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('<TechnicianDashboardScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIncidentsList = [];
  });

  it('renders loading state on mount', async () => {
    mockFetchSupervisorIncidents.mockReturnValue(new Promise(() => {}));
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<TechnicianDashboardScreen />);
    });

    const indicator = renderResult!.root.findByType(ActivityIndicator);
    expect(indicator).toBeTruthy();
  });

  it('renders tickets list on successful fetch', async () => {
    const mockIncidents = [
      {
        incidentId: 'INC-0001',
        description: 'Falla eléctrica',
        areaId: 1,
        areaName: 'Zona A',
        incidentTypeId: 101,
        incidentTypeName: 'Mecánico',
        severityTypeId: 2,
        severityTypeName: 'Medio',
        status: 'assigned',
        reportedByUserId: 'user-1',
        reportedDate: new Date().toISOString(),
      },
    ];
    mockIncidentsList = mockIncidents;
    mockFetchSupervisorIncidents.mockResolvedValueOnce(mockIncidents);
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<TechnicianDashboardScreen />);
    });

    const list = renderResult!.root.findByType(FlatList);
    expect(list).toBeTruthy();

    const ticketsData = list.props.data;
    expect(ticketsData.length).toBe(1);
    expect(ticketsData[0].id).toBe('INC-0001');
  });

  it('renders error message on fetch failure', async () => {
    mockFetchSupervisorIncidents.mockRejectedValueOnce(new Error('Server error'));
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<TechnicianDashboardScreen />);
    });

    const errorTypography = renderResult!.root.findByProps({ children: 'Server error' });
    expect(errorTypography).toBeTruthy();
  });
});
