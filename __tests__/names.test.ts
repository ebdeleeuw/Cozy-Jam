/* @vitest-environment node */
import { describe, it, expect } from 'vitest';
import { generateName, resetNameHistory } from '../server/lib/names.js';

describe('name generation', () => {
  it('avoids immediate repeats and active names', () => {
    resetNameHistory();
    const active = new Set<string>();
    const first = generateName(active);
    active.add(first);
    const second = generateName(active);
    expect(second).not.toBe(first);
  });
});
