import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { ActivityIndicator } from 'react-native';
import { TechnicianCloseTicketScreen } from '../screens/TechnicianCloseTicketScreen';
import { DropdownSelector } from '../../../shared/components/molecules/DropdownSelector';
import { TextArea } from '../../../shared/components/molecules/TextArea';

const mockFetchIncidentDetail = jest.fn();
const mockCloseIncident = jest.fn();
const mockFetchRootCauses = jest.fn();

jest.mock('../../incidents/stores/useIncidentStore', () => ({
  useIncidentStore: jest.fn((selector) => {
    const mockState = {
      fetchIncidentDetail: mockFetchIncidentDetail,
      closeIncident: mockCloseIncident,
    };
    return selector(mockState);
  }),
}));

jest.mock('../../incidents/stores/useLookupStore', () => ({
  useLookupStore: jest.fn((selector) => {
    const mockState = {
      rootCauses: [{ id: 1, name: 'Causa A' }],
      fetchRootCauses: mockFetchRootCauses,
    };
    return selector(mockState);
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('<TechnicianCloseTicketScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state on mount', async () => {
    mockFetchIncidentDetail.mockReturnValue(new Promise(() => {}));
    mockFetchRootCauses.mockReturnValue(new Promise(() => {}));
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<TechnicianCloseTicketScreen ticketId="INC-0001" />);
    });

    const indicator = renderResult!.root.findByType(ActivityIndicator);
    expect(indicator).toBeTruthy();
  });

  it('renders form elements on successful fetch', async () => {
    const mockTicketDetail = {
      incidentId: 'INC-0001',
      description: 'Falla eléctrica',
      areaId: 1,
      areaName: 'Zona A',
      incidentTypeId: 101,
      incidentTypeName: 'Mecánico',
      severityTypeId: 2,
      severityTypeName: 'Medio',
      status: 'assigned',
      reportedByUserId: 'user-123',
      reportedByEmployeeId: '0014',
      reportedDate: new Date().toISOString(),
    };

    mockFetchIncidentDetail.mockResolvedValueOnce(mockTicketDetail);
    mockFetchRootCauses.mockResolvedValueOnce([]);

    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(<TechnicianCloseTicketScreen ticketId="INC-0001" />);
    });

    const dropdown = renderResult!.root.findByType(DropdownSelector);
    expect(dropdown).toBeTruthy();

    const textArea = renderResult!.root.findByType(TextArea);
    expect(textArea).toBeTruthy();
  });
});
