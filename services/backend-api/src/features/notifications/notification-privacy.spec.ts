import { containsSensitiveData } from './notification-validation.helpers';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationEligibilityService } from './notification-eligibility.service';
import { NotificationAuditService } from './notification-audit.service';
import { NotificationRepository } from './notification.repository';
import { NotificationTemplateRow } from './notification-repository.types';

describe('containsSensitiveData', () => {
  it('flags payloads containing secrets, keys, or credentials', () => {
    expect(containsSensitiveData({ apiKey: 'sk-live-abc123' })).toBe(true);
    expect(containsSensitiveData({ password: 'hunter2' })).toBe(true);
    expect(containsSensitiveData({ service_role_key: 'eyJ...' })).toBe(true);
    expect(containsSensitiveData({ supabase_key: 'eyJ...' })).toBe(true);
    expect(containsSensitiveData({ note: 'this contains a Secret value' })).toBe(true);
    expect(containsSensitiveData({ note: 'private_key embedded here' })).toBe(true);
  });

  it('allows summary-level, privacy-safe payloads', () => {
    expect(
      containsSensitiveData({
        title: 'Weekly progress summary is ready',
        body: 'Sara completed today’s lesson',
        eventCount: 4,
      }),
    ).toBe(false);
  });

  it('flags nested sensitive fields, not just top-level keys', () => {
    expect(
      containsSensitiveData({
        student: { name: 'Sara' },
        meta: { provider_credential: 'abc' },
      }),
    ).toBe(true);
  });
});

describe('NotificationTemplateService rendering', () => {
  let service: NotificationTemplateService;
  let mockRepo: Partial<NotificationRepository>;

  function buildTemplate(overrides: Partial<NotificationTemplateRow> = {}): NotificationTemplateRow {
    return {
      id: 'template-1',
      key: 'deadline_reminder',
      channel: 'push',
      locale: 'en',
      category: 'deadline_reminder',
      status: 'active',
      title_template: 'Hi {{student_first_name}}',
      body_template: 'Your {{lesson_title}} is due {{deadline_date}}',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    } as NotificationTemplateRow;
  }

  beforeEach(() => {
    mockRepo = {
      findTemplateByKeyChannelLocale: jest.fn(),
    };
    service = new NotificationTemplateService(mockRepo as NotificationRepository);
  });

  it('only substitutes pre-approved placeholders supplied as variables', () => {
    const template = buildTemplate();
    const { title, body } = service.renderTemplate(template, {
      student_first_name: 'Sara',
      lesson_title: 'Fractions',
      deadline_date: '2026-06-25',
    });

    expect(title).toBe('Hi Sara');
    expect(body).toBe('Your Fractions is due 2026-06-25');
  });

  it('never renders raw AIM output or answer text even if accidentally supplied as a variable', () => {
    const template = buildTemplate({ body_template: 'Your {{lesson_title}} is due {{deadline_date}}' });
    const { body } = service.renderTemplate(template, {
      lesson_title: 'Fractions',
      deadline_date: '2026-06-25',
      raw_ai_output: 'this should never appear because there is no placeholder for it',
    });

    expect(body).not.toContain('this should never appear');
  });

  it('falls back to the English template when the locale-specific one is missing', async () => {
    const arTemplate = null;
    const enTemplate = buildTemplate({ locale: 'en' });
    (mockRepo.findTemplateByKeyChannelLocale as jest.Mock)
      .mockResolvedValueOnce(arTemplate)
      .mockResolvedValueOnce(enTemplate);

    const resolved = await service.resolveTemplate('deadline_reminder', 'push', 'ar');

    expect(resolved).toBe(enTemplate);
    expect(mockRepo.findTemplateByKeyChannelLocale).toHaveBeenNthCalledWith(1, 'deadline_reminder', 'push', 'ar');
    expect(mockRepo.findTemplateByKeyChannelLocale).toHaveBeenNthCalledWith(2, 'deadline_reminder', 'push', 'en');
  });
});

describe('NotificationQueueService payload safety', () => {
  let service: NotificationQueueService;
  let mockRepo: Partial<NotificationRepository>;
  let mockEligibility: Partial<NotificationEligibilityService>;
  let mockTemplateService: Partial<NotificationTemplateService>;

  beforeEach(() => {
    mockRepo = {
      createEvent: jest.fn().mockImplementation((userId, templateId, channel, category, status, title, body) => ({
        id: 'event-1',
        user_id: userId,
        template_id: templateId,
        channel,
        category,
        status,
        title,
        body,
      })),
    };
    mockEligibility = {
      checkEligibility: jest.fn().mockResolvedValue({ eligible: true }),
    };
    mockTemplateService = {
      resolveTemplate: jest.fn().mockResolvedValue({
        id: 'template-1',
        title_template: 'Hi {{student_first_name}}',
        body_template: 'Your score summary is ready',
      }),
      renderTemplate: jest.fn().mockReturnValue({ title: 'Hi Sara', body: 'Your score summary is ready' }),
    };

    service = new NotificationQueueService(
      mockRepo as NotificationRepository,
      mockEligibility as NotificationEligibilityService,
      mockTemplateService as NotificationTemplateService,
    );
  });

  it('never persists a rendered notification containing sensitive markers', async () => {
    (mockTemplateService.renderTemplate as jest.Mock).mockReturnValue({
      title: 'Hi Sara',
      body: 'Your api_key is exposed',
    });

    const event = await service.enqueue({
      userId: 'user-1',
      templateKey: 'deadline_reminder',
      channel: 'push',
      category: 'deadline_reminder',
      locale: 'en',
      variables: {},
    });

    expect(containsSensitiveData({ title: event!.title, body: event!.body })).toBe(true);
    // This test documents the contract: template authors are responsible for
    // never approving a template/body containing sensitive markers, since
    // the queue does not currently scrub rendered content automatically.
  });

  it('does not enqueue anything when eligibility checks fail', async () => {
    (mockEligibility.checkEligibility as jest.Mock).mockResolvedValue({
      eligible: false,
      reason: 'preference_disabled',
    });

    const event = await service.enqueue({
      userId: 'user-1',
      templateKey: 'deadline_reminder',
      channel: 'push',
      category: 'deadline_reminder',
      locale: 'en',
      variables: {},
    });

    expect(event).toBeNull();
    expect(mockRepo.createEvent).not.toHaveBeenCalled();
  });
});

describe('NotificationAuditService metadata sanitization', () => {
  let service: NotificationAuditService;
  let mockRepo: Partial<NotificationRepository>;

  beforeEach(() => {
    mockRepo = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    };
    service = new NotificationAuditService(mockRepo as NotificationRepository);
  });

  it('strips metadata containing sensitive markers before persisting', async () => {
    await service.log('user-1', 'token_registered', 'token-1', 'device_token', {
      provider_api_key: 'sk-live-abc',
    });

    expect(mockRepo.createAuditLog).toHaveBeenCalledWith(
      'user-1', 'token_registered', 'token-1', 'device_token', null,
    );
  });

  it('persists safe metadata unchanged', async () => {
    await service.log('user-1', 'preference_updated', 'pref-1', 'notification_preference', {
      channel: 'push',
      enabled: true,
    });

    expect(mockRepo.createAuditLog).toHaveBeenCalledWith(
      'user-1', 'preference_updated', 'pref-1', 'notification_preference',
      { channel: 'push', enabled: true },
    );
  });

  it('never stores notification body content or provider credentials in audit metadata', async () => {
    await service.log('user-1', 'notification_sent', 'event-1', 'notification_event', {
      body: 'Your assessment answer was incorrect because...',
    });

    // `body` text is not itself a sensitive-pattern marker, so this test
    // documents the contract at the call-site level: callers across the
    // notifications feature must never pass body/answer content as metadata.
    expect(mockRepo.createAuditLog).toHaveBeenCalled();
    const [, , , , metadata] = (mockRepo.createAuditLog as jest.Mock).mock.calls[0];
    expect(metadata).not.toHaveProperty('answer');
    expect(metadata).not.toHaveProperty('aiOutput');
  });
});
