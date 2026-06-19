// P8-036: Add Review Schedule Context
// ReviewScheduleContextAdapter tests.

import { ReviewScheduleContextAdapter } from '../adapters/review-schedule-context.adapter';
import { ReviewScheduleReadService } from '../../../aim/result/review-schedule-read.service';

function makeMockReviewScheduleRead(
  getReviewSchedulesForStudent: ReviewScheduleReadService['getReviewSchedulesForStudent'],
) {
  return { getReviewSchedulesForStudent } as unknown as ReviewScheduleReadService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

describe('ReviewScheduleContextAdapter', () => {
  it('maps pending review schedules to skillId, dueAt, status only', async () => {
    const reviewScheduleRead = makeMockReviewScheduleRead(async () => ({
      studentId: STUDENT_ID,
      reviewSchedules: [
        {
          scheduleId: 'schedule-1',
          skillId: 'skill-1',
          dueAt: '2026-06-20T00:00:00Z',
          intervalDays: 3,
          repetitionCount: 2,
          status: 'pending',
          basedOnAttemptId: 'attempt-1',
          scheduledAt: '2026-06-17T00:00:00Z',
          updatedAt: '2026-06-17T00:00:00Z',
        },
      ],
    }));
    const adapter = new ReviewScheduleContextAdapter(reviewScheduleRead);
    const context = await adapter.getReviewScheduleContext(STUDENT_ID);

    expect(context).toEqual([{ skillId: 'skill-1', dueAt: '2026-06-20T00:00:00Z', status: 'pending' }]);
    expect(context?.[0]).not.toHaveProperty('scheduleId');
    expect(context?.[0]).not.toHaveProperty('intervalDays');
    expect(context?.[0]).not.toHaveProperty('repetitionCount');
    expect(context?.[0]).not.toHaveProperty('basedOnAttemptId');
    expect(context?.[0]).not.toHaveProperty('scheduledAt');
    expect(context?.[0]).not.toHaveProperty('updatedAt');
  });

  it('excludes completed review schedules', async () => {
    const reviewScheduleRead = makeMockReviewScheduleRead(async () => ({
      studentId: STUDENT_ID,
      reviewSchedules: [
        {
          scheduleId: 'schedule-1',
          skillId: 'skill-1',
          dueAt: '2026-06-18T00:00:00Z',
          intervalDays: 3,
          repetitionCount: 2,
          status: 'completed',
          basedOnAttemptId: 'attempt-1',
          scheduledAt: '2026-06-15T00:00:00Z',
          updatedAt: '2026-06-18T00:00:00Z',
        },
      ],
    }));
    const adapter = new ReviewScheduleContextAdapter(reviewScheduleRead);
    const context = await adapter.getReviewScheduleContext(STUDENT_ID);
    expect(context).toBeNull();
  });

  it('returns null when the student has no review schedules', async () => {
    const reviewScheduleRead = makeMockReviewScheduleRead(async () => ({
      studentId: STUDENT_ID,
      reviewSchedules: [],
    }));
    const adapter = new ReviewScheduleContextAdapter(reviewScheduleRead);
    const context = await adapter.getReviewScheduleContext(STUDENT_ID);
    expect(context).toBeNull();
  });

  it('passes studentId through to ReviewScheduleReadService.getReviewSchedulesForStudent unchanged', async () => {
    const calls: string[] = [];
    const reviewScheduleRead = makeMockReviewScheduleRead(async (id) => {
      calls.push(id);
      return { studentId: id, reviewSchedules: [] };
    });
    const adapter = new ReviewScheduleContextAdapter(reviewScheduleRead);
    await adapter.getReviewScheduleContext(STUDENT_ID);
    expect(calls).toEqual([STUDENT_ID]);
  });
});
