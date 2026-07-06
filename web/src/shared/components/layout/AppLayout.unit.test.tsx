import { render, screen, fireEvent } from '@testing-library/react';
import { AppLayout } from './AppLayout';
import { expect, test, vi, beforeEach } from 'vitest';

vi.mock('../../../features/incidents/stores/useWebIncidentStore', () => ({
  useWebIncidentStore: () => ({
    openCount: 3,
  }),
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

test('renders AppLayout and handles confirm/cancel logout flow', () => {
  const onLogoutMock = vi.fn();
  const userMock = {
    role: 'Plant Manager',
    firstName: 'Roberto',
    lastName: 'Vazquez',
  };

  render(
    <AppLayout user={userMock} onLogout={onLogoutMock}>
      <div>Test Child Content</div>
    </AppLayout>
  );

  expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Cerrar sesión'));
  expect(screen.getByText('Estás a punto de salir de tu cuenta. ¿Deseas continuar?')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Sí, salir' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(screen.queryByText('Estás a punto de salir de tu cuenta. ¿Deseas continuar?')).not.toBeInTheDocument();
  expect(onLogoutMock).not.toHaveBeenCalled();

  fireEvent.click(screen.getByText('Cerrar sesión'));
  expect(screen.getByText('Estás a punto de salir de tu cuenta. ¿Deseas continuar?')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
  expect(screen.queryByText('Estás a punto de salir de tu cuenta. ¿Deseas continuar?')).not.toBeInTheDocument();
  expect(onLogoutMock).not.toHaveBeenCalled();

  fireEvent.click(screen.getByText('Cerrar sesión'));
  fireEvent.click(screen.getByRole('button', { name: 'Sí, salir' }));
  expect(onLogoutMock).toHaveBeenCalledTimes(1);
});
