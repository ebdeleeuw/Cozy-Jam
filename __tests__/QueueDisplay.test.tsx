import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QueueDisplay from '../components/QueueDisplay';

const queue = [
  { id: 'a', name: 'Quiet Owl', avatarColor: 'bg-rose-200' },
  { id: 'b', name: 'Warm Tea', avatarColor: 'bg-sky-200' },
];

describe('QueueDisplay', () => {
  it('shows You for the local user', () => {
    render(<QueueDisplay queue={queue} currentUserId="b" />);
    expect(screen.getByText('You')).toBeInTheDocument();
  });
});
