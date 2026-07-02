import React from 'react';
import { Logo } from '../../shared/components/molecules/Logo';
import { Typography } from '../../shared/components/atoms/Typography';
import { LoginForm } from './components/LoginForm';
import { useWebAuthStore } from './stores/useWebAuthStore';

export const LoginScreen: React.FC = () => {
  const { login, loading, error } = useWebAuthStore();

  const handleLogin = async (identifier: string, pin: string) => {
    await login(identifier, pin);
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
              ¿Necesitas acceso?{' '}
              <span className="opscore-login-contact">
                Contacta a tu administrador de planta
              </span>
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

