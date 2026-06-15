import { CurriculumAuditLogService } from './curriculum-audit-log.service';

const mockQuery = jest.fn();
const mockDb = { query: mockQuery } as any;
const service = new CurriculumAuditLogService(mockDb);

beforeEach(() => mockQuery.mockReset());

describe('CurriculumAuditLogService', () => {
  describe('log', () => {
    it('inserts an audit log row', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await service.log({
        entityType: 'lesson',
        entityId: 'uuid-1',
        eventType: 'published',
        actorUserId: 'user-uuid',
        previousStatus: 'draft',
        newStatus: 'published',
      });

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('INSERT INTO curriculum_audit_logs');
      expect(params).toContain('uuid-1');
      expect(params).toContain('lesson');
      expect(params).toContain('published');
      expect(params).toContain('user-uuid');
    });

    it('does not throw if the insert fails (fire-and-forget)', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));

      await expect(
        service.log({ entityType: 'course', entityId: 'uuid-2', eventType: 'created' }),
      ).resolves.not.toThrow();
    });

    it('uses null for optional fields when omitted', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await service.log({ entityType: 'skill', entityId: 'uuid-3', eventType: 'updated' });

      const [, params] = mockQuery.mock.calls[0];
      expect(params[0]).toBeNull();
      expect(params[4]).toBeNull();
      expect(params[5]).toBeNull();
      expect(params[6]).toBeNull();
    });
  });

  describe('listLogs', () => {
    it('returns paginated audit log entries', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '3' }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'log-1',
              actor_user_id: 'user-1',
              entity_type: 'lesson',
              entity_id: 'uuid-1',
              event_type: 'published',
              previous_status: 'draft',
              new_status: 'published',
              metadata: null,
              created_at: '2026-01-01T00:00:00Z',
            },
          ],
        });

      const result = await service.listLogs(1, 20);
      expect(result.total).toBe(3);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].eventType).toBe('published');
    });

    it('applies entity_type filter', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await service.listLogs(1, 20, 'lesson');
      const [countSql] = mockQuery.mock.calls[0];
      expect(countSql).toContain('entity_type');
    });
  });
});
