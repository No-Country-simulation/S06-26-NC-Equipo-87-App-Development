import { render, screen } from '@testing-library/react';
import App from './App';
import { expect, test } from 'vitest';

test('renders get started heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Get started/i);
  expect(headingElement).toBeInTheDocument();
});
