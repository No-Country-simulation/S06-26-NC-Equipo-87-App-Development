import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { expect, test, vi, beforeEach } from 'vitest';

const createBase64Url = (obj: Record<string, unknown>) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const MOCK_TOKEN_HEADER = createBase64Url({ alg: 'HS256', typ: 'JWT' });
const MOCK_TOKEN_PAYLOAD = createBase64Url({
  sub: '1',
  unique_name: 'santiagomendoza',
  firstName: 'Santiago',
  lastName: 'Mendoza',
  role: 'Operator',
  areaName: 'Linea 3'
});
const MOCK_TOKEN_SIGNATURE = 'sig';
const MOCK_TOKEN = `${MOCK_TOKEN_HEADER}.${MOCK_TOKEN_PAYLOAD}.${MOCK_TOKEN_SIGNATURE}`;


const MOCK_INCIDENTS = [
  {
    incidentId: 'INC-0001',
    description: 'Falla mecanica en motor principal',
    areaId: 2,
    areaName: 'Línea 3',
    incidentTypeId: 1,
    incidentTypeName: 'Mecanico',
    severityTypeId: 3,
    severityTypeName: 'Alta',
    status: 'Open',
    reportedByUserId: '8',
    reportedByEmployeeId: '0008',
    reportedDate: '2026-06-27T12:00:00.000Z',
  },
];

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

test('successful login and incident loading flow', async () => {
  const globalFetchMock = vi.fn().mockImplementation((url) => {
    if (url.includes('/api/authentication/login')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ Token: MOCK_TOKEN }),
      });
    }
    if (url.includes('/api/incidents')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: MOCK_INCIDENTS,
          currentPage: 1,
          pageSize: 10,
          totalItems: MOCK_INCIDENTS.length,
          totalPages: 1
        }),
      });
    }
    if (url.includes('/api/areas')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ areaId: 2, name: 'Línea 3' }]),
      });
    }
    return Promise.reject(new Error('Unknown URL requested'));
  });
  vi.stubGlobal('fetch', globalFetchMock);

  render(<App />);

  await waitFor(() => {
    expect(screen.queryByTestId('app-initializing')).not.toBeInTheDocument();
  });

  const idInput = screen.getByTestId('identifier-input');
  const passwordInput = screen.getByTestId('password-input');
  const loginButton = screen.getByTestId('login-button');

  fireEvent.change(idInput, { target: { value: 'supervisor@opscore.io' } });
  fireEvent.change(passwordInput, { target: { value: 'SecurePassword123' } });
  fireEvent.click(loginButton);

  await waitFor(() => {
    expect(screen.getByText('Todos los incidentes')).toBeInTheDocument();
    expect(screen.getByText('INC-0001')).toBeInTheDocument();
  });

  expect(screen.getByText('Santiago Mendoza')).toBeInTheDocument();
  expect(screen.getByText('OPERADOR', { selector: '.opscore-user-role' })).toBeInTheDocument();
  expect(screen.getByText('Falla mecanica en motor principal')).toBeInTheDocument();
});
