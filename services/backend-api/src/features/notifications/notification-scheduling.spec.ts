import { ReminderScheduleService } from './reminder-schedule.service';
import { NotificationEligibilityService } from './notification-eligibility.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationRepository } from './notification.repository';

describe('ReminderScheduleService', () => {
  let service: ReminderScheduleService;
  let mockRepo: Partial<NotificationRepository>;

  beforeEach(() => {
    mockRepo = {
      createReminderSchedule: jest.fn().mockResolvedValue({
        id: 'sched-1',
        user_id: 'user-1',
        reminder_type: 'learning_plan',
        status: 'active',
        cron_expression: '0 9 * * *',
        reference_id: 'plan-1',
        next_fire_at: null,
        last_fired_at: null,
        ends_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      findActiveSchedulesByUserId: jest.fn().mockResolvedValue([]),
      updateScheduleStatus: jest.fn().mockResolvedValue({
        id: 'sched-1',
        status: 'paused',
      }),
      findDueSchedules: jest.fn().mockResolvedValue([]),
    };

    service = new ReminderScheduleService(mockRepo as NotificationRepository);
  });

  it('creates a valid schedule', async () => {
    const result = await service.createSchedule('user-1', 'learning_plan', '0 9 * * *', 'plan-1', null, null);
    expect(result.reminder_type).toBe('learning_plan');
    expect(mockRepo.createReminderSchedule).toHaveBeenCalledWith(
      'user-1', 'learning_plan', '0 9 * * *', 'plan-1', null, null,
    );
  });

  it('rejects invalid reminder type', async () => {
    await expect(service.createSchedule('user-1', 'invalid_type', '0 9 * * *', null, null, null))
      .rejects.toThrow('Invalid reminder type');
  });

  it('rejects invalid cron expression', async () => {
    await expect(service.createSchedule('user-1', 'learning_plan', '* *', null, null, null))
      .rejects.toThrow('Invalid cron expression');
  });

  it('pauses a schedule', async () => {
    const result = await service.pauseSchedule('sched-1', 'user-1');
    expect(mockRepo.updateScheduleStatus).toHaveBeenCalledWith('sched-1', 'user-1', 'paused');
  });

  it('gets due schedules', async () => {
    await service.getDueSchedules(10);
    expect(mockRepo.findDueSchedules).toHaveBeenCalledWith(10);
  });
});

describe('NotificationEligibilityService', () => {
  let service: NotificationEligibilityService;
  let mockPreferenceService: Partial<NotificationPreferenceService>;
  let mockRepo: Partial<NotificationRepository>;

  beforeEach(() => {
    mockPreferenceService = {
      isEnabled: jest.fn().mockResolvedValue(true),
    };
    mockRepo = {
      findQuietHoursByUserId: jest.fn().mockResolvedValue(null),
    };
    service = new NotificationEligibilityService(
      mockPreferenceService as NotificationPreferenceService,
      mockRepo as NotificationRepository,
    );
  });

  it('allows when preference enabled and no quiet hours', async () => {
    const result = await service.checkEligibility('user-1', 'push', 'learning_reminder');
    expect(result.eligible).toBe(true);
  });

  it('rejects when preference disabled', async () => {
    (mockPreferenceService.isEnabled as jest.Mock).mockResolvedValue(false);
    const result = await service.checkEligibility('user-1', 'push', 'learning_reminder');
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('preference_disabled');
  });

  it('rejects during quiet hours', async () => {
    (mockRepo.findQuietHoursByUserId as jest.Mock).mockResolvedValue({
      enabled: true,
      start_time: '00:00',
      end_time: '23:59',
      timezone: 'UTC',
    });
    const result = await service.checkEligibility('user-1', 'push', 'learning_reminder');
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('quiet_hours');
  });

  it('allows when quiet hours disabled', async () => {
    (mockRepo.findQuietHoursByUserId as jest.Mock).mockResolvedValue({
      enabled: false,
      start_time: '22:00',
      end_time: '07:00',
      timezone: 'UTC',
    });
    const result = await service.checkEligibility('user-1', 'push', 'learning_reminder');
    expect(result.eligible).toBe(true);
  });
});
