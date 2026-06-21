// P18-078: Create Admin AI Audit UI (backend support)
// AdminAuditController tests.

import { AdminAuditController } from '../admin-audit.controller';
import { AiTeacherAuditLogRepository } from '../../governance/ai-teacher-audit-log.repository';
import { AiTeacherAuditLogRow } from '../../governance/governance-repository.types';

function makeAuditLog(overrides: Partial<AiTeacherAuditLogRow> = {}): AiTeacherAuditLogRow {
  return {
    id: 'log-1',
    actor_id: 'admin-1',
    action: 'prompt_template.published',
    resource_type: 'ai_prompt_template',
    resource_id: 'prompt-1',
    details: { version: 2 },
    created_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

describe('AdminAuditController', () => {
  function makeController() {
    const auditLogRepository = {
      listRecent: jest.fn().mockResolvedValue([makeAuditLog()]),
    } as unknown as AiTeacherAuditLogRepository;
    const controller = new AdminAuditController(auditLogRepository);
    return { controller, auditLogRepository };
  }

  it('lists recent audit logs with a default limit', async () => {
    const { controller, auditLogRepository } = makeController();
    await controller.listRecentLogs();
    expect(auditLogRepository.listRecent).toHaveBeenCalledWith(100);
  });

  it('caps the limit query param at 500', async () => {
    const { controller, auditLogRepository } = makeController();
    await controller.listRecentLogs('9999');
    expect(auditLogRepository.listRecent).toHaveBeenCalledWith(500);
  });

  it('returns safe metadata details, never a raw provider payload field', async () => {
    const { controller } = makeController();
    const [log] = await controller.listRecentLogs();
    expect(log).not.toHaveProperty('apiKey');
    expect(log).not.toHaveProperty('providerPayload');
    expect(log.action).toBe('prompt_template.published');
  });
});
