import { bandQuotas, pickBalanced, PlacementQuestionSelectionService } from './placement-question-selection.service';

function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t * 1664525 + 1013904223) % 4294967296;
    return t / 4294967296;
  };
}

const bank = (perBand: number[]) =>
  perBand.flatMap((n, b) => Array.from({ length: n }, (_, i) => ({ id: `b${b + 1}-${i}`, difficulty: b + 1 })));

describe('placement question draw', () => {
  it('splits 9 questions over four bands as 2/3/2/2', () => {
    expect(bandQuotas(9, [10, 9, 10, 7])).toEqual([2, 3, 2, 2]);
  });

  it('never asks a band for more than it has and still reaches the count', () => {
    const q = bandQuotas(8, [1, 9, 10, 7]);
    expect(q.reduce((a, b) => a + b, 0)).toBe(8);
    expect(q[0]).toBeLessThanOrEqual(1);
  });

  it('draws the requested count, no duplicates, easiest first', () => {
    const picked = pickBalanced(bank([10, 9, 10, 7]), 9, seeded(1));
    expect(picked).toHaveLength(9);
    expect(new Set(picked.map((p) => p.id)).size).toBe(9);
    const diffs = picked.map((p) => p.difficulty);
    expect([...diffs].sort()).toEqual(diffs);
    expect(diffs.filter((d) => d === 4)).toHaveLength(2);
  });

  it('gives different students different questions', () => {
    const a = pickBalanced(bank([10, 9, 10, 7]), 9, seeded(1)).map((p) => p.id).join();
    const b = pickBalanced(bank([10, 9, 10, 7]), 9, seeded(2)).map((p) => p.id).join();
    const c = pickBalanced(bank([10, 9, 10, 7]), 9, seeded(3)).map((p) => p.id).join();
    expect(new Set([a, b, c]).size).toBeGreaterThan(1);
  });

  it('returns the whole bank when draw_count is null or larger than the bank', () => {
    expect(pickBalanced(bank([2, 2, 1, 1]), null)).toHaveLength(6);
    expect(pickBalanced(bank([2, 2, 1, 1]), 20)).toHaveLength(6);
  });

  it('stores the draw once and is a no-op if the attempt already has one', async () => {
    const inserts: unknown[][] = [];
    const db = {
      query: jest.fn(async (sql: string, params: unknown[] = []) => {
        if (sql.includes('COUNT(*)::text')) return { rows: [{ n: inserts.length ? '5' : '0' }] };
        if (sql.includes('FROM placement_sections')) return { rows: [{ id: 's1', draw_count: 2 }, { id: 's2', draw_count: null }] };
        if (sql.includes('FROM placement_questions')) {
          return { rows: params[0] === 's1' ? bank([2, 2, 2, 2]).map((q) => ({ id: `s1-${q.id}`, difficulty: q.difficulty })) : [{ id: 'w1', difficulty: 2 }] };
        }
        if (sql.startsWith('INSERT INTO placement_attempt_questions')) {
          inserts.push(params);
          return { rows: [] };
        }
        return { rows: [] };
      }),
    };
    const svc = new PlacementQuestionSelectionService(db as never);
    await svc.drawForAttempt('att1', 't1', seeded(5));
    expect(inserts).toHaveLength(3); // 2 from s1 + the single question of s2
    expect(inserts.map((i) => i[3])).toEqual([1, 2, 3]);
    await svc.drawForAttempt('att1', 't1');
    expect(inserts).toHaveLength(3);
  });
});
