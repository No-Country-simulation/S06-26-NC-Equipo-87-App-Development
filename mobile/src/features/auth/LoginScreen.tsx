import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import designTokens from '../../shared/theme/designTokens.json';
import { postRequest, ApiError } from '../../shared/api/apiClient';
import { saveToken } from '../../shared/auth/tokenService';
import { Logo } from '../../shared/components/Logo';
import { Typography } from '../../shared/components/atoms/Typography';

interface LoginScreenProps {
  onLoginSuccess: (token: string) => void;
}

interface LoginResponse {
  token?: string;
  Token?: string;
}

export const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Por favor ingrese Número de empleado y PIN.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await postRequest<{ Identifier: string; Password: string }, LoginResponse>(
        '/api/authentication/login',
        {
          Identifier: identifier.trim(),
          Password: password,
        }
      );
      const tokenVal = response?.token || response?.Token;
      if (!tokenVal) {
        throw { message: 'Authentication response did not contain a valid session token.' };
      }
      await saveToken(tokenVal);
      onLoginSuccess(tokenVal);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.errors) {
        const firstErrorKey = Object.keys(apiErr.errors)[0];
        const messages = apiErr.errors[firstErrorKey];
        setError(messages && messages.length > 0 ? messages[0] : apiErr.message);
      } else {
        setError(apiErr.message || 'Error al iniciar sesión. Verifique sus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Logo size={26} color="#9A9890" />
            </View>
            <Typography variant="display" color={designTokens.colors['text-on-dark']} style={styles.title}>
              OpsCore
            </Typography>
            <Typography variant="caption" color={designTokens.colors['text-muted']} style={styles.subtitle}>
              Sistema de gestión de incidentes
            </Typography>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Número de empleado"
                placeholderTextColor={designTokens.colors['text-muted']}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
                autoFocus={true}
                returnKeyType="done"
                editable={!loading}
                testID="identifier-input"
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="PIN de acceso"
                placeholderTextColor={designTokens.colors['text-muted']}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
                maxLength={4}
                returnKeyType="done"
                editable={!loading}
                testID="password-input"
              />
            </View>

            {error && (
              <Typography variant="caption" color={designTokens.colors['status-open']} style={styles.errorText} testID="error-message">
                {error}
              </Typography>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              testID="login-button"
            >
              {loading ? (
                <ActivityIndicator color={designTokens.colors['background-dark']} />
              ) : (
                <Typography variant="label" color={designTokens.colors['background-dark']}>
                  Ingresar
                </Typography>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: designTokens.colors['background-dark'],
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  logoContainer: {
    width: 52,
    height: 52,
    backgroundColor: designTokens.colors['surface-dark-card'],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'transparent',
  },
  inputGroup: {
    marginBottom: 12,
  },
  input: {
    height: 52,
    backgroundColor: designTokens.colors['surface-dark-card'],
    borderColor: designTokens.colors['border-dark'],
    borderWidth: 1.25,
    borderRadius: 10,
    paddingHorizontal: 17,
    color: designTokens.colors['text-on-dark'],
    fontSize: 13,
    // Custom font handled via TextInput style would need font aliasing too if we want IBM Plex here.
    // However, the spec primarily focused on Typography component.
    // For completeness, we should probably add it here too if designTokens specify it.
    fontFamily: Platform.OS === 'android' ? 'IBMPlexSans' : 'IBMPlexSans',
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    height: 56,
    backgroundColor: designTokens.colors['text-on-dark'],
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
});

