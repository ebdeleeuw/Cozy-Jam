import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Visualizer from '../components/Visualizer';

const activePlayer = { id: 'me', name: 'Soft Cloud', avatarColor: 'bg-rose-200' };

describe('Visualizer', () => {
  it('shows You when active player matches current user', () => {
    render(
      <Visualizer
        activePlayer={activePlayer}
        status="playing"
        pulseSignal={{ id: 1, velocity: 0.5 }}
        currentUserId="me"
      />
    );
    expect(screen.getByText('You')).toBeInTheDocument();
  });
});
