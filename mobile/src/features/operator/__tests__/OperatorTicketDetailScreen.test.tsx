import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { ActivityIndicator } from 'react-native';
import { OperatorTicketDetailScreen } from '../screens/OperatorTicketDetailScreen';
import { getRequest } from '../../../shared/api/apiClient';
import { IncidentConfirmationHero } from '../../../shared/components/organisms/IncidentConfirmationHero';
import { IncidentSummaryCard } from '../../../shared/components/organisms/IncidentSummaryCard';
import { Button } from '../../../shared/components/atoms/Button';
import { Typography } from '../../../shared/components/atoms/Typography';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-svg', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => children,
    Path: () => null,
    Polyline: () => null,
  };
});

jest.mock('../../../shared/api/apiClient', () => ({
  getRequest: jest.fn(),
}));

const mockBackendIncident = {
  incidentId: 'INC-0043',
  description: 'Falla en sistema hidráulico',
  areaId: 1,
  areaName: 'Zona Norte',
  incidentTypeId: 2,
  incidentTypeName: 'Falla mecánica',
  severityTypeId: 3,
  severityTypeName: 'Alto',
  status: 'open',
  reportedByUserId: 'user-1',
  reportedDate: '2026-06-18T09:44:00.000Z',
};

describe('<OperatorTicketDetailScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state on mount', async () => {
    (getRequest as jest.Mock).mockReturnValue(new Promise(() => {}));
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(
        <OperatorTicketDetailScreen incidentId="INC-0043" />
      );
    });

    const indicator = renderResult!.root.findByType(ActivityIndicator);
    expect(indicator).toBeTruthy();
  });

  it('renders confirmation hero and summary card on successful fetch', async () => {
    (getRequest as jest.Mock).mockResolvedValueOnce(mockBackendIncident);
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(
        <OperatorTicketDetailScreen incidentId="INC-0043" />
      );
    });

    const hero = renderResult!.root.findByType(IncidentConfirmationHero);
    expect(hero.props.incidentId).toBe('INC-0043');

    const card = renderResult!.root.findByType(IncidentSummaryCard);
    expect(card.props.area).toBe('Zona Norte');
    expect(card.props.type).toBe('Falla mecánica');
    expect(card.props.severity).toBe('Alto');
    expect(card.props.time).toMatch(/^\d{2}:\d{2}$/);
  });

  it('applies red severity color for Alto', async () => {
    (getRequest as jest.Mock).mockResolvedValueOnce(mockBackendIncident);
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(
        <OperatorTicketDetailScreen incidentId="INC-0043" />
      );
    });

    const card = renderResult!.root.findByType(IncidentSummaryCard);
    expect(card.props.severityColor).toBe('#E24B4A');
  });

  it('renders error state on fetch failure', async () => {
    (getRequest as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(
        <OperatorTicketDetailScreen incidentId="INC-0043" />
      );
    });

    const errorText = renderResult!.root.findByProps({ testID: 'detail-error' }).findAllByType(Typography)[0];
    expect(errorText.props.children).toBe('Network error');
  });

  it('retries fetch when retry button is pressed', async () => {
    (getRequest as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(
        <OperatorTicketDetailScreen incidentId="INC-0043" />
      );
    });

    (getRequest as jest.Mock).mockResolvedValueOnce(mockBackendIncident);

    const retryButton = renderResult!.root.findByProps({ testID: 'detail-retry' });
    await act(async () => {
      await retryButton.props.onPress();
    });

    const hero = renderResult!.root.findByType(IncidentConfirmationHero);
    expect(hero).toBeTruthy();
  });

  it('calls onClose when Volver al inicio is pressed', async () => {
    (getRequest as jest.Mock).mockResolvedValueOnce(mockBackendIncident);
    const onClose = jest.fn();
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(
        <OperatorTicketDetailScreen incidentId="INC-0043" onClose={onClose} />
      );
    });

    const buttons = renderResult!.root.findAllByType(Button);
    const goHomeButton = buttons.find((b) => b.props.label === 'Volver al inicio');
    expect(goHomeButton).toBeTruthy();

    await act(async () => {
      goHomeButton!.props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('falls back to onBack when onClose is not provided', async () => {
    (getRequest as jest.Mock).mockResolvedValueOnce(mockBackendIncident);
    const onBack = jest.fn();
    let renderResult: renderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderResult = renderer.create(
        <OperatorTicketDetailScreen incidentId="INC-0043" onBack={onBack} />
      );
    });

    const buttons = renderResult!.root.findAllByType(Button);
    const goHomeButton = buttons.find((b) => b.props.label === 'Volver al inicio');

    await act(async () => {
      goHomeButton!.props.onPress();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
