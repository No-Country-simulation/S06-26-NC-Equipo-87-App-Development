import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { ActivityIndicator } from 'react-native';
import { OperatorNewIncidentStep1Screen } from '../screens/OperatorNewIncidentStep1Screen';
import { OperatorNewIncidentStep2Screen } from '../screens/OperatorNewIncidentStep2Screen';
import { getRequest } from '../../../shared/api/apiClient';
import { Chip } from '../../../shared/components/atoms/Chip';
import { IncidentTypeCard } from '../../../shared/components/molecules/IncidentTypeCard';
import { SeverityButton } from '../../../shared/components/molecules/SeverityButton';
import { Button } from '../../../shared/components/atoms/Button';
import { Typography } from '../../../shared/components/atoms/Typography';
import { TextArea } from '../../../shared/components/molecules/TextArea';

jest.mock('../../../shared/api/apiClient', () => ({
  getRequest: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('<OperatorNewIncidentStep1Screen />', () => {
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
        <OperatorNewIncidentStep1Screen onBack={jest.fn()} onClose={jest.fn()} onNext={jest.fn()} />
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
        <OperatorNewIncidentStep1Screen onBack={jest.fn()} onClose={jest.fn()} onNext={onNextMock} />
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
        <OperatorNewIncidentStep1Screen onBack={jest.fn()} onClose={jest.fn()} onNext={jest.fn()} />
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

describe('<OperatorNewIncidentStep2Screen />', () => {
  it('renders correctly without initial errors', async () => {
    // Arrange & Act
    let component: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      component = renderer.create(
        <OperatorNewIncidentStep2Screen onBack={jest.fn()} onClose={jest.fn()} onSubmit={jest.fn()} />
      );
    });

    // Assert
    const textArea = component!.root.findByType(TextArea);
    expect(textArea.props.value).toBe('');
    expect(textArea.props.errorMessage).toBeUndefined();
  });

  it('shows error when submitting empty description', async () => {
    // Arrange
    let component: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      component = renderer.create(
        <OperatorNewIncidentStep2Screen onBack={jest.fn()} onClose={jest.fn()} onSubmit={jest.fn()} />
      );
    });
    const button = component!.root.findByType(Button);

    // Act
    await act(async () => {
      button.props.onPress();
    });

    // Assert
    const textArea = component!.root.findByType(TextArea);
    expect(textArea.props.errorMessage).toBe('La descripción es obligatoria para reportar.');
  });

  it('shows error when description is too short', async () => {
    // Arrange
    let component: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      component = renderer.create(
        <OperatorNewIncidentStep2Screen onBack={jest.fn()} onClose={jest.fn()} onSubmit={jest.fn()} />
      );
    });
    const textArea = component!.root.findByType(TextArea);
    const button = component!.root.findByType(Button);

    // Act 1: type a short message
    await act(async () => {
      textArea.props.onChangeText('Short message');
    });

    // Act 2: submit
    await act(async () => {
      button.props.onPress();
    });

    // Assert
    expect(textArea.props.errorMessage).toBe('Ingresa al menos 20 caracteres.');
  });

  it('calls onSubmit when valid description is submitted', async () => {
    // Arrange
    const onSubmitMock = jest.fn();
    let component: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      component = renderer.create(
        <OperatorNewIncidentStep2Screen onBack={jest.fn()} onClose={jest.fn()} onSubmit={onSubmitMock} />
      );
    });
    const textArea = component!.root.findByType(TextArea);
    const button = component!.root.findByType(Button);

    // Act 1: type a valid message (>= 20 chars)
    await act(async () => {
      textArea.props.onChangeText('This is a sufficiently long incident description.');
    });

    // Act 2: submit
    await act(async () => {
      button.props.onPress();
    });

    // Assert
    expect(textArea.props.errorMessage).toBeUndefined();
    expect(onSubmitMock).toHaveBeenCalledWith('This is a sufficiently long incident description.');
  });
});
