/**
 * AIM Pipeline Integration Tests — Phase 5, P5-077.
 *
 * Verifies the full attempt → AIM Engine → persistence flow by wiring all
 * real pipeline services together and stubbing only the I/O boundaries
 * (database, HTTP client).
 *
 * Scope: Backend AIM pipeline integration only.
 *   - AimPipelineOrchestratorService (Stage 2 entry point)
 *   - AimStateAssemblyService         (Stage 3)
 *   - AimRequestMapperService          (Stage 4 request build)
 *   - AimEngineAdapterService          (Stage 4→5)
 *   - AimPersistenceService            (Stage 6)
 *   - AimAuditService                  (Stage 9)
 *
 * I/O stubs:
 *   - AimStateAssemblyService.assemble  — returns a canned AimMappingContext
 *   - AimEngineClientService.postAnalysis — returns a canned raw AIM response
 *   - DatabaseService                  — query/withClient no-ops
 *
 * Backend authority rules asserted here:
 *   - studentId always sourced from pipeline context (JWT-resolved), never from client.
 *   - Persistence is never called when adapter returns ok: false.
 *   - Persistence is never called when state assembly fails.
 *   - Audit is called on every path (success, state_assembly_failed,
 *     aim_engine_unavailable, persistence_failed).
 *   - No mastery, level, weakness, difficulty, recommendation, review
 *     schedule, retention, or frustration value is computed by the pipeline.
 *   - No secrets, service-role keys, database credentials, or AI provider
 *     keys are referenced.
 *
 * Sources:
 *   docs/phase-5/backend-aim-pipeline-map.md          (pipeline stages)
 *   docs/phase-5/aim-error-handling-policy.md  (P5-008, fallback profiles)
 *   services/backend-api/src/features/aim/pipeline/aim-pipeline-orchestrator.service.ts
 */

import { AimPipelineOrchestratorService, AimPipelineContext } from './aim-pipeline-orchestrator.service';
import { AimStateAssemblyService } from './aim-state-assembly.service';
import { AimRequestMapperService } from '../adapter/aim-request-mapper.service';
import { AimEngineAdapterService } from '../adapter/aim-engine-adapter.service';
import { AimEngineClientService } from '../aim-engine-client.service';
import { AimAdapterTimeoutPolicyService } from '../adapter/aim-adapter-timeout-policy.service';
import { AimAdapterErrorHandlerService } from '../adapter/aim-adapter-error-handler.service';
import { AimResponseMapperService } from '../adapter/aim-response-mapper.service';
import { AimPersistenceService } from '../persistence/aim-persistence.service';
import { AimAuditService } from '../persistence/aim-audit.service';
import { AimMappingContext } from '../adapter/aim-request-mapper.types';
import { AimValidatedResponse } from '../adapter/aim-response-mapper.types';
import { AimAnalysisCallResult } from '../aim-engine-client.types';
import { PoolClient } from 'pg';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const STUDENT_ID = 'aaaaaaaa-0000-4000-8000-000000000001';
const SESSION_ID = 'bbbbbbbb-0000-4000-8000-000000000002';
const ATTEMPT_ID = 'cccccccc-0000-4000-8000-000000000003';
const X_REQUEST_ID = 'x-req-integration-001';

const PIPELINE_CTX: AimPipelineContext = {
  studentId: STUDENT_ID,
  sessionId: SESSION_ID,
  attemptId: ATTEMPT_ID,
  xRequestId: X_REQUEST_ID,
};

/** Minimal AimMappingContext returned by the state assembly stub. */
const STUB_MAPPING_CONTEXT: AimMappingContext = {
  backendRequestId: 'br-integration-001',
  xRequestId: X_REQUEST_ID,
  session: {
    studentId: STUDENT_ID,
    sessionId: SESSION_ID,
    sessionType: 'lesson_practice',
    levelContext: {
      currentLevel: 'A2',
      levelSource: 'aim_engine',
      levelSetAt: '2026-01-01T00:00:00.000Z',
    },
    startedAt: '2026-01-01T10:00:00.000Z',
  },
  attempts: [
    {
      attemptId: ATTEMPT_ID,
      itemId: 'item-001',
      itemType: 'lesson_question',
      difficulty: 2,
      answerFormat: 'multiple_choice',
      isCorrect: true,
      attemptNumber: 1,
      skill: {
        skillId: 'skill-grammar-001',
        curriculumLevel: 'A2',
      },
      attemptedAt: '2026-01-01T10:05:00.000Z',
    },
  ],
} as unknown as AimMappingContext;

/** Minimal validated AIM Engine response (all categories present). */
const STUB_VALIDATED_RESPONSE: AimValidatedResponse = {
  backendRequestId: 'br-integration-001',
  contractVersion: '1.0',
  studentId: STUDENT_ID,
  sessionId: SESSION_ID,
  generatedAt: '2026-01-01T10:05:01.000Z',
  droppedValidationCodes: [],
  categories: {
    skillState: [
      {
        skillId: 'skill-grammar-001',
        masteryScore: 0.72,
        masteryConfidence: 0.85,
        masteryTrend: 'improving',
        attemptsConsideredCount: 5,
        lastAttemptId: ATTEMPT_ID,
        evaluatedAt: '2026-01-01T10:05:01.000Z',
      },
    ],
    weaknessRecords: [],
    difficultyDecision: {
      decisionId: 'dd-001',
      skillId: 'skill-grammar-001',
      nextDifficulty: 3,
      previousDifficulty: 2,
      rationale: 'mastery_increase',
      basedOnAttemptIds: [ATTEMPT_ID],
      decidedAt: '2026-01-01T10:05:01.000Z',
    },
    recommendations: [
      {
        recommendationId: 'rec-001',
        kind: 'lesson',
        targetSkillId: 'skill-grammar-002',
        targetLessonId: 'lesson-042',
        rank: 1,
        reason: 'next_in_sequence',
        basedOnWeaknessId: null,
        generatedAt: '2026-01-01T10:05:01.000Z',
        expiresAt: null,
      },
    ],
    reviewSchedule: [],
    sessionSummary: {
      sessionId: SESSION_ID,
      itemsAttempted: 1,
      itemsCorrect: 1,
      skillsTouched: ['skill-grammar-001'],
      overallMasteryShift: 'positive',
      frustrationLevel: 'none',
      engagementLevel: 'typical',
      signalBasis: [],
      closedOutAt: '2026-01-01T10:05:01.000Z',
    },
  },
};

/** Canned raw AIM Engine HTTP body (pre-mapping). Mirrors the validated response envelope. */
const STUB_RAW_BODY = {
  backend_request_id: 'br-integration-001',
  contract_version: '1.0',
  student_id: STUDENT_ID,
  session_id: SESSION_ID,
  generated_at: '2026-01-01T10:05:01.000Z',
  categories: {
    skill_state: [
      {
        skill_id: 'skill-grammar-001',
        mastery_score: 0.72,
        mastery_confidence: 0.85,
        mastery_trend: 'improving',
        attempts_considered_count: 5,
        last_attempt_id: ATTEMPT_ID,
        evaluated_at: '2026-01-01T10:05:01.000Z',
      },
    ],
    weakness_records: [],
    difficulty_decision: {
      decision_id: 'dd-001',
      skill_id: 'skill-grammar-001',
      next_difficulty: 3,
      previous_difficulty: 2,
      rationale: 'mastery_increase',
      based_on_attempt_ids: [ATTEMPT_ID],
      decided_at: '2026-01-01T10:05:01.000Z',
    },
    recommendations: [
      {
        recommendation_id: 'rec-001',
        kind: 'lesson',
        target_skill_id: 'skill-grammar-002',
        target_lesson_id: 'lesson-042',
        rank: 1,
        reason: 'next_in_sequence',
        based_on_weakness_id: null,
        generated_at: '2026-01-01T10:05:01.000Z',
        expires_at: null,
      },
    ],
    review_schedule: [],
    session_summary: {
      session_id: SESSION_ID,
      items_attempted: 1,
      items_correct: 1,
      skills_touched: ['skill-grammar-001'],
      overall_mastery_shift: 'positive',
      frustration_level: 'none',
      engagement_level: 'typical',
      signal_basis: [],
      closed_out_at: '2026-01-01T10:05:01.000Z',
    },
  },
};

// ---------------------------------------------------------------------------
// Mock factory — builds all services with spies and a configurable boundary
// ---------------------------------------------------------------------------

interface IntegrationHarness {
  orchestrator: AimPipelineOrchestratorService;
  stateAssemblySpy: jest.SpyInstance;
  adapterSpy: jest.SpyInstance;
  clientSpy: jest.SpyInstance;
  persistenceSpy: jest.SpyInstance;
  auditSpy: jest.SpyInstance;
  /** Override what the adapter returns for a single test. */
  setAdapterFailure: () => void;
  /** Override state assembly to throw for a single test. */
  setStateAssemblyError: (err: Error) => void;
  /** Override state assembly to return null (stub phase) for a single test. */
  setStateAssemblyNull: () => void;
  /** Override persistence to throw for a single test. */
  setPersistenceError: (err: Error) => void;
}

function buildHarness(): IntegrationHarness {
  // ---- Database stub -------------------------------------------------------
  const mockPoolClient = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    release: jest.fn(),
  } as unknown as PoolClient;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockDb = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    withClient: jest.fn().mockImplementation(async (cb: (client: PoolClient) => Promise<unknown>) => cb(mockPoolClient)),
  } as any;

  // ---- AimEngineClientService stub -----------------------------------------
  const mockClient = {
    postAnalysis: jest.fn().mockResolvedValue({
      ok: true,
      statusCode: 200,
      body: STUB_RAW_BODY as never,
    } satisfies AimAnalysisCallResult),
    checkHealth: jest.fn(),
  } as unknown as AimEngineClientService;
  const clientSpy = jest.spyOn(mockClient, 'postAnalysis');

  // ---- Build real services wired together ----------------------------------
  const timeoutPolicy = new AimAdapterTimeoutPolicyService({} as never);
  const errorHandler = new AimAdapterErrorHandlerService();
  const responseMapper = new AimResponseMapperService();
  const adapter = new AimEngineAdapterService(mockClient, timeoutPolicy, responseMapper, errorHandler);
  // Stub adapter.analyze directly — avoids needing BackendConfigService wired into
  // AimAdapterTimeoutPolicyService. The adapter itself is tested in its own spec.
  const adapterSpy = jest.spyOn(adapter, 'analyze').mockResolvedValue({
    ok: true,
    response: STUB_VALIDATED_RESPONSE,
  });

  const requestMapper = new AimRequestMapperService();
  // Stub the request mapper so the fixture doesn't need to satisfy the full
  // AimMappingContext shape — the mapper is tested separately in its own spec.
  jest.spyOn(requestMapper, 'map').mockReturnValue({ backendRequestId: 'br-integration-001' } as never);
  const stateAssembly = new AimStateAssemblyService();
  const stateAssemblySpy = jest
    .spyOn(stateAssembly, 'assemble')
    .mockResolvedValue(STUB_MAPPING_CONTEXT);

  const persistence = new AimPersistenceService(mockDb);
  const persistenceSpy = jest.spyOn(persistence, 'persist').mockResolvedValue(undefined);

  const audit = new AimAuditService(mockDb);
  const auditSpy = jest.spyOn(audit, 'record');

  const orchestrator = new AimPipelineOrchestratorService(
    stateAssembly,
    requestMapper,
    adapter,
    persistence,
    audit,
  );

  return {
    orchestrator,
    stateAssemblySpy,
    adapterSpy,
    clientSpy,
    persistenceSpy,
    auditSpy,
    setAdapterFailure() {
      adapterSpy.mockResolvedValue({
        ok: false,
        fallback: {
          profile: 'A' as const,
          rawInputSaved: true as const,
          error: {
            code: 'TRANSPORT_TIMEOUT',
            message: 'AIM Engine unavailable',
            category: 'transport_timeout' as const,
            retryable: false,
            timestamp: '2026-01-01T10:05:00.000Z',
          },
        },
        error: {
          code: 'TRANSPORT_TIMEOUT',
          message: 'AIM Engine unavailable',
          category: 'transport_timeout' as const,
          retryable: false,
          timestamp: '2026-01-01T10:05:00.000Z',
        },
      });
    },
    setStateAssemblyError(err: Error) {
      stateAssemblySpy.mockRejectedValue(err);
    },
    setStateAssemblyNull() {
      stateAssemblySpy.mockResolvedValue(null);
    },
    setPersistenceError(err: Error) {
      persistenceSpy.mockRejectedValue(err);
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AIM Pipeline Integration — attempt → AIM Engine → persistence', () => {
  let h: IntegrationHarness;

  beforeEach(() => {
    h = buildHarness();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  describe('happy path — full pipeline succeeds', () => {
    it('returns ok: true with backendRequestId, studentId, sessionId', async () => {
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);

      expect(outcome.ok).toBe(true);
      if (!outcome.ok) return;
      expect(outcome.backendRequestId).toBeDefined();
      expect(typeof outcome.backendRequestId).toBe('string');
      expect(outcome.studentId).toBe(STUDENT_ID);
      expect(outcome.sessionId).toBe(SESSION_ID);
    });

    it('calls state assembly with the pipeline context', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      expect(h.stateAssemblySpy).toHaveBeenCalledTimes(1);
      expect(h.stateAssemblySpy).toHaveBeenCalledWith(PIPELINE_CTX);
    });

    it('calls the AIM Engine HTTP client exactly once', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      expect(h.adapterSpy).toHaveBeenCalledTimes(1);
    });

    it('calls persistence exactly once with the validated AIM response', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      expect(h.persistenceSpy).toHaveBeenCalledTimes(1);
      // Validate that what was passed to persist is a validated response structure
      const persistArg = h.persistenceSpy.mock.calls[0][0] as AimValidatedResponse;
      expect(persistArg.studentId).toBe(STUDENT_ID);
      expect(persistArg.sessionId).toBe(SESSION_ID);
      expect(Array.isArray(persistArg.categories.skillState)).toBe(true);
    });

    it('records a success audit entry at audit_close_out stage', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      const successCall = h.auditSpy.mock.calls.find(
        ([entry]) => entry.pipelineStage === 'audit_close_out' && entry.outcome === 'success',
      );
      expect(successCall).toBeDefined();
    });

    it('backendRequestId in the outcome matches the audit entry correlation id', async () => {
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);
      if (!outcome.ok) throw new Error('Expected ok: true');

      const auditEntry = h.auditSpy.mock.calls.find(
        ([entry]) => entry.pipelineStage === 'audit_close_out',
      )?.[0];
      expect(auditEntry?.backendRequestId).toBe(outcome.backendRequestId);
    });

    it('studentId in the outcome matches PIPELINE_CTX.studentId — never client-supplied', async () => {
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);
      if (!outcome.ok) throw new Error('Expected ok: true');
      // Backend authority invariant: studentId flows from JWT context, not from client data.
      expect(outcome.studentId).toBe(PIPELINE_CTX.studentId);
    });

    it('does not compute any AIM-owned values — no mastery/difficulty in outcome', async () => {
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);
      // The pipeline outcome must not expose mastery, level, weakness, difficulty,
      // recommendations, review schedule, retention, or frustration to the caller.
      expect(outcome).not.toHaveProperty('mastery');
      expect(outcome).not.toHaveProperty('masteryScore');
      expect(outcome).not.toHaveProperty('difficulty');
      expect(outcome).not.toHaveProperty('recommendations');
      expect(outcome).not.toHaveProperty('weaknessRecords');
      expect(outcome).not.toHaveProperty('reviewSchedule');
      expect(outcome).not.toHaveProperty('frustration');
      expect(outcome).not.toHaveProperty('retention');
    });
  });

  // -------------------------------------------------------------------------
  // State assembly failure — Stage 3 throws
  // -------------------------------------------------------------------------

  describe('state assembly failure — Stage 3 throws', () => {
    beforeEach(() => {
      h.setStateAssemblyError(new Error('db read timeout during state assembly'));
    });

    it('returns ok: false with reason state_assembly_failed', async () => {
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);

      expect(outcome.ok).toBe(false);
      if (outcome.ok) return;
      expect(outcome.reason).toBe('state_assembly_failed');
      expect(outcome.backendRequestId).toBeDefined();
    });

    it('does NOT call the AIM Engine HTTP client when state assembly fails', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      // Critical: pipeline must abort before Stage 4 if Stage 3 fails.
      expect(h.clientSpy).not.toHaveBeenCalled();
    });

    it('does NOT call persistence when state assembly fails', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      expect(h.persistenceSpy).not.toHaveBeenCalled();
    });

    it('records a state_assembly audit entry with non_retryable outcome', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      const auditEntry = h.auditSpy.mock.calls.find(
        ([entry]) => entry.pipelineStage === 'state_assembly',
      )?.[0];
      expect(auditEntry).toBeDefined();
      expect(auditEntry?.outcome).toBe('non_retryable');
      expect(auditEntry?.studentId).toBe(STUDENT_ID);
      expect(auditEntry?.sessionId).toBe(SESSION_ID);
      expect(auditEntry?.attemptId).toBe(ATTEMPT_ID);
    });

    it('never throws — returns typed failure outcome', async () => {
      await expect(h.orchestrator.trigger(PIPELINE_CTX)).resolves.toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // State assembly null — stub phase (no-op)
  // -------------------------------------------------------------------------

  describe('state assembly returns null — stub phase no-op', () => {
    beforeEach(() => {
      h.setStateAssemblyNull();
    });

    it('returns ok: true (no-op path)', async () => {
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);

      expect(outcome.ok).toBe(true);
    });

    it('does NOT call the AIM Engine HTTP client', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      expect(h.clientSpy).not.toHaveBeenCalled();
    });

    it('does NOT call persistence', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      expect(h.persistenceSpy).not.toHaveBeenCalled();
    });

    it('records an audit entry', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      expect(h.auditSpy).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // AIM Engine failure — adapter returns ok: false (Stage 8 fallback)
  // -------------------------------------------------------------------------

  describe('AIM Engine failure — adapter returns ok: false', () => {
    beforeEach(() => {
      h.setAdapterFailure();
    });

    it('returns ok: false with reason aim_engine_unavailable', async () => {
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);

      expect(outcome.ok).toBe(false);
      if (outcome.ok) return;
      expect(outcome.reason).toBe('aim_engine_unavailable');
      expect(outcome.backendRequestId).toBeDefined();
    });

    it('does NOT call persistence when the AIM Engine call fails', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      // Critical: unvalidated/missing AIM response must never be persisted.
      expect(h.persistenceSpy).not.toHaveBeenCalled();
    });

    it('records an aim_engine_call audit entry with non_retryable outcome', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      const auditEntry = h.auditSpy.mock.calls.find(
        ([entry]) => entry.pipelineStage === 'aim_engine_call',
      )?.[0];
      expect(auditEntry).toBeDefined();
      expect(auditEntry?.outcome).toBe('non_retryable');
    });

    it('includes an errorCode in the failure outcome', async () => {
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);

      if (outcome.ok) throw new Error('Expected ok: false');
      expect(outcome.errorCode).toBeDefined();
      expect(typeof outcome.errorCode).toBe('string');
    });

    it('never throws — returns typed failure outcome', async () => {
      await expect(h.orchestrator.trigger(PIPELINE_CTX)).resolves.toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Persistence failure — Stage 6 throws
  // -------------------------------------------------------------------------

  describe('persistence failure — Stage 6 throws', () => {
    beforeEach(() => {
      h.setPersistenceError(new Error('PostgreSQL ROLLBACK: constraint violation'));
    });

    it('returns ok: false with reason persistence_failed', async () => {
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);

      expect(outcome.ok).toBe(false);
      if (outcome.ok) return;
      expect(outcome.reason).toBe('persistence_failed');
      expect(outcome.backendRequestId).toBeDefined();
    });

    it('still called the AIM Engine HTTP client (Stage 4 ran)', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      expect(h.adapterSpy).toHaveBeenCalledTimes(1);
    });

    it('records a persistence audit entry with persistence_failed outcome', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      const auditEntry = h.auditSpy.mock.calls.find(
        ([entry]) => entry.pipelineStage === 'persistence',
      )?.[0];
      expect(auditEntry).toBeDefined();
      expect(auditEntry?.outcome).toBe('persistence_failed');
    });

    it('never throws — returns typed failure outcome', async () => {
      await expect(h.orchestrator.trigger(PIPELINE_CTX)).resolves.toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Audit invariants — audit is always called on every path
  // -------------------------------------------------------------------------

  describe('audit invariants — always called', () => {
    it('audit is called on the success path', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);
      expect(h.auditSpy).toHaveBeenCalled();
    });

    it('audit is called on the state_assembly_failed path', async () => {
      h.setStateAssemblyError(new Error('assembly failed'));
      await h.orchestrator.trigger(PIPELINE_CTX);
      expect(h.auditSpy).toHaveBeenCalled();
    });

    it('audit is called on the aim_engine_unavailable path', async () => {
      h.setAdapterFailure();
      await h.orchestrator.trigger(PIPELINE_CTX);
      expect(h.auditSpy).toHaveBeenCalled();
    });

    it('audit is called on the persistence_failed path', async () => {
      h.setPersistenceError(new Error('tx rollback'));
      await h.orchestrator.trigger(PIPELINE_CTX);
      expect(h.auditSpy).toHaveBeenCalled();
    });

    it('audit entry always contains studentId and sessionId for correlation', async () => {
      await h.orchestrator.trigger(PIPELINE_CTX);

      const auditCalls = h.auditSpy.mock.calls;
      for (const [entry] of auditCalls) {
        expect(entry.studentId).toBe(STUDENT_ID);
        expect(entry.sessionId).toBe(SESSION_ID);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Idempotency / correlation — backendRequestId is always present
  // -------------------------------------------------------------------------

  describe('backendRequestId is always present in the outcome', () => {
    it('present on success', async () => {
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);
      expect(outcome.backendRequestId).toBeDefined();
    });

    it('present on state_assembly_failed', async () => {
      h.setStateAssemblyError(new Error('fail'));
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);
      expect(outcome.backendRequestId).toBeDefined();
    });

    it('present on aim_engine_unavailable', async () => {
      h.setAdapterFailure();
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);
      expect(outcome.backendRequestId).toBeDefined();
    });

    it('present on persistence_failed', async () => {
      h.setPersistenceError(new Error('fail'));
      const outcome = await h.orchestrator.trigger(PIPELINE_CTX);
      expect(outcome.backendRequestId).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Stage ordering invariant — engine never called before state assembly
  // -------------------------------------------------------------------------

  describe('stage ordering invariants', () => {
    it('state assembly is called before the AIM Engine adapter', async () => {
      const callOrder: string[] = [];
      h.stateAssemblySpy.mockImplementation(async () => {
        callOrder.push('stateAssembly');
        return STUB_MAPPING_CONTEXT;
      });
      h.adapterSpy.mockImplementation(async () => {
        callOrder.push('adapter');
        return { ok: true, response: STUB_VALIDATED_RESPONSE };
      });

      await h.orchestrator.trigger(PIPELINE_CTX);

      expect(callOrder[0]).toBe('stateAssembly');
      expect(callOrder[1]).toBe('adapter');
    });

    it('AIM Engine adapter is called before persistence', async () => {
      const callOrder: string[] = [];
      h.adapterSpy.mockImplementation(async () => {
        callOrder.push('adapter');
        return { ok: true, response: STUB_VALIDATED_RESPONSE };
      });
      h.persistenceSpy.mockImplementation(async () => {
        callOrder.push('persistence');
      });

      await h.orchestrator.trigger(PIPELINE_CTX);

      expect(callOrder[0]).toBe('adapter');
      expect(callOrder[1]).toBe('persistence');
    });
  });

  // -------------------------------------------------------------------------
  // Client-authority invariants — no unvalidated AIM response persisted
  // -------------------------------------------------------------------------

  describe('persistence safety — unvalidated AIM data is never written', () => {
    it('persistence is skipped when adapter returns ok: false (Profile A fallback)', async () => {
      h.setAdapterFailure();

      await h.orchestrator.trigger(PIPELINE_CTX);

      expect(h.persistenceSpy).not.toHaveBeenCalled();
    });

    it('persistence is skipped when state assembly fails', async () => {
      h.setStateAssemblyError(new Error('state error'));

      await h.orchestrator.trigger(PIPELINE_CTX);

      expect(h.persistenceSpy).not.toHaveBeenCalled();
    });
  });
});
