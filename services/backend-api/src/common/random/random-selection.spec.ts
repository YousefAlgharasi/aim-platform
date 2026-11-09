import { pickPreferringUnseen, seededRandom, shuffled } from './random-selection';

describe('random-selection', () => {
  it('seededRandom is deterministic per seed and differs across seeds', () => {
    const a = seededRandom('x');
    const b = seededRandom('x');
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(seededRandom('x')()).not.toBe(seededRandom('y')());
  });

  it('shuffled keeps every element and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffled(input, seededRandom('s'));
    expect(out.slice().sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('pickPreferringUnseen returns unique items and prefers unseen ones', () => {
    const pool = Array.from({ length: 10 }, (_, i) => ({ id: `q${i}` }));
    const seen = new Map<string, number>([['q0', 5], ['q1', 6], ['q2', 7], ['q3', 8]]);
    for (let n = 0; n < 50; n++) {
      const picked = pickPreferringUnseen(pool, 6, seen);
      expect(new Set(picked.map((p) => p.id)).size).toBe(6);
      expect(picked.every((p) => !seen.has(p.id))).toBe(true); // 6 unseen exist
    }
  });

  it('falls back to the least recently seen items once unseen run out', () => {
    const pool = Array.from({ length: 5 }, (_, i) => ({ id: `q${i}` }));
    const seen = new Map<string, number>([['q0', 1], ['q1', 2], ['q2', 3], ['q3', 4], ['q4', 5]]);
    const ids = pickPreferringUnseen(pool, 2, seen).map((p) => p.id).sort();
    expect(ids).toEqual(['q0', 'q1']);
  });

  it('returns the whole pool (shuffled) when it is not larger than the count', () => {
    const pool = [{ id: 'a' }, { id: 'b' }];
    expect(pickPreferringUnseen(pool, 5, new Map()).map((p) => p.id).sort()).toEqual(['a', 'b']);
  });
});
