import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';

describe('UI Atoms', () => {
  it('renders Card with children', () => {
    render(<Card data-testid="card">Card Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Card Content');
  });

  it('renders Button with variants', () => {
    render(<Button data-testid="btn-primary" variant="primary">Primary</Button>);
    const btn = screen.getByTestId('btn-primary');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Primary');
    expect(btn.style.backgroundColor).toBe('rgb(29, 33, 37)'); // #1d2125
  });

  it('renders Badge with variants', () => {
    render(<Badge data-testid="badge-danger" variant="danger">Danger</Badge>);
    const badge = screen.getByTestId('badge-danger');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Danger');
    expect(badge.style.backgroundColor).toBe('rgb(255, 235, 230)'); // #ffebe6
  });
});
