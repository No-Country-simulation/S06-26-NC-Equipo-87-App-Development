import React, { act } from 'react';
import renderer from 'react-test-renderer';
import App from './App';
import { getToken } from './src/shared/auth/tokenService';
import { postRequest } from './src/shared/api/apiClient';
import { OperatorDashboardScreen } from './src/features/operator/screens/OperatorDashboardScreen';
import { OperatorNewIncidentStep1Screen } from './src/features/operator/screens/OperatorNewIncidentStep1Screen';
import { OperatorNewIncidentStep2Screen } from './src/features/operator/screens/OperatorNewIncidentStep2Screen';
import { OperatorTicketDetailScreen } from './src/features/operator/screens/OperatorTicketDetailScreen';

jest.mock('expo-secure-store', () => {
  return {
    setItemAsync: jest.fn(() => Promise.resolve()),
    getItemAsync: jest.fn(() => Promise.resolve(null)),
    deleteItemAsync: jest.fn(() => Promise.resolve()),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('./src/shared/auth/tokenService', () => ({
  getToken: jest.fn(),
  deleteToken: jest.fn(),
}));

jest.mock('./src/shared/api/apiClient', () => ({
  postRequest: jest.fn(),
  getRequest: jest.fn(),
  API_BASE_URL: 'http://localhost:8080',
}));

jest.mock('./src/features/auth/LoginScreen', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require('react');
  return {
    LoginScreen: (props: Record<string, unknown>) => ReactMock.createElement('LoginScreen', props),
  };
});

jest.mock('./src/features/operator/screens/OperatorDashboardScreen', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require('react');
  return {
    OperatorDashboardScreen: (props: Record<string, unknown>) => ReactMock.createElement('OperatorDashboardScreen', props),
  };
});

jest.mock('./src/features/operator/screens/OperatorNewIncidentStep1Screen', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require('react');
  return {
    OperatorNewIncidentStep1Screen: (props: Record<string, unknown>) => ReactMock.createElement('OperatorNewIncidentStep1Screen', props),
  };
});

jest.mock('./src/features/operator/screens/OperatorNewIncidentStep2Screen', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require('react');
  return {
    OperatorNewIncidentStep2Screen: (props: Record<string, unknown>) => ReactMock.createElement('OperatorNewIncidentStep2Screen', props),
  };
});

jest.mock('./src/features/operator/screens/OperatorTicketDetailScreen', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require('react');
  return {
    OperatorTicketDetailScreen: (props: Record<string, unknown>) => ReactMock.createElement('OperatorTicketDetailScreen', props),
  };
});

describe('<App />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    // Arrange
    (getToken as jest.Mock).mockResolvedValueOnce(null);
    let renderResult: renderer.ReactTestRenderer | null = null;

    // Act
    await act(async () => {
      renderResult = renderer.create(<App />);
    });

    // Assert
    expect(renderResult).toBeTruthy();
    const tree = renderResult!.toJSON();
    expect(tree).toBeTruthy();
  });

  it('navigates to IncidentDetailScreen on successful incident creation', async () => {
    // Arrange
    const payloadHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const payloadBody = 'eyJzdWIiOiIxMjM0NSIsImZpcnN0TmFtZSI6Ikp1YW4iLCJsYXN0TmFtZSI6IlDDqXJleiJ9';
    const payloadSignature = 'signature';
    const mockToken = `${payloadHeader}.${payloadBody}.${payloadSignature}`;
    (getToken as jest.Mock).mockResolvedValueOnce(mockToken);

    const createdIncidentId = 'INC-9999';
    (postRequest as jest.Mock).mockResolvedValueOnce({ incidentId: createdIncidentId });

    let renderResult: renderer.ReactTestRenderer | null = null;

    // Act - render App
    await act(async () => {
      renderResult = renderer.create(<App />);
    });

    // Assert initially on home screen
    expect(renderResult!.root.findByType(OperatorDashboardScreen)).toBeTruthy();

    // Act - trigger report press
    await act(async () => {
      renderResult!.root.findByType(OperatorDashboardScreen).props.onReportPress();
    });

    // Assert on step 1 screen
    expect(renderResult!.root.findByType(OperatorNewIncidentStep1Screen)).toBeTruthy();

    // Act - trigger step 1 next
    await act(async () => {
      renderResult!.root.findByType(OperatorNewIncidentStep1Screen).props.onNext(1, 2, 3);
    });

    // Assert on step 2 screen
    expect(renderResult!.root.findByType(OperatorNewIncidentStep2Screen)).toBeTruthy();

    // Act - trigger step 2 submit
    await act(async () => {
      await renderResult!.root.findByType(OperatorNewIncidentStep2Screen).props.onSubmit('Leaking pipe');
    });

    // Assert calls postRequest with correct params
    expect(postRequest).toHaveBeenCalledWith('/api/incidents', expect.objectContaining({
      AreaId: 1,
      IncidentTypeId: 2,
      SeverityTypeId: 3,
      Description: 'Leaking pipe',
    }));

    // Assert on detail screen with the correct incidentId
    const detailScreen = renderResult!.root.findByType(OperatorTicketDetailScreen);
    expect(detailScreen).toBeTruthy();
    expect(detailScreen.props.incidentId).toBe(createdIncidentId);
  });
});
