import { NotFoundException } from '@nestjs/common';
import { AdminBroadcastService } from './admin-broadcast.service';
import { NotificationRepository } from './notification.repository';
import { NotificationQueueService } from './notification-queue.service';
import { AdminBroadcastScheduleRow } from './notification-repository.types';

function broadcast(overrides: Partial<AdminBroadcastScheduleRow> = {}): AdminBroadcastScheduleRow {
  return {
    id: 'b1',
    title: 'Hello',
    body: 'World',
    channel: 'in_app',
    audience: 'students',
    schedule: 'once',
    status: 'active',
    ...overrides,
  } as AdminBroadcastScheduleRow;
}

describe('AdminBroadcastService', () => {
  let repo: jest.Mocked<Pick<
    NotificationRepository,
    | 'createBroadcastSchedule'
    | 'findBroadcastScheduleById'
    | 'findUsersByAudience'
    | 'updateBroadcastAfterRun'
    | 'findBroadcastSchedulesPage'
  >>;
  let queue: { enqueue: jest.Mock };
  let service: AdminBroadcastService;

  beforeEach(() => {
    repo = {
      createBroadcastSchedule: jest.fn(),
      findBroadcastScheduleById: jest.fn(),
      findUsersByAudience: jest.fn(),
      updateBroadcastAfterRun: jest.fn(),
      findBroadcastSchedulesPage: jest.fn(),
    };
    queue = { enqueue: jest.fn() };
    service = new AdminBroadcastService(
      repo as unknown as NotificationRepository,
      queue as unknown as NotificationQueueService,
    );
  });

  it('a one-time broadcast is queued for every student straight away', async () => {
    repo.createBroadcastSchedule.mockResolvedValue(broadcast());
    repo.findUsersByAudience.mockResolvedValue([
      { id: 'u1', user_type: 'student' },
      { id: 'u2', user_type: 'student' },
    ]);
    queue.enqueue.mockResolvedValue({ id: 'evt' });

    await service.createAndSend({
      title: 'Hello',
      body: 'World',
      channel: 'in_app',
      audience: 'students',
      schedule: 'once',
      createdBy: 'admin',
    });

    expect(queue.enqueue).toHaveBeenCalledTimes(2);
    expect(queue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        channel: 'in_app',
        templateKey: 'system_broadcast',
        variables: { broadcast_title: 'Hello', broadcast_body: 'World' },
      }),
    );
    expect(repo.updateBroadcastAfterRun).toHaveBeenCalledWith('b1', 2, null);
  });

  it('"run now" finds the broadcast by id, whichever one it is', async () => {
    repo.findBroadcastScheduleById.mockResolvedValue(broadcast({ id: 'older', schedule: 'weekly' }));
    repo.findUsersByAudience.mockResolvedValue([{ id: 'u1', user_type: 'student' }]);
    queue.enqueue.mockResolvedValue({ id: 'evt' });

    const result = await service.fireBroadcastById('older');

    expect(repo.findBroadcastScheduleById).toHaveBeenCalledWith('older');
    expect(result).toEqual({ sent: 1 });
    expect(repo.findBroadcastSchedulesPage).not.toHaveBeenCalled();
  });

  it('"run now" for an unknown broadcast is a 404', async () => {
    repo.findBroadcastScheduleById.mockResolvedValue(null);
    await expect(service.fireBroadcastById('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('a student who turned notifications off is skipped, others still get it', async () => {
    repo.createBroadcastSchedule.mockResolvedValue(broadcast());
    repo.findUsersByAudience.mockResolvedValue([
      { id: 'u1', user_type: 'student' },
      { id: 'u2', user_type: 'student' },
    ]);
    queue.enqueue.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'evt' });

    await service.createAndSend({
      title: 'Hello',
      body: 'World',
      channel: 'in_app',
      audience: 'students',
      schedule: 'once',
      createdBy: null,
    });

    expect(repo.updateBroadcastAfterRun).toHaveBeenCalledWith('b1', 1, null);
  });
});
