import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReactionZone from '../components/ReactionZone';

describe('ReactionZone', () => {
  it('calls onReact when a reaction is clicked', async () => {
    const onReact = vi.fn();
    const user = userEvent.setup();

    const { getByTitle } = render(
      <ReactionZone canReact particles={[]} onReact={onReact} />
    );

    await user.click(getByTitle('Send Love'));
    expect(onReact).toHaveBeenCalled();
  });
});
