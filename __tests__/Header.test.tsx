import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';

const activePlayer = { id: 'x', name: 'Quiet Owl', avatarColor: 'bg-rose-200' };

describe('Header', () => {
  it('shows Live status when ws is open', () => {
    render(
      <Header
        activePlayer={activePlayer}
        timeRemaining={20}
        midiConnected={false}
        wsStatus="open"
      />
    );
    expect(screen.getByText('Live')).toBeInTheDocument();
  });
});
