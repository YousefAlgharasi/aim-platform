// P10-031: AssessmentAuditService unit tests.
//
// Verifies:
//   - logEvent persists rows via DatabaseService.query with correct shape.
//   - Convenience helpers call logEvent with the right event type and entity type.
//   - assertSafeMetadata throws on forbidden keys, accepts safe keys.
//   - Errors from the DB are swallowed (audit failure never interrupts flow).

import { Test, TestingModule } from '@nestjs/testing';
import {
  AssessmentAuditService,
  AttemptStartedMeta,
  AttemptGradedMeta,
  AttemptSubmittedMeta,
  AttemptExpiredMeta,
  DeadlineExtendedMeta,
  ResultPersistedMeta,
  AuditMetadata,
} from './assessment-audit.service';
import { DatabaseService } from '../../database/database.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NOW_ISO = new Date('2026-06-20T10:00:00.000Z').toISOString();
const NOW_DATE = new Date(NOW_ISO);

function makeRow(overrides: Partial<{
  id: string; entity_type: string; entity_id: string;
  event_type: string; actor_id: string | null;
  occurred_at: Date; metadata: AuditMetadata;
}> = {}) {
  return {
    id: 'audit-uuid-1',
    entity_type: 'attempt',
    entity_id: 'attempt-uuid-1',
    event_type: 'attempt_started',
    actor_id: 'student-uuid-1',
    occurred_at: NOW_DATE,
    metadata: {
      assessmentId: 'assessment-uuid-1',
      attemptNumber: 1,
      startedAt: NOW_ISO,
      expiresAt: null,
    } as AttemptStartedMeta,
    ...overrides,
  };
}

function makeMockDb(rows: object[] = [makeRow()], throwError = false) {
  const query = throwError
    ? jest.fn().mockRejectedValue(new Error('DB connection failed'))
    : jest.fn().mockResolvedValue({ rows });
  return { query };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('aim/assessments/P10-031 — AssessmentAuditService', () => {
  let service: AssessmentAuditService;
  let mockDb: ReturnType<typeof makeMockDb>;

  beforeEach(async () => {
    mockDb = makeMockDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentAuditService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get<AssessmentAuditService>(AssessmentAuditService);
  });

  // -------------------------------------------------------------------------
  // logEvent — happy path
  // -------------------------------------------------------------------------

  describe('logEvent', () => {
    it('calls db.query with INSERT and returns an AuditRecord on success', async () => {
      const meta: AttemptStartedMeta = {
        assessmentId: 'assessment-uuid-1',
        attemptNumber: 1,
        startedAt: NOW_ISO,
        expiresAt: null,
      };

      const result = await service.logEvent({
        entityType: 'attempt',
        entityId: 'attempt-uuid-1',
        eventType: 'attempt_started',
        actorId: 'student-uuid-1',
        occurredAt: NOW_DATE,
        metadata: meta,
      });

      expect(mockDb.query).toHaveBeenCalledTimes(1);
      const [sql, params] = mockDb.query.mock.calls[0] as [string, unknown[]];
      expect(sql).toContain('INSERT INTO assessment_audit_logs');
      expect(params[0]).toBe('attempt');
      expect(params[1]).toBe('attempt-uuid-1');
      expect(params[2]).toBe('attempt_started');
      expect(params[3]).toBe('student-uuid-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('audit-uuid-1');
      expect(result?.entityType).toBe('attempt');
      expect(result?.eventType).toBe('attempt_started');
      expect(result?.actorId).toBe('student-uuid-1');
      expect(result?.occurredAt).toBeInstanceOf(Date);
    });

    it('returns null and does not throw when DB throws', async () => {
      const throwingDb = makeMockDb([], true);
      const mod = await Test.createTestingModule({
        providers: [
          AssessmentAuditService,
          { provide: DatabaseService, useValue: throwingDb },
        ],
      }).compile();
      const svc = mod.get<AssessmentAuditService>(AssessmentAuditService);

      const meta: AttemptStartedMeta = {
        assessmentId: 'a1',
        attemptNumber: 1,
        startedAt: NOW_ISO,
        expiresAt: null,
      };

      await expect(
        svc.logEvent({
          entityType: 'attempt',
          entityId: 'attempt-uuid-1',
          eventType: 'attempt_started',
          actorId: null,
          occurredAt: NOW_DATE,
          metadata: meta,
        }),
      ).resolves.toBeNull();
    });

    it('returns null when DB returns empty rows', async () => {
      const emptyDb = makeMockDb([]);
      const mod = await Test.createTestingModule({
        providers: [
          AssessmentAuditService,
          { provide: DatabaseService, useValue: emptyDb },
        ],
      }).compile();
      const svc = mod.get<AssessmentAuditService>(AssessmentAuditService);

      const meta: AttemptStartedMeta = {
        assessmentId: 'a1',
        attemptNumber: 1,
        startedAt: NOW_ISO,
        expiresAt: null,
      };

      const result = await svc.logEvent({
        entityType: 'attempt',
        entityId: 'attempt-uuid-1',
        eventType: 'attempt_started',
        actorId: null,
        occurredAt: NOW_DATE,
        metadata: meta,
      });

      expect(result).toBeNull();
    });

    it('passes null actorId for system-triggered events', async () => {
      const meta: AttemptExpiredMeta = {
        assessmentId: 'a1',
        attemptNumber: 1,
        expiredAt: NOW_ISO,
      };

      mockDb.query.mockResolvedValue({
        rows: [makeRow({ event_type: 'attempt_expired', actor_id: null })],
      });

      const result = await service.logEvent({
        entityType: 'attempt',
        entityId: 'attempt-uuid-1',
        eventType: 'attempt_expired',
        actorId: null,
        occurredAt: NOW_DATE,
        metadata: meta,
      });

      const params = (mockDb.query.mock.calls[0] as [string, unknown[]])[1];
      expect(params[3]).toBeNull();
      expect(result?.actorId).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Metadata safety guard
  // -------------------------------------------------------------------------

  describe('metadata safety', () => {
    const forbiddenKeys = [
      'password', 'secret', 'token', 'key', 'credential', 'apiKey',
      'api_key', 'serviceRole', 'service_role', 'anon', 'answers',
      'correct_answers', 'correctAnswers', 'rawAnswers', 'raw_answers',
    ];

    it.each(forbiddenKeys)(
      'throws when metadata contains forbidden key "%s"',
      async (forbiddenKey) => {
        const badMeta = {
          assessmentId: 'a1',
          attemptNumber: 1,
          startedAt: NOW_ISO,
          expiresAt: null,
          [forbiddenKey]: 'bad-value',
        } as unknown as AuditMetadata;

        await expect(
          service.logEvent({
            entityType: 'attempt',
            entityId: 'attempt-uuid-1',
            eventType: 'attempt_started',
            actorId: null,
            occurredAt: NOW_DATE,
            metadata: badMeta,
          }),
        ).rejects.toThrow(/forbidden key/);

        // DB must NOT be called if metadata is unsafe
        expect(mockDb.query).not.toHaveBeenCalled();
      },
    );

    it('accepts safe metadata without throwing', async () => {
      const safeMeta: AttemptGradedMeta = {
        assessmentId: 'a1',
        attemptNumber: 1,
        score: 80,
        maxScore: 100,
        passed: true,
        latePenaltyApplied: false,
        gradedAt: NOW_ISO,
      };

      mockDb.query.mockResolvedValue({
        rows: [makeRow({ event_type: 'attempt_graded', metadata: safeMeta })],
      });

      await expect(
        service.logEvent({
          entityType: 'attempt',
          entityId: 'attempt-uuid-1',
          eventType: 'attempt_graded',
          actorId: null,
          occurredAt: NOW_DATE,
          metadata: safeMeta,
        }),
      ).resolves.not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // Convenience helpers — verify entity type + event type routing
  // -------------------------------------------------------------------------

  describe('logAttemptStarted', () => {
    it('routes to attempt entity and attempt_started event', async () => {
      const spy = jest.spyOn(service, 'logEvent').mockResolvedValue(null);
      const meta: AttemptStartedMeta = {
        assessmentId: 'a1', attemptNumber: 1, startedAt: NOW_ISO, expiresAt: null,
      };

      await service.logAttemptStarted({ attemptId: 'attempt-uuid-1', actorId: 'student-uuid-1', meta });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'attempt', eventType: 'attempt_started', entityId: 'attempt-uuid-1' }),
      );
    });
  });

  describe('logAttemptSubmitted', () => {
    it('routes to attempt_submitted', async () => {
      const spy = jest.spyOn(service, 'logEvent').mockResolvedValue(null);
      const meta: AttemptSubmittedMeta = {
        assessmentId: 'a1', attemptNumber: 1, submittedAt: NOW_ISO,
      };

      await service.logAttemptSubmitted({ attemptId: 'attempt-uuid-1', actorId: 'student-uuid-1', meta });

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'attempt_submitted' }));
    });
  });

  describe('logAttemptGraded', () => {
    it('routes to attempt_graded with null actorId for system grading', async () => {
      const spy = jest.spyOn(service, 'logEvent').mockResolvedValue(null);
      const meta: AttemptGradedMeta = {
        assessmentId: 'a1', attemptNumber: 1, score: 75, maxScore: 100,
        passed: true, latePenaltyApplied: false, gradedAt: NOW_ISO,
      };

      await service.logAttemptGraded({ attemptId: 'attempt-uuid-1', actorId: null, meta });

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'attempt_graded', actorId: null }));
    });
  });

  describe('logAttemptExpired', () => {
    it('routes to attempt_expired with null actorId (system-triggered)', async () => {
      const spy = jest.spyOn(service, 'logEvent').mockResolvedValue(null);

      await service.logAttemptExpired({
        attemptId: 'attempt-uuid-1',
        meta: { assessmentId: 'a1', attemptNumber: 1, expiredAt: NOW_ISO },
      });

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'attempt_expired', actorId: null }));
    });
  });

  describe('logDeadlineExtended', () => {
    it('routes to deadline entity type', async () => {
      const spy = jest.spyOn(service, 'logEvent').mockResolvedValue(null);
      const meta: DeadlineExtendedMeta = {
        assessmentId: 'a1', studentId: 's1',
        newDeadline: NOW_ISO, previousDeadline: '2026-06-19T10:00:00.000Z',
        extendedBy: 'admin',
      };

      await service.logDeadlineExtended({ deadlineId: 'deadline-uuid-1', actorId: 'admin-uuid-1', meta });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'deadline', eventType: 'deadline_extended', entityId: 'deadline-uuid-1' }),
      );
    });
  });

  describe('logResultPersisted', () => {
    it('routes to result entity type', async () => {
      const spy = jest.spyOn(service, 'logEvent').mockResolvedValue(null);
      const meta: ResultPersistedMeta = {
        assessmentId: 'a1', attemptId: 'attempt-uuid-1',
        score: 90, maxScore: 100, passed: true, latePenaltyApplied: false, persistedAt: NOW_ISO,
      };

      await service.logResultPersisted({ resultId: 'result-uuid-1', actorId: null, meta });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'result', eventType: 'result_persisted', entityId: 'result-uuid-1' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Backend-authority guard: no client writes
  // -------------------------------------------------------------------------

  it('is a backend-only Injectable — not a REST controller', () => {
    expect(service).toBeDefined();
    expect(typeof service.logEvent).toBe('function');
    // No HTTP method decorators on this service (it's not a controller)
    const proto = Object.getPrototypeOf(service);
    ['Get', 'Post', 'Put', 'Patch', 'Delete'].forEach((m) => {
      expect(Reflect.getMetadata(`__${m.toLowerCase()}__`, proto)).toBeUndefined();
    });
  });
});
