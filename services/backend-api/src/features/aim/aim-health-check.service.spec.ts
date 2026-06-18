/**
 * Tests for AimHealthCheckService — P5-046.
 *
 * Verifies:
 * - checkAvailability() returns available: true when engine is healthy.
 * - checkAvailability() returns available: false when engine is unreachable.
 * - checkAvailability() returns available: false when engine reports unhealthy.
 * - checkAvailability() never throws (safe fallback).
 * - enginePhase and engineEnvironment are included when available.
 * - requireAvailable() returns result when engine is available.
 * - requireAvailable() throws ServiceUnavailableException when not available.
 * - Error messages never contain service token or AIM internals.
 */

import { ServiceUnavailableException } from '@nestjs/common';
import { AimEngineClientService } from './aim-engine-client.service';
import { AimHealthCheckService } from './aim-health-check.service';
import { AimEngineClientHealthResult } from './aim-engine-client.types';

function makeClient(result: AimEngineClientHealthResult): AimEngineClientService {
  return {
    checkHealth: jest.fn().mockResolvedValue(result),
  } as unknown as AimEngineClientService;
}

const HEALTHY_RESULT: AimEngineClientHealthResult = {
  reachable: true,
  checkedAt: '2026-06-17T10:00:00Z',
  health: {
    service: 'aim-engine',
    status: 'ok',
    timestamp: '2026-06-17T10:00:00Z',
    uptime_seconds: 120,
    phase: 'phase-5-aim-integration',
    environment: 'local',
  },
};

const UNREACHABLE_RESULT: AimEngineClientHealthResult = {
  reachable: false,
  checkedAt: '2026-06-17T10:00:00Z',
};

describe('AimHealthCheckService (P5-046)', () => {
  // -------------------------------------------------------------------------
  // checkAvailability — happy path
  // -------------------------------------------------------------------------

  it('returns available: true when engine is healthy', async () => {
    const service = new AimHealthCheckService(makeClient(HEALTHY_RESULT));

    const result = await service.checkAvailability();

    expect(result.available).toBe(true);
  });

  it('includes checkedAt in successful result', async () => {
    const service = new AimHealthCheckService(makeClient(HEALTHY_RESULT));

    const result = await service.checkAvailability();

    expect(result.checkedAt).toBe('2026-06-17T10:00:00Z');
  });

  it('includes enginePhase when engine is available', async () => {
    const service = new AimHealthCheckService(makeClient(HEALTHY_RESULT));

    const result = await service.checkAvailability();

    expect(result.enginePhase).toBe('phase-5-aim-integration');
  });

  it('includes engineEnvironment when engine is available', async () => {
    const service = new AimHealthCheckService(makeClient(HEALTHY_RESULT));

    const result = await service.checkAvailability();

    expect(result.engineEnvironment).toBe('local');
  });

  // -------------------------------------------------------------------------
  // checkAvailability — failure paths
  // -------------------------------------------------------------------------

  it('returns available: false when engine is unreachable', async () => {
    const service = new AimHealthCheckService(makeClient(UNREACHABLE_RESULT));

    const result = await service.checkAvailability();

    expect(result.available).toBe(false);
  });

  it('returns available: false when health field is missing', async () => {
    const service = new AimHealthCheckService(makeClient({
      reachable: true,
      checkedAt: '2026-06-17T10:00:00Z',
      // health missing
    }));

    const result = await service.checkAvailability();

    expect(result.available).toBe(false);
  });

  it('does not include enginePhase when engine is unavailable', async () => {
    const service = new AimHealthCheckService(makeClient(UNREACHABLE_RESULT));

    const result = await service.checkAvailability();

    expect(result.enginePhase).toBeUndefined();
    expect(result.engineEnvironment).toBeUndefined();
  });

  it('never throws from checkAvailability', async () => {
    const client = {
      checkHealth: jest.fn().mockRejectedValue(new Error('network failure')),
    } as unknown as AimEngineClientService;
    const service = new AimHealthCheckService(client);

    await expect(service.checkAvailability()).resolves.toBeDefined();
  });

  // -------------------------------------------------------------------------
  // requireAvailable
  // -------------------------------------------------------------------------

  it('returns result when engine is available', async () => {
    const service = new AimHealthCheckService(makeClient(HEALTHY_RESULT));

    const result = await service.requireAvailable();

    expect(result.available).toBe(true);
  });

  it('throws ServiceUnavailableException when engine is unreachable', async () => {
    const service = new AimHealthCheckService(makeClient(UNREACHABLE_RESULT));

    await expect(service.requireAvailable()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('exception message does not contain service token or internals', async () => {
    const service = new AimHealthCheckService(makeClient(UNREACHABLE_RESULT));

    try {
      await service.requireAvailable();
      fail('expected error');
    } catch (err) {
      const msg = String(err);
      for (const forbidden of ['token', 'secret', 'password', 'database', 'stack']) {
        expect(msg.toLowerCase()).not.toContain(forbidden);
      }
    }
  });

  it('exception message is user-safe', async () => {
    const service = new AimHealthCheckService(makeClient(UNREACHABLE_RESULT));

    try {
      await service.requireAvailable();
    } catch (err) {
      expect(err).toBeInstanceOf(ServiceUnavailableException);
      const response = (err as ServiceUnavailableException).getResponse();
      expect(JSON.stringify(response)).toContain('AIM Engine is not available');
    }
  });
});
