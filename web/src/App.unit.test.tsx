import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { expect, test } from 'vitest';

test('renders login fields after initialization', async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.queryByTestId('app-initializing')).not.toBeInTheDocument();
  });

  expect(screen.getByTestId('identifier-input')).toBeInTheDocument();
  expect(screen.getByTestId('password-input')).toBeInTheDocument();
  expect(screen.getByTestId('login-button')).toBeInTheDocument();
});
