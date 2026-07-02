import React, { useState } from 'react';
import { Input } from '../../../shared/components/atoms/Input';
import { Button } from '../../../shared/components/atoms/Button';
import { Typography } from '../../../shared/components/atoms/Typography';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
  externalError: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  loading,
  externalError,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setValidationError('Por favor ingrese Correo corporativo y Contraseña.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('Por favor, ingrese un correo corporativo válido.');
      return;
    }

    const pinRegex = /^\d{4}$/;
    if (pinRegex.test(password.trim())) {
      setValidationError('La contraseña debe ser alfanumérica y no un PIN de 4 dígitos.');
      return;
    }

    setValidationError(null);
    try {
      await onLogin(email.trim(), password.trim());
    } catch {
      // Catch error
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setValidationError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setValidationError(null);
  };

  const handleTogglePassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const activeError = validationError || externalError;

  return (
    <form className="opscore-login-form" onSubmit={handleSubmit} data-testid="login-form">
      <div className="opscore-form-group">
        <label htmlFor="identifier-input" className="opscore-form-label">
          Correo corporativo
        </label>
        <Input
          id="identifier-input"
          data-testid="identifier-input"
          variant="light"
          type="text"
          placeholder="nombre@opscore.io"
          value={email}
          onChange={handleEmailChange}
          disabled={loading}
          autoComplete="username"
          autoFocus
        />
      </div>

      <div className="opscore-form-group">
        <label htmlFor="password-input" className="opscore-form-label">
          Contraseña
        </label>
        <div className="opscore-password-wrapper">
          <Input
            id="password-input"
            data-testid="password-input"
            variant="light"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
            className="opscore-input-with-suffix"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="opscore-password-toggle"
            onClick={handleTogglePassword}
            disabled={loading}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {activeError && (
        <Typography
          variant="caption"
          className="opscore-error-text"
          data-testid="error-message"
        >
          {activeError}
        </Typography>
      )}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        className="opscore-button-submit"
        data-testid="login-button"
      >
        Iniciar sesión
      </Button>
    </form>
  );
};


