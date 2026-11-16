import { describe, expect, it } from 'vitest';
import { scatterPieces, seededRandom } from './placement';

describe('seededRandom', () => {
  it('gives the same numbers for the same seed', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays between 0 and 1', () => {
    const random = seededRandom(7);
    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('scatterPieces', () => {
  it('always gives the same layout for the same topping', () => {
    expect(scatterPieces('pepperoni', 10, 1, 0.3)).toEqual(scatterPieces('pepperoni', 10, 1, 0.3));
  });

  it('gives different layouts for different toppings', () => {
    expect(scatterPieces('pepperoni', 10, 1, 0.3)).not.toEqual(scatterPieces('olives', 10, 1, 0.3));
  });

  it('places the requested number of pieces inside the circle', () => {
    const pieces = scatterPieces('mushrooms', 12, 1.1, 0.25);
    expect(pieces).toHaveLength(12);
    for (const piece of pieces) {
      expect(Math.hypot(piece.x, piece.z)).toBeLessThanOrEqual(1.1);
    }
  });
});
