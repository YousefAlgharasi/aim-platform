jest.mock('react-router-dom', () => ({ Link: ({ children }: { children: unknown }) => children, useNavigate: () => jest.fn() }));

import { bandOf, effectiveBand, relationTo } from '../features/level/bands';
import { pickNewlyFixed } from '../features/improve/FixedCelebration';
import { weekFacts } from '../features/improve/WeeklyRecap';
import { categoryOf } from '../features/improve/ImprovePage';
import type { StudentCourse } from '../features/curriculum/curriculumApi';

const course = (levelCode: string, lessonCount: number, completedLessonCount: number) =>
  ({ courseId: levelCode, levelCode, lessonCount, completedLessonCount }) as StudentCourse;

describe('learner level', () => {
  it('reads CEFR codes and placement words', () => {
    expect(bandOf('a2-foundation')).toBe('A2');
    expect(bandOf('upper_intermediate')).toBe('B2');
    expect(bandOf(null)).toBeNull();
  });
  it('placement above progress wins (tested into B1, no lessons done)', () => {
    expect(effectiveBand('B1', [course('A1', 10, 0), course('B1', 10, 0)])).toBe('B1');
  });
  it('finished A1 moves the level to A2 without a placement test', () => {
    expect(effectiveBand(null, [course('A1', 10, 10), course('A2', 10, 2)])).toBe('A2');
  });
  it('no placement and no progress: unknown', () => {
    expect(effectiveBand(null, [course('A1', 10, 0)])).toBeNull();
  });
  it('compares a course with the level', () => {
    expect(relationTo('A1', 'A2')).toBe('passed');
    expect(relationTo('A2', 'A2')).toBe('current');
    expect(relationTo('B1', 'A2')).toBe('ahead');
    expect(relationTo('A1', null)).toBe('unknown');
  });
});

describe('improve extras', () => {
  const rec = (id: string, status: string, resolvedAt: string | null = null) =>
    ({ weaknessId: id, skillId: id, status, resolvedAt }) as never;
  it('celebrates only fixes it has not seen, and not on first ever load', () => {
    const records = [rec('a', 'resolved'), rec('b', 'resolved'), rec('c', 'open')];
    expect(pickNewlyFixed(records, null).fresh).toHaveLength(0);
    expect(pickNewlyFixed(records, ['a']).fresh.map((r) => r.weaknessId)).toEqual(['b']);
  });
  it('sums the week', () => {
    const now = Date.parse('2026-11-05T12:00:00Z');
    const f = weekFacts({ weeklyActivity: [{ date: 'x', xp: 10 }, { date: 'y', xp: 0 }, { date: 'z', xp: 5 }], weeklyDeltaPercent: 20 } as never,
      [rec('a', 'resolved', '2026-11-03T00:00:00Z'), rec('b', 'resolved', '2026-10-01T00:00:00Z')], now);
    expect(f).toEqual({ xp: 15, activeDays: 2, delta: 20, fixed: 1 });
  });
  it('groups skills by type', () => {
    expect(categoryOf('skill:english:a1:grammar')).toBe('grammar');
    expect(categoryOf('skill:x:mystery')).toBe('other');
  });
});
