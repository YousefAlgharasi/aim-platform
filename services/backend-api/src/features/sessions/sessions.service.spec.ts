import { HttpStatus } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { ApiErrorCode } from '../../common/errors/api-error-code';

function makeDatabaseService(
  responses: Array<{ rowCount: number; rows: unknown[] }>,
) {
  const query = jest.fn();
  responses.forEach((response) => query.mockResolvedValueOnce(response));
  return { query };
}

function makeAnalyticsEventIngestionService() {
  return { ingest: jest.fn().mockResolvedValue(undefined) };
}

const PLACEMENT_ROW = {
  id: 'placement-result-001',
  estimated_level: 'intermediate',
  completed_at: '2026-06-10T00:00:00.000Z',
};

const SESSION_ROW = {
  id: 'session-001',
  student_id: 'student-001',
  session_type: 'lesson_practice',
  status: 'active',
  started_at: '2026-06-17T00:00:00.000Z',
  last_activity_at: '2026-06-17T00:00:00.000Z',
  closed_at: null,
  current_level: 'intermediate',
  level_source: 'placement',
  level_set_at: '2026-06-10T00:00:00.000Z',
  skill_focus_ids: ['grammar.past_simple.forms'],
  placement_result_id: 'placement-result-001',
  placement_completed_at: '2026-06-10T00:00:00.000Z',
  contract_version: '1.0',
  created_at: '2026-06-17T00:00:00.000Z',
  updated_at: '2026-06-17T00:00:00.000Z',
};

describe('SessionsService', () => {
  describe('startSession', () => {
    it('throws VALIDATION_ERROR for an invalid sessionType', async () => {
      const db = makeDatabaseService([]);
      const service = new SessionsService(db as never, makeAnalyticsEventIngestionService() as never);

      await expect(
        service.startSession({
          studentId: 'student-001',
        internalUserId: 'internal-user-001',
          sessionType: 'not_a_real_type' as never,
        }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.VALIDATION_ERROR,
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(db.query).not.toHaveBeenCalled();
    });

    it('throws NOT_FOUND when the student has no completed placement result', async () => {
      const db = makeDatabaseService([{ rowCount: 0, rows: [] }]);
      const service = new SessionsService(db as never, makeAnalyticsEventIngestionService() as never);

      await expect(
        service.startSession({
          studentId: 'student-001',
        internalUserId: 'internal-user-001',
          sessionType: 'lesson_practice',
        }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });

    it('creates a session using the placement-derived level when no skillFocusIds are given', async () => {
      const db = makeDatabaseService([
        { rowCount: 1, rows: [PLACEMENT_ROW] },
        { rowCount: 1, rows: [{ ...SESSION_ROW, skill_focus_ids: [] }] },
      ]);
      const service = new SessionsService(db as never, makeAnalyticsEventIngestionService() as never);

      const result = await service.startSession({
        studentId: 'student-001',
        internalUserId: 'internal-user-001',
        sessionType: 'lesson_practice',
      });

      expect(result).toEqual({
        id: 'session-001',
        sessionType: 'lesson_practice',
        status: 'active',
        startedAt: '2026-06-17T00:00:00.000Z',
        currentLevel: 'intermediate',
        skillFocusIds: [],
      });

      const insertCall = db.query.mock.calls[1];
      expect(insertCall[0]).toContain('INSERT INTO learning_sessions');
      expect(insertCall[1]).toEqual([
        'student-001',
        'lesson_practice',
        'intermediate',
        '2026-06-10T00:00:00.000Z',
        '[]',
        'placement-result-001',
        '1.0',
      ]);
    });

    it('drops candidate skill ids that do not resolve to an existing skill key', async () => {
      const db = makeDatabaseService([
        { rowCount: 1, rows: [PLACEMENT_ROW] },
        { rowCount: 1, rows: [{ key: 'grammar.past_simple.forms' }] },
        { rowCount: 1, rows: [SESSION_ROW] },
      ]);
      const service = new SessionsService(db as never, makeAnalyticsEventIngestionService() as never);

      await service.startSession({
        studentId: 'student-001',
        internalUserId: 'internal-user-001',
        sessionType: 'lesson_practice',
        skillFocusIds: ['grammar.past_simple.forms', 'not_a_real_skill'],
      });

      const skillQueryCall = db.query.mock.calls[1];
      expect(skillQueryCall[0]).toContain('FROM skills');
      expect(skillQueryCall[1]).toEqual([
        ['grammar.past_simple.forms', 'not_a_real_skill'],
      ]);

      const insertCall = db.query.mock.calls[2];
      expect(insertCall[1][4]).toBe('["grammar.past_simple.forms"]');
    });

    it('skips the skills query entirely when no skillFocusIds are provided', async () => {
      const db = makeDatabaseService([
        { rowCount: 1, rows: [PLACEMENT_ROW] },
        { rowCount: 1, rows: [{ ...SESSION_ROW, skill_focus_ids: [] }] },
      ]);
      const service = new SessionsService(db as never, makeAnalyticsEventIngestionService() as never);

      await service.startSession({
        studentId: 'student-001',
        internalUserId: 'internal-user-001',
        sessionType: 'review_practice',
        skillFocusIds: [],
      });

      expect(db.query).toHaveBeenCalledTimes(2);
    });

    // Bugfix: analytics_events.actor_id has a real FK to users.id — the raw
    // Supabase auth UID stored as session.student_id (matching the existing
    // placement_attempts/learning_sessions convention) violates that FK and
    // crashes the whole request. The analytics event must use internalUserId.
    it('ingests the session.started analytics event with internalUserId as actorId, not studentId', async () => {
      const db = makeDatabaseService([
        { rowCount: 1, rows: [PLACEMENT_ROW] },
        { rowCount: 1, rows: [SESSION_ROW] },
      ]);
      const analytics = makeAnalyticsEventIngestionService();
      const service = new SessionsService(db as never, analytics as never);

      await service.startSession({
        studentId: 'student-001',
        internalUserId: 'internal-user-001',
        sessionType: 'lesson_practice',
      });

      expect(analytics.ingest).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'session.started',
          actorId: 'internal-user-001',
        }),
      );
    });
  });
});
