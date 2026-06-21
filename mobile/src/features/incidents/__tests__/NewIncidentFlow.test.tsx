import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { ActivityIndicator } from 'react-native';
import { NewIncidentStep1Screen } from '../screens/NewIncidentStep1Screen';
import { getRequest } from '../../../shared/api/apiClient';
import { Chip } from '../../../shared/components/atoms/Chip';
import { IncidentTypeCard } from '../../../shared/components/molecules/IncidentTypeCard';
import { SeverityButton } from '../../../shared/components/molecules/SeverityButton';
import { Button } from '../../../shared/components/atoms/Button';
import { Typography } from '../../../shared/components/atoms/Typography';

jest.mock('../../../shared/api/apiClient', () => ({
  getRequest: jest.fn(),
}));

describe('<NewIncidentStep1Screen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state on mount', async () => {
    // Arrange
    (getRequest as jest.Mock).mockReturnValue(new Promise(() => {}));
    let renderResult: renderer.ReactTestRenderer | null = null;

    // Act
    await act(async () => {
      renderResult = renderer.create(
        <NewIncidentStep1Screen onBack={jest.fn()} onClose={jest.fn()} onNext={jest.fn()} />
      );
    });

    // Assert
    const loading = renderResult!.root.findByProps({ testID: 'step1-loading' }).findByType(ActivityIndicator);
    expect(loading).toBeTruthy();
  });

  it('fetches and renders lookups successfully', async () => {
    // Arrange
    const mockAreas = [
      { id: 10, name: 'Zona Central', status: 'Active' },
      { id: 11, name: 'Línea 5', status: 'Active' },
    ];
    const mockTypes = [
      { id: 20, name: 'Falla mecánica', status: 'Active' },
      { id: 21, name: 'Accidente de trabajo', status: 'Active' },
    ];
    const mockSeverities = [
      { id: 30, name: 'Alto', status: 'Active' },
      { id: 31, name: 'Bajo', status: 'Active' },
    ];

    (getRequest as jest.Mock)
      .mockResolvedValueOnce(mockAreas)
      .mockResolvedValueOnce(mockTypes)
      .mockResolvedValueOnce(mockSeverities);

    const onNextMock = jest.fn();
    let renderResult: renderer.ReactTestRenderer | null = null;

    // Act
    await act(async () => {
      renderResult = renderer.create(
        <NewIncidentStep1Screen onBack={jest.fn()} onClose={jest.fn()} onNext={onNextMock} />
      );
    });

    // Assert
    const chips = renderResult!.root.findAllByType(Chip);
    expect(chips.length).toBe(2);
    expect(chips[0].props.label).toBe('Zona Central');
    expect(chips[1].props.label).toBe('Línea 5');

    const typeCards = renderResult!.root.findAllByType(IncidentTypeCard);
    expect(typeCards.length).toBe(2);
    expect(typeCards[0].props.label).toBe('Falla mecánica');
    expect(typeCards[1].props.label).toBe('Accidente de trabajo');

    const severityButtons = renderResult!.root.findAllByType(SeverityButton);
    expect(severityButtons.length).toBe(2);
    expect(severityButtons[0].props.level).toBe('Alto');
    expect(severityButtons[1].props.level).toBe('Bajo');

    // Act 2
    await act(async () => {
      chips[1].props.onPress();
    });
    await act(async () => {
      typeCards[1].props.onPress();
    });
    await act(async () => {
      severityButtons[1].props.onPress();
    });

    const nextButton = renderResult!.root.findByType(Button);
    await act(async () => {
      nextButton.props.onPress();
    });

    // Assert 2
    expect(onNextMock).toHaveBeenCalledWith(11, 21, 31);
  });

  it('renders error state and retries fetch', async () => {
    // Arrange
    (getRequest as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    let renderResult: renderer.ReactTestRenderer | null = null;

    // Act
    await act(async () => {
      renderResult = renderer.create(
        <NewIncidentStep1Screen onBack={jest.fn()} onClose={jest.fn()} onNext={jest.fn()} />
      );
    });

    // Assert
    const errorText = renderResult!.root.findByProps({ testID: 'step1-error' }).findAllByType(Typography)[0];
    expect(errorText.props.children).toBe('API Error');

    // Arrange 2
    (getRequest as jest.Mock)
      .mockResolvedValueOnce([{ id: 1, name: 'Area 1', status: 'Active' }])
      .mockResolvedValueOnce([{ id: 2, name: 'Type 1', status: 'Active' }])
      .mockResolvedValueOnce([{ id: 3, name: 'Alto', status: 'Active' }]);

    // Act 2
    const retryButton = renderResult!.root.findByProps({ testID: 'step1-retry-button' });
    await act(async () => {
      await retryButton.props.onPress();
    });

    // Assert 2
    const chips = renderResult!.root.findAllByType(Chip);
    expect(chips.length).toBe(1);
    expect(chips[0].props.label).toBe('Area 1');
  });
});
