/**
 * AIM Result Permission Guard Tests — Phase 5, P5-073.
 *
 * Verifies that every AIM result endpoint on AimResultController has the
 * correct permission guards applied, protecting student AIM state and outputs.
 *
 * Guards verified per endpoint:
 *   - SupabaseJwtAuthGuard  — requires a valid Supabase JWT
 *   - StudentOwnershipGuard — validates :studentId against the JWT user
 *   - @RequireRoles(AuthorizedRole.STUDENT) — only students (or privileged
 *     override roles) may reach these endpoints
 *   - @RequireStudentOwnership({ paramName: 'studentId' }) — ownership
 *     metadata is set so the guard knows which route param to check
 *
 * Backend authority rules asserted here:
 *   - Only the owning student (or ADMIN / SUPER_ADMIN) may read AIM outputs.
 *   - studentId is always validated against the JWT; never taken from a
 *     client-supplied body field.
 *   - No AIM-owned value (mastery, difficulty, weakness, recommendation,
 *     review schedule) may be read without going through these guards.
 *   - No secrets, service-role keys, database credentials, or AI provider
 *     keys are referenced.
 *
 * Approach:
 *   The controller's handler methods are inspected via NestJS's Reflect
 *   metadata API.  This avoids spinning up a full HTTP server while
 *   giving precise, actionable signal about what decorators are actually
 *   present on production code.
 *
 * Sources:
 *   services/backend-api/src/features/aim/result/aim-result.controller.ts
 *   services/backend-api/src/auth/authorization/authorization.constants.ts
 *   docs/phase-5/no-client-aim-rule.md  (P5-004)
 */

import 'reflect-metadata';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { AimResultController } from './aim-result.controller';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { StudentOwnershipGuard } from '../../../auth/authorization/student-ownership.guard';
import { AuthorizedRole, PRIVILEGED_OWNERSHIP_ROLES } from '../../../auth/authorization/authorized-role';
import {
  REQUIRED_ROLES_KEY,
  STUDENT_OWNERSHIP_REQUIREMENT_KEY,
} from '../../../auth/authorization/authorization.constants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the guards attached to a handler via @UseGuards. */
function getGuards(handler: Function): Function[] {
  return Reflect.getMetadata('__guards__', handler) ?? [];
}

/** Return the required roles attached to a handler via @RequireRoles. */
function getRequiredRoles(handler: Function): AuthorizedRole[] {
  return Reflect.getMetadata(REQUIRED_ROLES_KEY, handler) ?? [];
}

/** Return the student ownership requirement attached to a handler. */
function getOwnershipRequirement(handler: Function) {
  return Reflect.getMetadata(STUDENT_OWNERSHIP_REQUIREMENT_KEY, handler);
}

// ---------------------------------------------------------------------------
// Handler references (unbound — metadata is on the prototype method)
// ---------------------------------------------------------------------------

const proto = AimResultController.prototype;

const handlers: { name: string; method: Function; paramName: string }[] = [
  { name: 'getSkillStates',       method: proto.getSkillStates,       paramName: 'studentId' },
  { name: 'getReviewSchedules',   method: proto.getReviewSchedules,   paramName: 'studentId' },
  { name: 'getSessionState',      method: proto.getSessionState,      paramName: 'studentId' },
  { name: 'getWeaknessRecords',   method: proto.getWeaknessRecords,   paramName: 'studentId' },
  { name: 'getRecommendations',   method: proto.getRecommendations,   paramName: 'studentId' },
];

const paramValidatedHandlers: { name: string; paramIndexes: number[] }[] = [
  { name: 'getSkillStates', paramIndexes: [0] },
  { name: 'getReviewSchedules', paramIndexes: [0] },
  { name: 'getSessionState', paramIndexes: [0, 1] },
  { name: 'getWeaknessRecords', paramIndexes: [0] },
  { name: 'getRecommendations', paramIndexes: [0] },
];

function getRouteArgMetadata(
  methodName: string,
): Record<string, { index?: number; pipes?: unknown[] }> {
  return (
    Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      AimResultController,
      methodName,
    ) ?? {}
  );
}

function getParamPipes(methodName: string, index: number): unknown[] {
  return Object.values(getRouteArgMetadata(methodName))
    .filter((metadata) => metadata.index === index)
    .flatMap((metadata) => metadata.pipes ?? []);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AimResultController — permission guards (P5-073)', () => {

  // ── JWT authentication ───────────────────────────────────────────────────

  describe('SupabaseJwtAuthGuard', () => {
    it.each(handlers)('$name requires SupabaseJwtAuthGuard', ({ method }) => {
      const guards = getGuards(method);
      expect(guards).toContain(SupabaseJwtAuthGuard);
    });
  });

  // ── Ownership guard ───────────────────────────────────────────────────────

  describe('StudentOwnershipGuard', () => {
    it.each(handlers)('$name requires StudentOwnershipGuard', ({ method }) => {
      const guards = getGuards(method);
      expect(guards).toContain(StudentOwnershipGuard);
    });
  });

  // ── Role requirement ──────────────────────────────────────────────────────

  describe('RequireRoles — STUDENT', () => {
    it.each(handlers)('$name requires AuthorizedRole.STUDENT', ({ method }) => {
      const roles = getRequiredRoles(method);
      expect(roles).toContain(AuthorizedRole.STUDENT);
    });
  });

  // ── Student ownership metadata ────────────────────────────────────────────

  describe('RequireStudentOwnership metadata', () => {
    it.each(handlers)('$name has student ownership metadata set', ({ method }) => {
      const req = getOwnershipRequirement(method);
      expect(req).toBeDefined();
    });

    it.each(handlers)('$name ownership paramName is "studentId"', ({ method, paramName }) => {
      const req = getOwnershipRequirement(method);
      expect(req?.paramName).toBe(paramName);
    });

    it.each(handlers)('$name privilegedRoles includes ADMIN', ({ method }) => {
      const req = getOwnershipRequirement(method);
      expect(req?.privilegedRoles).toContain(AuthorizedRole.ADMIN);
    });

    it.each(handlers)('$name privilegedRoles includes SUPER_ADMIN', ({ method }) => {
      const req = getOwnershipRequirement(method);
      expect(req?.privilegedRoles).toContain(AuthorizedRole.SUPER_ADMIN);
    });
  });

  // ── Guard ordering ────────────────────────────────────────────────────────

  describe('Guard ordering (JWT before ownership)', () => {
    it.each(handlers)('$name has SupabaseJwtAuthGuard before StudentOwnershipGuard', ({ method }) => {
      const guards = getGuards(method);
      const jwtIdx = guards.indexOf(SupabaseJwtAuthGuard);
      const ownershipIdx = guards.indexOf(StudentOwnershipGuard);
      expect(jwtIdx).toBeGreaterThanOrEqual(0);
      expect(ownershipIdx).toBeGreaterThanOrEqual(0);
      expect(jwtIdx).toBeLessThan(ownershipIdx);
    });
  });

  // ── No AIM-owned values in controller signature ───────────────────────────

  describe('Controller method signatures — no AIM computation', () => {
    it('getSkillStates delegates to service — no local mastery computation', async () => {
      const mockService = { getSkillStatesForStudent: jest.fn().mockResolvedValue({ skillStates: [] }) };
      const ctrl = new AimResultController(
        mockService as never,
        { getReviewSchedulesForStudent: jest.fn() } as never,
        { getSessionState: jest.fn() } as never,
        { getWeaknessRecordsForStudent: jest.fn() } as never,
        { getActiveForStudent: jest.fn() } as never,
      );
      const result = await ctrl.getSkillStates('stu-001');
      expect(mockService.getSkillStatesForStudent).toHaveBeenCalledWith('stu-001');
      expect(result).toEqual({ skillStates: [] });
    });

    it('getReviewSchedules delegates to service — no local scheduling', async () => {
      const mockService = { getReviewSchedulesForStudent: jest.fn().mockResolvedValue({ reviewSchedules: [] }) };
      const ctrl = new AimResultController(
        { getSkillStatesForStudent: jest.fn() } as never,
        mockService as never,
        { getSessionState: jest.fn() } as never,
        { getWeaknessRecordsForStudent: jest.fn() } as never,
        { getActiveForStudent: jest.fn() } as never,
      );
      const result = await ctrl.getReviewSchedules('stu-001');
      expect(mockService.getReviewSchedulesForStudent).toHaveBeenCalledWith('stu-001');
      expect(result).toEqual({ reviewSchedules: [] });
    });

    it('getSessionState delegates to service with studentId and sessionId', async () => {
      const mockService = { getSessionState: jest.fn().mockResolvedValue({ found: false }) };
      const ctrl = new AimResultController(
        { getSkillStatesForStudent: jest.fn() } as never,
        { getReviewSchedulesForStudent: jest.fn() } as never,
        mockService as never,
        { getWeaknessRecordsForStudent: jest.fn() } as never,
        { getActiveForStudent: jest.fn() } as never,
      );
      const result = await ctrl.getSessionState('stu-001', 'ses-001');
      expect(mockService.getSessionState).toHaveBeenCalledWith('stu-001', 'ses-001');
      expect(result).toEqual({ found: false });
    });

    it('getWeaknessRecords delegates to service — no local weakness computation', async () => {
      const mockService = { getWeaknessRecordsForStudent: jest.fn().mockResolvedValue({ weaknessRecords: [] }) };
      const ctrl = new AimResultController(
        { getSkillStatesForStudent: jest.fn() } as never,
        { getReviewSchedulesForStudent: jest.fn() } as never,
        { getSessionState: jest.fn() } as never,
        mockService as never,
        { getActiveForStudent: jest.fn() } as never,
      );
      const result = await ctrl.getWeaknessRecords('stu-001');
      expect(mockService.getWeaknessRecordsForStudent).toHaveBeenCalledWith('stu-001');
      expect(result).toEqual({ weaknessRecords: [] });
    });

    it('getRecommendations delegates to service — no local recommendation logic', async () => {
      const mockService = { getActiveForStudent: jest.fn().mockResolvedValue({ recommendations: [] }) };
      const ctrl = new AimResultController(
        { getSkillStatesForStudent: jest.fn() } as never,
        { getReviewSchedulesForStudent: jest.fn() } as never,
        { getSessionState: jest.fn() } as never,
        { getWeaknessRecordsForStudent: jest.fn() } as never,
        mockService as never,
      );
      const result = await ctrl.getRecommendations('stu-001');
      expect(mockService.getActiveForStudent).toHaveBeenCalledWith('stu-001');
      expect(result).toEqual({ recommendations: [] });
    });
  });

  // ── Backend authority summary ─────────────────────────────────────────────

  describe('Backend authority — no AIM Engine calls in controller', () => {
    it('AimResultController does not directly call the AIM Engine', () => {
      // The controller only accepts service injections — none of which is
      // AimEngineClientService or AimEngineAdapterService.
      const ctorParams: string[] = (Reflect.getMetadata('design:paramtypes', AimResultController) ?? [])
        .map((t: Function) => t?.name ?? '');

      expect(ctorParams).not.toContain('AimEngineClientService');
      expect(ctorParams).not.toContain('AimEngineAdapterService');
    });
  });
});

describe('AimResultController — DTO boundary validation (P5-074)', () => {
  it.each(paramValidatedHandlers)(
    '$name validates all route UUID params before service delegation',
    ({ name, paramIndexes }) => {
      for (const index of paramIndexes) {
        const pipes = getParamPipes(name, index);
        expect(pipes).toContain(ParseUUIDPipe);
      }
    },
  );
});
