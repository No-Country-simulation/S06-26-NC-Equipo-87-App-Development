import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { expect, test } from 'vitest';

test('increments counter on button click', async () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /Count is 0/i });
  expect(buttonElement).toBeInTheDocument();

  fireEvent.click(buttonElement);
  expect(buttonElement).toHaveTextContent(/Count is 1/i);

  fireEvent.click(buttonElement);
  expect(buttonElement).toHaveTextContent(/Count is 2/i);
});
