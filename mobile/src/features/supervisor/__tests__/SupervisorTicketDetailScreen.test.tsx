import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { ActivityIndicator } from 'react-native';
import { SupervisorTicketDetailScreen } from '../screens/SupervisorTicketDetailScreen';
import { SupervisorTicketDetailsCard } from '../../../shared/components/organisms/SupervisorTicketDetailsCard';
import { SupervisorTicketTimelineCard } from '../../../shared/components/organisms/SupervisorTicketTimelineCard';

const mockFetchIncidentDetail = jest.fn();
const mockFetchTechnicians = jest.fn();
const mockAssignTechnician = jest.fn();

let mockSelectedIncidentVal: unknown = null;

jest.mock('../../incidents/stores/useIncidentStore', () => ({
  useIncidentStore: jest.fn((selector) => {
    const mockState = {
      selectedIncident: mockSelectedIncidentVal,
      fetchIncidentDetail: mockFetchIncidentDetail,
      fetchTechnicians: mockFetchTechnicians,
      assignTechnician: mockAssignTechnician,
    };
    return selector(mockState);
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('<SupervisorTicketDetailScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectedIncidentVal = null;
  });

  it('renders loading state on mount', async () => {
    mockFetchIncidentDetail.mockReturnValue(new Promise(() => {}));
    mockFetchTechnicians.mockReturnValue(new Promise(() => {}));
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<SupervisorTicketDetailScreen ticketId="INC-0001" />);
    });

    const indicator = renderResult!.root.findByType(ActivityIndicator);
    expect(indicator).toBeTruthy();
  });

  it('renders ticket details and timeline on successful fetch', async () => {
    const mockTicketDetail = {
      incidentId: 'INC-0001',
      description: 'Tubería rota en Zona A',
      areaId: 1,
      areaName: 'Zona A',
      incidentTypeId: 101,
      incidentTypeName: 'Mecánico',
      severityTypeId: 2,
      severityTypeName: 'Medio',
      status: 'open',
      reportedByUserId: 'user-123',
      reportedDate: new Date().toISOString(),
      history: [],
    };
    const mockTechs = [
      {
        userId: 'tech-1',
        firstName: 'Mario',
        lastName: 'Bros',
        specialityName: 'Plomería',
        isFree: true,
      },
    ];

    mockSelectedIncidentVal = mockTicketDetail;
    mockFetchIncidentDetail.mockResolvedValueOnce(mockTicketDetail);
    mockFetchTechnicians.mockResolvedValueOnce(mockTechs);

    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<SupervisorTicketDetailScreen ticketId="INC-0001" />);
    });

    const detailsCard = renderResult!.root.findByType(SupervisorTicketDetailsCard);
    expect(detailsCard).toBeTruthy();
    expect(detailsCard.props.areaName).toBe('Zona A');

    const timelineCard = renderResult!.root.findByType(SupervisorTicketTimelineCard);
    expect(timelineCard).toBeTruthy();

  });
});
