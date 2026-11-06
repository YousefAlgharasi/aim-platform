import { currentReviewPerSkill, type ReviewScheduleEntry } from '../features/progress/aimApi';

jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));

const entry = (id: string, skillId: string, scheduledAt: string, status = 'pending'): ReviewScheduleEntry => ({
  scheduleId: id, skillId, dueAt: scheduledAt, intervalDays: 1, repetitionCount: 0, status,
  basedOnAttemptId: 'a', scheduledAt, updatedAt: scheduledAt,
});

describe('currentReviewPerSkill', () => {
  it('keeps one review per skill: the most recently scheduled', () => {
    const rows = [
      entry('1', 'short_vowels', '2026-11-03T21:00:00Z'),
      entry('3', 'short_vowels', '2026-11-05T07:00:00Z'),
      entry('2', 'short_vowels', '2026-11-04T10:00:00Z'),
      entry('4', 'letters', '2026-11-03T22:00:00Z'),
    ];
    const out = currentReviewPerSkill(rows);
    expect(out).toHaveLength(2);
    expect(out.find((e) => e.skillId === 'short_vowels')?.scheduleId).toBe('3');
    expect(out.find((e) => e.skillId === 'letters')?.scheduleId).toBe('4');
  });

  it('shows a skill as completed only when its latest schedule is the completed one', () => {
    const out = currentReviewPerSkill([entry('old', 'a', '2026-11-01T00:00:00Z', 'completed'), entry('new', 'a', '2026-11-02T00:00:00Z', 'pending')]);
    expect(out).toHaveLength(1);
    expect(out[0].status).toBe('pending');
  });

  it('handles an empty list', () => {
    expect(currentReviewPerSkill([])).toEqual([]);
  });
});
