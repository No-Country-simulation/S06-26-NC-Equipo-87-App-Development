import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { ActivityIndicator } from 'react-native';
import { TechnicianTicketDetailScreen } from '../screens/TechnicianTicketDetailScreen';
import { StatusBadge } from '../../../shared/components/atoms/StatusBadge';
import { SeverityBadge } from '../../../shared/components/atoms/SeverityBadge';

const mockFetchIncidentDetail = jest.fn();

let mockSelectedIncidentVal: unknown = null;

jest.mock('../../incidents/stores/useIncidentStore', () => ({
  useIncidentStore: jest.fn((selector) => {
    const mockState = {
      selectedIncident: mockSelectedIncidentVal,
      fetchIncidentDetail: mockFetchIncidentDetail,
    };
    return selector(mockState);
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('<TechnicianTicketDetailScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectedIncidentVal = null;
  });

  it('renders loading state on mount', async () => {
    mockFetchIncidentDetail.mockReturnValue(new Promise(() => {}));
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<TechnicianTicketDetailScreen ticketId="INC-0001" />);
    });

    const indicator = renderResult!.root.findByType(ActivityIndicator);
    expect(indicator).toBeTruthy();
  });

  it('renders ticket details on successful fetch', async () => {
    const mockTicketDetail = {
      incidentId: 'INC-0001',
      description: 'Falla eléctrica en Zona A',
      areaId: 1,
      areaName: 'Zona A',
      incidentTypeId: 101,
      incidentTypeName: 'Mecánico',
      severityTypeId: 2,
      severityTypeName: 'Medio',
      status: 'assigned',
      reportedByUserId: 'user-123',
      reportedDate: new Date().toISOString(),
      history: [],
    };

    mockSelectedIncidentVal = mockTicketDetail;
    mockFetchIncidentDetail.mockResolvedValueOnce(mockTicketDetail);

    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<TechnicianTicketDetailScreen ticketId="INC-0001" />);
    });

    // Check status badge
    const statusBadge = renderResult!.root.findByType(StatusBadge);
    expect(statusBadge).toBeTruthy();
    expect(statusBadge.props.status).toBe('assigned');

    // Check severity badge
    const severityBadge = renderResult!.root.findByType(SeverityBadge);
    expect(severityBadge).toBeTruthy();
    expect(severityBadge.props.severity).toBe('Medio');

    // Check description text
    const descriptionTypography = renderResult!.root.findByProps({ children: 'Falla eléctrica en Zona A' });
    expect(descriptionTypography).toBeTruthy();
  });
});
