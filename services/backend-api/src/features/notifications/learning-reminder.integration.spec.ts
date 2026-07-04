// P20-021: LearningReminderIntegration.createReviewReminder tests.
//
// Covers the fix for a real bug: nextRunAt was previously hardcoded to
// "now", so NotificationRepository.findDueSchedules (WHERE next_run_at <=
// now()) fired every review reminder immediately at creation time instead
// of on the review's actual spaced-repetition dueAt.

import { LearningReminderIntegration } from './learning-reminder.integration';
import { ReminderScheduleService } from './reminder-schedule.service';
import { NotificationQueueService } from './notification-queue.service';

function makeScheduleServiceSpy() {
  return {
    createSchedule: jest.fn().mockResolvedValue({}),
  } as unknown as ReminderScheduleService;
}

function makeQueueServiceStub() {
  return {
    enqueue: jest.fn().mockResolvedValue(null),
  } as unknown as NotificationQueueService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const SCHEDULE_ID = 'sch0e8400-e29b-41d4-a716-446655440030';
const DUE_AT = '2099-12-31T23:59:59.000Z';

describe('LearningReminderIntegration.createReviewReminder', () => {
  it('passes the real dueAt as nextRunAt, not "now"', async () => {
    const scheduleService = makeScheduleServiceSpy();
    const integration = new LearningReminderIntegration(scheduleService, makeQueueServiceStub());

    await integration.createReviewReminder(STUDENT_ID, SCHEDULE_ID, DUE_AT);

    expect(scheduleService.createSchedule).toHaveBeenCalledWith(
      STUDENT_ID,
      'student',
      'review',
      expect.any(String),
      DUE_AT,
    );
  });

  it('derives the cron expression from dueAt (minute/hour/day/month match)', async () => {
    const scheduleService = makeScheduleServiceSpy();
    const integration = new LearningReminderIntegration(scheduleService, makeQueueServiceStub());

    await integration.createReviewReminder(STUDENT_ID, SCHEDULE_ID, DUE_AT);

    const date = new Date(DUE_AT);
    const expectedCron = `${date.getUTCMinutes()} ${date.getUTCHours()} ${date.getUTCDate()} ${date.getUTCMonth() + 1} *`;
    expect(scheduleService.createSchedule).toHaveBeenCalledWith(
      STUDENT_ID,
      'student',
      'review',
      expectedCron,
      DUE_AT,
    );
  });

  it('scopes the schedule to the given student as owner', async () => {
    const scheduleService = makeScheduleServiceSpy();
    const integration = new LearningReminderIntegration(scheduleService, makeQueueServiceStub());

    await integration.createReviewReminder(STUDENT_ID, SCHEDULE_ID, DUE_AT);

    expect(scheduleService.createSchedule).toHaveBeenCalledWith(
      STUDENT_ID,
      'student',
      expect.any(String),
      expect.any(String),
      expect.any(String),
    );
  });
});
