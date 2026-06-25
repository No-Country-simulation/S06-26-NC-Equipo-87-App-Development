import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { TextInput, TouchableOpacity } from 'react-native';
import { LoginScreen } from '../LoginScreen';
import { postRequest } from '../../../shared/api/apiClient';
import { saveToken } from '../../../shared/auth/tokenService';

jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    setItemAsync: jest.fn((key, value) => {
      store[key] = value;
      return Promise.resolve();
    }),
    getItemAsync: jest.fn((key) => {
      return Promise.resolve(store[key] || null);
    }),
    deleteItemAsync: jest.fn((key) => {
      delete store[key];
      return Promise.resolve();
    }),
  };
});

jest.mock('../../../shared/api/apiClient', () => ({
  postRequest: jest.fn(),
}));

jest.mock('../../../shared/auth/tokenService', () => ({
  saveToken: jest.fn(),
  getToken: jest.fn(),
  deleteToken: jest.fn(),
}));

describe('<LoginScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('verifies tap target heights are >= 48px', async () => {
    // Arrange
    let renderResult: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderResult = renderer.create(<LoginScreen onLoginSuccess={jest.fn()} />);
    });

    // Act
    const inputs = renderResult!.root.findAllByType(TextInput);
    const buttons = renderResult!.root.findAllByType(TouchableOpacity);

    // Assert
    expect(inputs.length).toBe(2);
    inputs.forEach((input) => {
      const style = input.props.style;
      const height = Array.isArray(style)
        ? style.reduce((acc, curr) => ({ ...acc, ...curr }), {}).height
        : style.height;
      expect(height).toBeGreaterThanOrEqual(48);
    });

    expect(buttons.length).toBe(1);
    buttons.forEach((button) => {
      const style = button.props.style;
      const height = Array.isArray(style)
        ? style.reduce((acc, curr) => ({ ...acc, ...curr }), {}).height
        : style.height;
      expect(height).toBeGreaterThanOrEqual(48);
    });
  });

  it('shows error when submitting empty fields', async () => {
    // Arrange
    let renderResult: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderResult = renderer.create(<LoginScreen onLoginSuccess={jest.fn()} />);
    });

    // Act
    const button = renderResult!.root.findByProps({ testID: 'login-button' });
    await act(async () => {
      button.props.onPress();
    });

    // Assert
    const errorText = renderResult!.root.findByProps({ testID: 'error-message' });
    expect(errorText.props.children).toBe('Por favor ingrese Número de empleado y PIN.');
  });

  it('uses numeric keyboard for both inputs and limits PIN to 4 digits', async () => {
    // Arrange
    let renderResult: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderResult = renderer.create(<LoginScreen onLoginSuccess={jest.fn()} />);
    });

    // Act
    const identifierInput = renderResult!.root.findByProps({ testID: 'identifier-input' });
    const passwordInput = renderResult!.root.findByProps({ testID: 'password-input' });

    // Assert
    expect(identifierInput.props.keyboardType).toBe('numeric');
    expect(identifierInput.props.autoFocus).toBe(true);
    expect(passwordInput.props.keyboardType).toBe('numeric');
    expect(passwordInput.props.maxLength).toBe(4);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('triggers login and saves token on success', async () => {
    // Arrange
    const mockToken = 'mock-jwt-token';
    const onLoginSuccessMock = jest.fn();
    (postRequest as jest.Mock).mockResolvedValueOnce({ token: mockToken });
    let renderResult: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderResult = renderer.create(<LoginScreen onLoginSuccess={onLoginSuccessMock} />);
    });

    // Act
    const identifierInput = renderResult!.root.findByProps({ testID: 'identifier-input' });
    const passwordInput = renderResult!.root.findByProps({ testID: 'password-input' });
    const button = renderResult!.root.findByProps({ testID: 'login-button' });

    await act(async () => {
      identifierInput.props.onChangeText('0012');
      passwordInput.props.onChangeText('8421');
    });

    await act(async () => {
      await button.props.onPress();
    });

    // Assert
    expect(postRequest).toHaveBeenCalledWith('/api/authentication/login', {
      Identifier: '0012',
      Password: '8421',
    });
    expect(saveToken).toHaveBeenCalledWith(mockToken);
    expect(onLoginSuccessMock).toHaveBeenCalledWith(mockToken);
  });
});
