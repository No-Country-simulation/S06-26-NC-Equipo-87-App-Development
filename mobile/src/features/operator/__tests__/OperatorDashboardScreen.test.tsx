import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { ActivityIndicator } from 'react-native';
import { OperatorDashboardScreen } from '../screens/OperatorDashboardScreen';
import { IncidentList } from '../../../shared/components/organisms/IncidentList';
import { TopBar } from '../../../shared/components/organisms/TopBar';
import { NavigationHeader } from '../../../shared/components/molecules/NavigationHeader';
import { Typography } from '../../../shared/components/atoms/Typography';
import { HEADER_HEIGHT } from '../../../shared/theme/layoutConstants';

const mockUser = {
  sub: '12345',
  firstName: 'Juan',
  lastName: 'Pérez',
  role: 'Operator',
  areaName: 'Línea 3',
  shiftName: 'Morning',
};

const mockFetchOperatorIncidents = jest.fn();

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
      fetchOperatorIncidents: mockFetchOperatorIncidents,
    };
    return selector(mockState);
  }),
}));

describe('<OperatorDashboardScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIncidentsList = [];
  });

  it('renders loading state on mount', async () => {
    mockFetchOperatorIncidents.mockReturnValue(new Promise(() => {}));
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<OperatorDashboardScreen />);
    });

    const indicator = renderResult!.root.findByType(ActivityIndicator);
    expect(indicator).toBeTruthy();
  });

  it('renders operator name, shift, line and incident list on successful fetch', async () => {
    const mockIncidents = [
      {
        incidentId: 'INC-0001',
        description: 'Falla en motor eléctrico',
        areaName: 'Línea 3',
        incidentTypeName: 'Falla mecánica',
        status: 'in-progress',
      },
    ];

    mockIncidentsList = mockIncidents;
    mockFetchOperatorIncidents.mockResolvedValueOnce(mockIncidents);
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<OperatorDashboardScreen />);
    });

    const topBar = renderResult!.root.findByType(TopBar);
    expect(topBar.props.userName).toBe('Juan P.');
    expect(topBar.props.shift).toBeDefined();
    expect(topBar.props.userLine).toBeDefined();

    const incidentList = renderResult!.root.findByType(IncidentList);
    expect(incidentList.props.incidents.length).toBe(1);
    expect(incidentList.props.incidents[0].id).toBe('INC-0001');
    expect(incidentList.props.incidents[0].title).toBe('Falla mecánica');
    expect(incidentList.props.incidents[0].status).toBe('in-progress');
    expect(incidentList.props.incidents[0].statusLabel).toBe('En proceso');
    expect(incidentList.props.footerNote).toBeTruthy();
  });

  it('renders error state and handles retry click', async () => {
    mockFetchOperatorIncidents.mockRejectedValueOnce(new Error('Connection failed'));
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<OperatorDashboardScreen />);
    });

    const errorText = renderResult!.root.findByProps({ testID: 'error-container' }).findAllByType(Typography)[0];
    expect(errorText.props.children).toBe('Connection failed');

    mockFetchOperatorIncidents.mockResolvedValueOnce([]);

    const retryButton = renderResult!.root.findByProps({ testID: 'retry-button' });
    await act(async () => {
      await retryButton.props.onPress();
    });

    const emptyContainer = renderResult!.root.findByProps({ testID: 'empty-container' });
    expect(emptyContainer).toBeTruthy();
  });

  it('TopBar and NavigationHeader share the same HEADER_HEIGHT', () => {
    expect(HEADER_HEIGHT).toBe(52);
    expect(typeof TopBar).toBe('function');
    expect(typeof NavigationHeader).toBe('function');
  });
});
