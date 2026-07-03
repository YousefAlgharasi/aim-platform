/**
 * AimPipelineOrchestratorService tests — P5-056.
 *
 * Covers:
 *   - Happy path: state assembly → adapter → persistence → ok outcome
 *   - State assembly failure → ok: false, reason: state_assembly_failed
 *   - State assembly insufficient data → ok: true, skippedReason set (clean skip)
 *   - Adapter failure (ok: false) → ok: false, reason: aim_engine_unavailable
 *   - Persistence failure → ok: false, reason: persistence_failed
 *   - backendRequestId is always present in outcome (both ok and failure)
 *   - Audit is always called (every path)
 *   - No mastery/AIM values computed here (scope guard)
 *   - No AIM Engine call on state assembly failure (Stage 4 skipped)
 */

import { AimPipelineOrchestratorService, AimPipelineContext } from './aim-pipeline-orchestrator.service';
import { AimStateAssemblyService, AimStateAssemblyResult } from './aim-state-assembly.service';
import { AimRequestMapperService } from '../adapter/aim-request-mapper.service';
import { AimEngineAdapterService } from '../adapter/aim-engine-adapter.service';
import { AimPersistenceService } from '../persistence/aim-persistence.service';
import { AimAuditService } from '../persistence/aim-audit.service';
import { AimMappingContext } from '../adapter/aim-request-mapper.types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CTX: AimPipelineContext = {
  studentId: '770e8400-e29b-41d4-a716-446655440002',
  sessionId: '660e8400-e29b-41d4-a716-446655440001',
  attemptId: '880e8400-e29b-41d4-a716-446655440003',
  xRequestId: 'req-correlation-id-001',
};

const MOCK_MAPPING_CONTEXT = {
  backendRequestId: 'br-001',
  xRequestId: 'req-001',
  session: {} as AimMappingContext['session'],
  attempts: [],
} as AimMappingContext;

const MOCK_ASSEMBLED_RESULT: AimStateAssemblyResult = {
  status: 'assembled',
  context: MOCK_MAPPING_CONTEXT,
};

const MOCK_RAW_REQUEST = { backendRequestId: 'br-001' };

const MOCK_VALIDATED_RESPONSE = {
  backendRequestId: 'br-001',
  studentId: CTX.studentId,
  sessionId: CTX.sessionId,
  categories: {},
};

// ---------------------------------------------------------------------------
// Mock factory helpers
// ---------------------------------------------------------------------------

function makeStateAssembly(result: AimStateAssemblyResult | 'throw') {
  return {
    assemble: jest.fn(async () => {
      if (result === 'throw') throw new Error('assembly error');
      return result;
    }),
  } as unknown as AimStateAssemblyService;
}

function makeRequestMapper() {
  return {
    map: jest.fn(() => MOCK_RAW_REQUEST),
  } as unknown as AimRequestMapperService;
}

function makeAdapter(ok: boolean) {
  return {
    analyze: jest.fn(async () =>
      ok
        ? { ok: true, response: MOCK_VALIDATED_RESPONSE }
        : { ok: false, fallback: 'profile_a', error: { code: 'TRANSPORT_TIMEOUT' } },
    ),
  } as unknown as AimEngineAdapterService;
}

function makePersistence(throws = false) {
  return {
    persist: jest.fn(async () => {
      if (throws) throw new Error('DB write failed');
    }),
  } as unknown as AimPersistenceService;
}

function makeAudit() {
  return { record: jest.fn() } as unknown as AimAuditService;
}

function makeOrchestrator(overrides: {
  stateAssembly?: AimStateAssemblyService;
  requestMapper?: AimRequestMapperService;
  adapter?: AimEngineAdapterService;
  persistence?: AimPersistenceService;
  audit?: AimAuditService;
} = {}) {
  return new AimPipelineOrchestratorService(
    overrides.stateAssembly ?? makeStateAssembly(MOCK_ASSEMBLED_RESULT),
    overrides.requestMapper ?? makeRequestMapper(),
    overrides.adapter ?? makeAdapter(true),
    overrides.persistence ?? makePersistence(),
    overrides.audit ?? makeAudit(),
  );
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe('AimPipelineOrchestratorService — happy path', () => {
  it('returns ok: true on successful pipeline run', async () => {
    const svc = makeOrchestrator();
    const result = await svc.trigger(CTX);
    expect(result.ok).toBe(true);
  });

  it('returns backendRequestId in success outcome', async () => {
    const svc = makeOrchestrator();
    const result = await svc.trigger(CTX);
    expect(result.ok && result.backendRequestId).toBeTruthy();
  });

  it('returns studentId and sessionId in success outcome', async () => {
    const svc = makeOrchestrator();
    const result = await svc.trigger(CTX);
    if (result.ok) {
      expect(result.studentId).toBe(CTX.studentId);
      expect(result.sessionId).toBe(CTX.sessionId);
    }
  });

  it('calls stateAssembly.assemble with the pipeline context', async () => {
    const stateAssembly = makeStateAssembly(MOCK_ASSEMBLED_RESULT);
    const svc = makeOrchestrator({ stateAssembly });
    await svc.trigger(CTX);
    expect(stateAssembly.assemble).toHaveBeenCalledWith(CTX);
  });

  it('calls requestMapper.map with the assembled context', async () => {
    const requestMapper = makeRequestMapper();
    const svc = makeOrchestrator({ requestMapper });
    await svc.trigger(CTX);
    expect(requestMapper.map).toHaveBeenCalledWith(MOCK_MAPPING_CONTEXT);
  });

  it('calls adapter.analyze with the raw request and xRequestId', async () => {
    const adapter = makeAdapter(true);
    const svc = makeOrchestrator({ adapter });
    await svc.trigger(CTX);
    expect(adapter.analyze).toHaveBeenCalledWith(MOCK_RAW_REQUEST, CTX.xRequestId);
  });

  it('calls persistence.persist with the validated response', async () => {
    const persistence = makePersistence();
    const svc = makeOrchestrator({ persistence });
    await svc.trigger(CTX);
    expect(persistence.persist).toHaveBeenCalledWith(MOCK_VALIDATED_RESPONSE);
  });

  it('calls audit.record at least once on success', async () => {
    const audit = makeAudit();
    const svc = makeOrchestrator({ audit });
    await svc.trigger(CTX);
    expect(audit.record).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// State assembly failure
// ---------------------------------------------------------------------------

describe('AimPipelineOrchestratorService — state assembly failure', () => {
  it('returns ok: false when state assembly throws', async () => {
    const svc = makeOrchestrator({ stateAssembly: makeStateAssembly('throw') });
    const result = await svc.trigger(CTX);
    expect(result.ok).toBe(false);
  });

  it('sets reason to state_assembly_failed', async () => {
    const svc = makeOrchestrator({ stateAssembly: makeStateAssembly('throw') });
    const result = await svc.trigger(CTX);
    if (!result.ok) expect(result.reason).toBe('state_assembly_failed');
  });

  it('does NOT call adapter when state assembly fails', async () => {
    const adapter = makeAdapter(true);
    const svc = makeOrchestrator({ stateAssembly: makeStateAssembly('throw'), adapter });
    await svc.trigger(CTX);
    expect(adapter.analyze).not.toHaveBeenCalled();
  });

  it('does NOT call persistence when state assembly fails', async () => {
    const persistence = makePersistence();
    const svc = makeOrchestrator({ stateAssembly: makeStateAssembly('throw'), persistence });
    await svc.trigger(CTX);
    expect(persistence.persist).not.toHaveBeenCalled();
  });

  it('still calls audit on state assembly failure', async () => {
    const audit = makeAudit();
    const svc = makeOrchestrator({ stateAssembly: makeStateAssembly('throw'), audit });
    await svc.trigger(CTX);
    expect(audit.record).toHaveBeenCalled();
  });

  it('includes backendRequestId in failure outcome', async () => {
    const svc = makeOrchestrator({ stateAssembly: makeStateAssembly('throw') });
    const result = await svc.trigger(CTX);
    expect(result.backendRequestId).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// State assembly insufficient data — a clean, deliberate skip, distinct from
// both "assembly failed" and "stub not implemented".
// ---------------------------------------------------------------------------

const INSUFFICIENT_DATA_RESULT: AimStateAssemblyResult = {
  status: 'insufficient_data',
  reason: 'Session has no recorded attempts yet.',
};

describe('AimPipelineOrchestratorService — state assembly insufficient data', () => {
  it('returns ok: true when state assembly reports insufficient data', async () => {
    const svc = makeOrchestrator({ stateAssembly: makeStateAssembly(INSUFFICIENT_DATA_RESULT) });
    const result = await svc.trigger(CTX);
    expect(result.ok).toBe(true);
  });

  it('includes the skip reason in the outcome', async () => {
    const svc = makeOrchestrator({ stateAssembly: makeStateAssembly(INSUFFICIENT_DATA_RESULT) });
    const result = await svc.trigger(CTX);
    expect(result.ok && result.skippedReason).toBe(INSUFFICIENT_DATA_RESULT.reason);
  });

  it('does NOT call adapter when state assembly reports insufficient data', async () => {
    const adapter = makeAdapter(true);
    const svc = makeOrchestrator({ stateAssembly: makeStateAssembly(INSUFFICIENT_DATA_RESULT), adapter });
    await svc.trigger(CTX);
    expect(adapter.analyze).not.toHaveBeenCalled();
  });

  it('does NOT call persistence when state assembly reports insufficient data', async () => {
    const persistence = makePersistence();
    const svc = makeOrchestrator({ stateAssembly: makeStateAssembly(INSUFFICIENT_DATA_RESULT), persistence });
    await svc.trigger(CTX);
    expect(persistence.persist).not.toHaveBeenCalled();
  });

  it('still calls audit when state assembly reports insufficient data', async () => {
    const audit = makeAudit();
    const svc = makeOrchestrator({ stateAssembly: makeStateAssembly(INSUFFICIENT_DATA_RESULT), audit });
    await svc.trigger(CTX);
    expect(audit.record).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Adapter failure
// ---------------------------------------------------------------------------

describe('AimPipelineOrchestratorService — adapter failure', () => {
  it('returns ok: false when adapter returns ok: false', async () => {
    const svc = makeOrchestrator({ adapter: makeAdapter(false) });
    const result = await svc.trigger(CTX);
    expect(result.ok).toBe(false);
  });

  it('sets reason to aim_engine_unavailable', async () => {
    const svc = makeOrchestrator({ adapter: makeAdapter(false) });
    const result = await svc.trigger(CTX);
    if (!result.ok) expect(result.reason).toBe('aim_engine_unavailable');
  });

  it('includes errorCode in failure outcome', async () => {
    const svc = makeOrchestrator({ adapter: makeAdapter(false) });
    const result = await svc.trigger(CTX);
    if (!result.ok) expect(result.errorCode).toBe('TRANSPORT_TIMEOUT');
  });

  it('does NOT call persistence on adapter failure', async () => {
    const persistence = makePersistence();
    const svc = makeOrchestrator({ adapter: makeAdapter(false), persistence });
    await svc.trigger(CTX);
    expect(persistence.persist).not.toHaveBeenCalled();
  });

  it('still calls audit on adapter failure', async () => {
    const audit = makeAudit();
    const svc = makeOrchestrator({ adapter: makeAdapter(false), audit });
    await svc.trigger(CTX);
    expect(audit.record).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Persistence failure
// ---------------------------------------------------------------------------

describe('AimPipelineOrchestratorService — persistence failure', () => {
  it('returns ok: false when persistence throws', async () => {
    const svc = makeOrchestrator({ persistence: makePersistence(true) });
    const result = await svc.trigger(CTX);
    expect(result.ok).toBe(false);
  });

  it('sets reason to persistence_failed', async () => {
    const svc = makeOrchestrator({ persistence: makePersistence(true) });
    const result = await svc.trigger(CTX);
    if (!result.ok) expect(result.reason).toBe('persistence_failed');
  });

  it('still calls audit on persistence failure', async () => {
    const audit = makeAudit();
    const svc = makeOrchestrator({ persistence: makePersistence(true), audit });
    await svc.trigger(CTX);
    expect(audit.record).toHaveBeenCalled();
  });

  it('does NOT throw — returns typed failure outcome', async () => {
    const svc = makeOrchestrator({ persistence: makePersistence(true) });
    await expect(svc.trigger(CTX)).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Scope guards
// ---------------------------------------------------------------------------

describe('AimPipelineOrchestratorService — scope guards', () => {
  it('never throws (all failures return typed outcomes)', async () => {
    const scenarios = [
      makeOrchestrator({ stateAssembly: makeStateAssembly('throw') }),
      makeOrchestrator({ adapter: makeAdapter(false) }),
      makeOrchestrator({ persistence: makePersistence(true) }),
    ];
    for (const svc of scenarios) {
      await expect(svc.trigger(CTX)).resolves.toBeDefined();
    }
  });

  it('outcome never contains mastery or AIM-owned decision fields', async () => {
    const svc = makeOrchestrator();
    const result = await svc.trigger(CTX);
    const keys = Object.keys(result);
    for (const forbidden of ['mastery', 'masteryScore', 'nextDifficulty', 'weakness', 'recommendation', 'reviewSchedule']) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it('backendRequestId is always a non-empty string in all outcomes', async () => {
    const scenarios = [
      makeOrchestrator(),
      makeOrchestrator({ stateAssembly: makeStateAssembly('throw') }),
      makeOrchestrator({ adapter: makeAdapter(false) }),
      makeOrchestrator({ persistence: makePersistence(true) }),
    ];
    for (const svc of scenarios) {
      const result = await svc.trigger(CTX);
      expect(typeof result.backendRequestId).toBe('string');
      expect(result.backendRequestId.length).toBeGreaterThan(0);
    }
  });
});
