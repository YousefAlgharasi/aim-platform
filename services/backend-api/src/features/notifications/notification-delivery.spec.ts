import { NotificationDeliveryWorker } from './notification-delivery.worker';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationRetryService } from './notification-retry.service';
import { InAppNotificationService } from './in-app-notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationEventRow } from './notification-repository.types';

function buildEvent(overrides: Partial<NotificationEventRow> = {}): NotificationEventRow {
  return {
    id: 'event-1',
    recipient_id: 'user-1',
    recipient_type: 'student',
    template_id: 'template-1',
    channel: 'in_app',
    category: 'learning_reminder',
    payload: { title: 'Title', body: 'Body' },
    state: 'queued',
    read_at: null,
    dismissed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('NotificationDeliveryWorker', () => {
  let worker: NotificationDeliveryWorker;
  let mockRepo: Partial<NotificationRepository>;
  let mockQueueService: Partial<NotificationQueueService>;
  let mockPushProvider: { send: jest.Mock; validateToken: jest.Mock };
  let mockEmailProvider: { send: jest.Mock };

  beforeEach(() => {
    mockRepo = {
      updateEventStatus: jest.fn().mockResolvedValue(undefined),
      createDeliveryAttempt: jest.fn().mockResolvedValue(undefined),
      findActiveTokensByUserId: jest.fn().mockResolvedValue([]),
    };
    mockQueueService = {
      fetchQueued: jest.fn().mockResolvedValue([]),
    };
    mockPushProvider = {
      send: jest.fn().mockResolvedValue({ success: true }),
      validateToken: jest.fn().mockResolvedValue(true),
    };
    mockEmailProvider = {
      send: jest.fn().mockResolvedValue({ success: true }),
    };

    worker = new NotificationDeliveryWorker(
      mockRepo as NotificationRepository,
      mockQueueService as NotificationQueueService,
      mockPushProvider as any,
      mockEmailProvider as any,
    );
  });

  it('processes an in-app event as an immediate success', async () => {
    (mockQueueService.fetchQueued as jest.Mock).mockResolvedValue([buildEvent({ channel: 'in_app' })]);

    const processed = await worker.processQueue(10);

    expect(processed).toBe(1);
    expect(mockRepo.createDeliveryAttempt).toHaveBeenCalledWith('event-1', 'in_app', 'internal', 'success', 1, null);
    expect(mockRepo.updateEventStatus).toHaveBeenCalledWith('event-1', 'user-1', 'sent');
  });

  it('marks a push event failed when there are no active device tokens', async () => {
    (mockQueueService.fetchQueued as jest.Mock).mockResolvedValue([buildEvent({ channel: 'push' })]);
    (mockRepo.findActiveTokensByUserId as jest.Mock).mockResolvedValue([]);

    await worker.processQueue(10);

    expect(mockRepo.createDeliveryAttempt).toHaveBeenCalledWith(
      'event-1', 'push', 'fcm', 'failed', 1, 'NO_TOKENS',
    );
    expect(mockRepo.updateEventStatus).toHaveBeenCalledWith('event-1', 'user-1', 'failed');
    expect(mockPushProvider.send).not.toHaveBeenCalled();
  });

  it('delivers push successfully when at least one token succeeds', async () => {
    (mockQueueService.fetchQueued as jest.Mock).mockResolvedValue([buildEvent({ channel: 'push' })]);
    (mockRepo.findActiveTokensByUserId as jest.Mock).mockResolvedValue([
      { token: 'token-a' },
      { token: 'token-b' },
    ]);
    mockPushProvider.send
      .mockResolvedValueOnce({ success: false, errorCode: 'INVALID_TOKEN', errorMessage: 'stale' })
      .mockResolvedValueOnce({ success: true });

    await worker.processQueue(10);

    expect(mockPushProvider.send).toHaveBeenCalledTimes(2);
    expect(mockRepo.createDeliveryAttempt).toHaveBeenCalledWith(
      'event-1', 'push', 'fcm', 'failed', 1, 'INVALID_TOKEN',
    );
    expect(mockRepo.createDeliveryAttempt).toHaveBeenCalledWith('event-1', 'push', 'fcm', 'success', 1, null);
    expect(mockRepo.updateEventStatus).toHaveBeenCalledWith('event-1', 'user-1', 'sent');
  });

  it('marks push failed when every token delivery fails', async () => {
    (mockQueueService.fetchQueued as jest.Mock).mockResolvedValue([buildEvent({ channel: 'push' })]);
    (mockRepo.findActiveTokensByUserId as jest.Mock).mockResolvedValue([{ token: 'token-a' }]);
    mockPushProvider.send.mockResolvedValue({ success: false, errorCode: 'PROVIDER_DOWN', errorMessage: 'down' });

    await worker.processQueue(10);

    expect(mockRepo.updateEventStatus).toHaveBeenCalledWith('event-1', 'user-1', 'failed');
    expect(mockRepo.createDeliveryAttempt).not.toHaveBeenCalledWith('event-1', 'push', 'fcm', 'success', 1, null);
  });

  it('delivers email successfully via the email provider', async () => {
    (mockQueueService.fetchQueued as jest.Mock).mockResolvedValue([buildEvent({ channel: 'email' })]);

    await worker.processQueue(10);

    expect(mockEmailProvider.send).toHaveBeenCalled();
    expect(mockRepo.createDeliveryAttempt).toHaveBeenCalledWith('event-1', 'email', 'smtp', 'success', 1, null);
    expect(mockRepo.updateEventStatus).toHaveBeenCalledWith('event-1', 'user-1', 'sent');
  });

  it('marks email failed when the provider reports failure', async () => {
    (mockQueueService.fetchQueued as jest.Mock).mockResolvedValue([buildEvent({ channel: 'email' })]);
    mockEmailProvider.send.mockResolvedValue({ success: false, errorCode: 'BOUNCED', errorMessage: 'invalid address' });

    await worker.processQueue(10);

    expect(mockRepo.createDeliveryAttempt).toHaveBeenCalledWith(
      'event-1', 'email', 'smtp', 'failed', 1, 'BOUNCED',
    );
    expect(mockRepo.updateEventStatus).toHaveBeenCalledWith('event-1', 'user-1', 'failed');
  });

  it('continues processing remaining events when one event throws', async () => {
    (mockQueueService.fetchQueued as jest.Mock).mockResolvedValue([
      buildEvent({ id: 'event-1', channel: 'in_app' }),
      buildEvent({ id: 'event-2', channel: 'in_app' }),
    ]);
    (mockRepo.updateEventStatus as jest.Mock)
      .mockRejectedValueOnce(new Error('db unavailable'))
      .mockResolvedValueOnce(undefined);

    const processed = await worker.processQueue(10);

    expect(processed).toBe(1);
  });
});

describe('NotificationRetryService', () => {
  let service: NotificationRetryService;
  let mockRepo: Partial<NotificationRepository>;

  beforeEach(() => {
    mockRepo = {
      findAttemptsByEventId: jest.fn().mockResolvedValue([]),
      updateEventStatus: jest.fn().mockResolvedValue(undefined),
    };
    service = new NotificationRetryService(mockRepo as NotificationRepository);
  });

  it('allows retry while under the max attempt threshold', async () => {
    (mockRepo.findAttemptsByEventId as jest.Mock).mockResolvedValue([
      { status: 'failed' },
    ]);
    await expect(service.shouldRetry('event-1')).resolves.toBe(true);
  });

  it('blocks retry once the max attempt threshold is reached', async () => {
    (mockRepo.findAttemptsByEventId as jest.Mock).mockResolvedValue([
      { status: 'failed' },
      { status: 'failed' },
      { status: 'failed' },
    ]);
    await expect(service.shouldRetry('event-1')).resolves.toBe(false);
  });

  it('computes exponential backoff capped at the max delay', () => {
    expect(service.getNextRetryDelayMs(1)).toBe(60_000);
    expect(service.getNextRetryDelayMs(2)).toBe(120_000);
    expect(service.getNextRetryDelayMs(3)).toBe(240_000);
    expect(service.getNextRetryDelayMs(20)).toBe(3_600_000);
  });

  it('requeues an event for retry when under the max attempts', async () => {
    (mockRepo.findAttemptsByEventId as jest.Mock).mockResolvedValue([{ status: 'failed' }]);
    const event = buildEvent({ channel: 'push' });

    const result = await service.requeueForRetry(event);

    expect(result).toBe(true);
    expect(mockRepo.updateEventStatus).toHaveBeenCalledWith('event-1', 'user-1', 'queued');
  });

  it('refuses to requeue once max attempts are exhausted', async () => {
    (mockRepo.findAttemptsByEventId as jest.Mock).mockResolvedValue([
      { status: 'failed' },
      { status: 'failed' },
      { status: 'failed' },
    ]);
    const event = buildEvent({ channel: 'push' });

    const result = await service.requeueForRetry(event);

    expect(result).toBe(false);
    expect(mockRepo.updateEventStatus).not.toHaveBeenCalled();
  });
});

describe('InAppNotificationService', () => {
  let service: InAppNotificationService;
  let mockRepo: Partial<NotificationRepository>;

  beforeEach(() => {
    mockRepo = {
      findInAppEventsByUserId: jest.fn().mockResolvedValue([]),
      countUnreadByUserId: jest.fn().mockResolvedValue(0),
      updateEventStatus: jest.fn().mockResolvedValue(buildEvent()),
    };
    service = new InAppNotificationService(
      mockRepo as NotificationRepository,
      { ingest: jest.fn().mockResolvedValue(undefined) } as never,
    );
  });

  it('lists in-app events scoped to the requesting user only', async () => {
    await service.getInbox('user-1', 20, 0);
    expect(mockRepo.findInAppEventsByUserId).toHaveBeenCalledWith('user-1', 20, 0);
  });

  it('marks an event read only for its owning user', async () => {
    await service.markAsRead('event-1', 'user-1');
    expect(mockRepo.updateEventStatus).toHaveBeenCalledWith('event-1', 'user-1', 'read');
  });

  it('throws when marking read for an event the user does not own', async () => {
    (mockRepo.updateEventStatus as jest.Mock).mockResolvedValue(null);
    await expect(service.markAsRead('event-1', 'other-user')).rejects.toThrow('Notification not found');
  });

  it('marks an event dismissed only for its owning user', async () => {
    await service.dismiss('event-1', 'user-1');
    expect(mockRepo.updateEventStatus).toHaveBeenCalledWith('event-1', 'user-1', 'dismissed');
  });
});
