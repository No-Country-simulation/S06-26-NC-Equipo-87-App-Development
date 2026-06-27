import React, { useState } from 'react';
import { Logo } from '../../shared/components/molecules/Logo';
import { Typography } from '../../shared/components/atoms/Typography';
import { LoginForm } from './components/LoginForm';
import { postRequest, type ApiError } from '../../shared/api/apiClient';
import { saveToken } from '../../shared/auth/tokenService';
import { decodeJwt } from '../../shared/auth/jwtDecoder';

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: Record<string, unknown> | null) => void;
}

interface LoginResponse {
  token?: string;
  Token?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (identifier: string, pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postRequest<{ Identifier: string; Password: string }, LoginResponse>(
        '/api/authentication/login',
        {
          Identifier: identifier,
          Password: pin,
        }
      );
      const tokenVal = response?.token || response?.Token;
      if (!tokenVal) {
        throw new Error('Authentication response did not contain a valid session token.');
      }
      await saveToken(tokenVal);
      const decoded = decodeJwt(tokenVal);
      onLoginSuccess(tokenVal, decoded);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      let errorMessage = 'Error al iniciar sesión. Verifique sus credenciales.';
      if (apiErr.errors) {
        const firstErrorKey = Object.keys(apiErr.errors)[0];
        const messages = apiErr.errors[firstErrorKey];
        errorMessage = messages && messages.length > 0 ? messages[0] : apiErr.message;
      } else if (apiErr.message) {
        errorMessage = apiErr.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="opscore-login-page">
      <div className="opscore-login-left">
        <div className="opscore-login-left-content">
          <div className="opscore-login-brand-header">
            <Logo size={24} color="#E8E6DF" />
            <span className="opscore-login-title">OpsCore</span>
          </div>
          <div className="opscore-login-headline-container">
            <h2 className="opscore-login-headline">
              Sistema de gestión de incidentes
            </h2>
          </div>
          <div className="opscore-login-footer">
            <Typography variant="caption" color="#888780">
              © 2026 OpsCore — Operations Consulting
            </Typography>
          </div>
        </div>
      </div>
      <div className="opscore-login-right">
        <div className="opscore-login-right-content">
          <div className="opscore-login-form-header">
            <Typography variant="micro" color="#888780" className="opscore-login-section-tag">
              ACCESO GERENCIAL
            </Typography>
            <h1 className="opscore-login-main-title">Iniciar sesión</h1>
            <Typography variant="body" color="#5F5E5A" className="opscore-login-main-subtitle">
              Ingresa con tus credenciales corporativas
            </Typography>
          </div>

          <LoginForm
            onLogin={handleLogin}
            loading={loading}
            externalError={error}
          />

          <div className="opscore-login-form-footer">
            <Typography variant="caption" color="#888780" component="div">
              ¿Necesitas acceso?
            </Typography>
            <Typography variant="caption" color="#888780" component="div" className="opscore-login-contact">
              Contacta a tu administrador de planta
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

