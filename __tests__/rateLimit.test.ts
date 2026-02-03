/* @vitest-environment node */
import { describe, it, expect } from 'vitest';
import { withinRate } from '../server/lib/rateLimit.js';

describe('rate limiter', () => {
  it('limits after max count within window', () => {
    const buckets = new Map();
    for (let i = 0; i < 3; i += 1) {
      expect(withinRate(buckets, 'a', 2, 1000)).toBe(i < 2);
    }
  });
});
