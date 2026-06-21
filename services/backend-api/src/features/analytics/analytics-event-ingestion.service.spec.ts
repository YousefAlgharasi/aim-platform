import { AnalyticsEventIngestionService } from './analytics-event-ingestion.service';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsEvent } from './analytics.entities';

function makeEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    id: 'event-1',
    eventType: 'assessment.submitted',
    actorRole: 'student',
    actorId: 'student-1',
    subjectType: 'assessment',
    subjectId: 'assessment-1',
    occurredAt: new Date(),
    metadata: {},
    createdAt: new Date(),
    ...overrides,
  };
}

describe('AnalyticsEventIngestionService', () => {
  let analyticsRepository: jest.Mocked<Pick<AnalyticsRepository, 'insertEvent'>>;
  let service: AnalyticsEventIngestionService;

  beforeEach(() => {
    analyticsRepository = { insertEvent: jest.fn() };
    service = new AnalyticsEventIngestionService(analyticsRepository as unknown as AnalyticsRepository);
    analyticsRepository.insertEvent.mockImplementation(async (data) => makeEvent(data as Partial<AnalyticsEvent>));
  });

  it.each([
    ['password', 'hunter2'],
    ['secret', 'shh'],
    ['token', 'abc.def.ghi'],
    ['apiKey', 'sk-live-123'],
    ['api_key', 'sk-live-123'],
    ['credential', 'svc-account'],
    ['cardNumber', '4111111111111111'],
    ['card_number', '4111111111111111'],
  ])('strips a %s field from event metadata before persisting', async (key, value) => {
    await service.ingest({
      eventType: 'billing.payment_recorded',
      actorRole: 'admin',
      subjectType: 'invoice',
      metadata: { [key]: value, amount: 1999 },
    });

    const persisted = analyticsRepository.insertEvent.mock.calls[0][0];
    expect(persisted.metadata).not.toHaveProperty(key);
    expect(persisted.metadata).toEqual({ amount: 1999 });
  });

  it('is case-insensitive when matching forbidden metadata keys', async () => {
    await service.ingest({
      eventType: 'auth.login_succeeded',
      actorRole: 'student',
      subjectType: 'session',
      metadata: { SECRET: 'x', AccessToken: 'y', safeField: 'kept' },
    });

    const persisted = analyticsRepository.insertEvent.mock.calls[0][0];
    expect(persisted.metadata).toEqual({ safeField: 'kept' });
  });

  it('preserves safe structured metadata fields untouched', async () => {
    await service.ingest({
      eventType: 'learning.lesson_completed',
      actorRole: 'student',
      subjectType: 'lesson',
      metadata: { lessonId: 'lesson-1', durationSeconds: 240, score: 0.85 },
    });

    const persisted = analyticsRepository.insertEvent.mock.calls[0][0];
    expect(persisted.metadata).toEqual({ lessonId: 'lesson-1', durationSeconds: 240, score: 0.85 });
  });

  it('defaults metadata to an empty object when none is supplied', async () => {
    await service.ingest({
      eventType: 'notification.delivered',
      actorRole: 'system',
      subjectType: 'notification',
    });

    const persisted = analyticsRepository.insertEvent.mock.calls[0][0];
    expect(persisted.metadata).toEqual({});
  });

  it('rejects an empty event type before any metadata is persisted', async () => {
    await expect(
      service.ingest({ eventType: '', actorRole: 'student', subjectType: 'lesson', metadata: { secret: 'x' } }),
    ).rejects.toThrow();

    expect(analyticsRepository.insertEvent).not.toHaveBeenCalled();
  });
});
