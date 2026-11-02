import { computeUnlockFrontier, isRankUnlocked } from './course-unlock.util';

describe('computeUnlockFrontier', () => {
  it('no placement and nothing started: only the first course is open', () => {
    expect(computeUnlockFrontier({ ceiling: null, startedMax: null, completedMax: null })).toBe(1);
  });

  it('placed at rank 5, nothing started: can start rank 5 or lower', () => {
    const f = computeUnlockFrontier({ ceiling: 5, startedMax: null, completedMax: null });
    expect(f).toBe(5);
    expect(isRankUnlocked(5, f)).toBe(true);
    expect(isRankUnlocked(1, f)).toBe(true);
    expect(isRankUnlocked(6, f)).toBe(false);
  });

  it('placed at 5 but started rank 1: everything after rank 1 is locked', () => {
    const f = computeUnlockFrontier({ ceiling: 5, startedMax: 1, completedMax: null });
    expect(f).toBe(1);
    expect(isRankUnlocked(2, f)).toBe(false);
    expect(isRankUnlocked(5, f)).toBe(false);
  });

  it('finishing the course that was started opens exactly the next one', () => {
    expect(computeUnlockFrontier({ ceiling: 5, startedMax: 1, completedMax: 1 })).toBe(2);
    expect(computeUnlockFrontier({ ceiling: 5, startedMax: 2, completedMax: 2 })).toBe(3);
  });

  it('started at the placed level: next one stays locked until it is finished', () => {
    expect(computeUnlockFrontier({ ceiling: 5, startedMax: 5, completedMax: null })).toBe(5);
    expect(computeUnlockFrontier({ ceiling: 5, startedMax: 5, completedMax: 5 })).toBe(6);
  });

  it('courses without a rank are never locked', () => {
    expect(isRankUnlocked(null, 1)).toBe(true);
  });
});
