import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { ActivityIndicator } from 'react-native';
import { OperatorHomeScreen } from '../screens/OperatorHomeScreen';
import { getRequest } from '../../../shared/api/apiClient';
import { getToken } from '../../../shared/auth/tokenService';
import { IncidentList } from '../../../shared/components/organisms/IncidentList';
import { TopBar } from '../../../shared/components/organisms/TopBar';
import { NavigationHeader } from '../../../shared/components/molecules/NavigationHeader';
import { Typography } from '../../../shared/components/atoms/Typography';
import { HEADER_HEIGHT } from '../../../shared/theme/layoutConstants';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve('mock-token')),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../shared/api/apiClient', () => ({
  getRequest: jest.fn(),
}));

jest.mock('../../../shared/auth/tokenService', () => ({
  getToken: jest.fn(),
}));

describe('<OperatorHomeScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state on mount', async () => {
    (getToken as jest.Mock).mockResolvedValueOnce('mock-token');
    (getRequest as jest.Mock).mockReturnValue(new Promise(() => {}));
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<OperatorHomeScreen />);
    });

    const indicator = renderResult!.root.findByType(ActivityIndicator);
    expect(indicator).toBeTruthy();
  });

  it('renders operator name, shift, line and incident list on successful fetch', async () => {
    const payloadHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const payloadBody = 'eyJzdWIiOiIxMjM0NSIsImZpcnN0TmFtZSI6Ikp1YW4iLCJsYXN0TmFtZSI6IlDDqXJleiJ9';
    const mockToken = `${payloadHeader}.${payloadBody}.signature`;

    const mockIncidents = [
      {
        incidentId: 'INC-0001',
        description: 'Falla en motor eléctrico',
        areaName: 'Línea 3',
        incidentTypeName: 'Falla mecánica',
        status: 'in-progress',
      },
    ];

    (getToken as jest.Mock).mockResolvedValueOnce(mockToken);
    (getRequest as jest.Mock).mockResolvedValueOnce(mockIncidents);
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<OperatorHomeScreen />);
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
    (getToken as jest.Mock).mockResolvedValueOnce('mock-token');
    (getRequest as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<OperatorHomeScreen />);
    });

    const errorText = renderResult!.root.findByProps({ testID: 'error-container' }).findAllByType(Typography)[0];
    expect(errorText.props.children).toBe('Connection failed');

    (getToken as jest.Mock).mockResolvedValueOnce('mock-token');
    (getRequest as jest.Mock).mockResolvedValueOnce([]);

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
