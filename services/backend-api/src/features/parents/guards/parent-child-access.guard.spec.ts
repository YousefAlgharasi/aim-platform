// P12-025: Add Parent Permission Guards
// ParentChildAccessGuard unit tests.

import { ExecutionContext, ForbiddenException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { ParentAccessScopeEntity } from '../dto/parent-access-scope.entity';
import { ParentChildAccessGuard, ParentChildAccessRequest } from './parent-child-access.guard';
import { ParentChildAccessRequirement } from './parent-child-access-requirement';

const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';

function makeScope(): ParentAccessScopeEntity {
  const scope = new ParentAccessScopeEntity();
  scope.parentId = PARENT_ID;
  scope.childId = CHILD_ID;
  scope.parentChildLinkId = 'link-uuid-001';
  scope.linkStatus = 'active';
  scope.grantedConsentTypes = ['progress_view'];
  return scope;
}

function makeContext(request: Partial<ParentChildAccessRequest>): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function buildGuard(
  requirement: ParentChildAccessRequirement | undefined,
  policyServiceOverrides: Partial<{
    assertLinked: jest.Mock;
    assertAccess: jest.Mock;
  }> = {},
) {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requirement);

  const parentAccessPolicyService = {
    assertLinked: policyServiceOverrides.assertLinked ?? jest.fn().mockResolvedValue(makeScope()),
    assertAccess: policyServiceOverrides.assertAccess ?? jest.fn().mockResolvedValue(makeScope()),
  };

  const guard = new ParentChildAccessGuard(reflector, parentAccessPolicyService as never);

  return { guard, parentAccessPolicyService };
}

describe('ParentChildAccessGuard', () => {
  describe('when @RequireParentChildAccess() is not set', () => {
    it('returns true without calling the policy service', async () => {
      const { guard, parentAccessPolicyService } = buildGuard(undefined);
      const ctx = makeContext({ user: { id: PARENT_ID, expiresAt: 0 }, params: { childId: CHILD_ID } });

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(parentAccessPolicyService.assertLinked).not.toHaveBeenCalled();
      expect(parentAccessPolicyService.assertAccess).not.toHaveBeenCalled();
    });
  });

  describe('when @RequireParentChildAccess() is set', () => {
    it('throws UNAUTHORIZED when request has no user', async () => {
      const { guard } = buildGuard({ paramName: 'childId' });
      const ctx = makeContext({ params: { childId: CHILD_ID } });

      await expect(guard.canActivate(ctx)).rejects.toMatchObject({
        code: ApiErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
      } as Partial<AppError>);
    });

    it('throws FORBIDDEN when the child id route param is missing', async () => {
      const { guard } = buildGuard({ paramName: 'childId' });
      const ctx = makeContext({ user: { id: PARENT_ID, expiresAt: 0 }, params: {} });

      await expect(guard.canActivate(ctx)).rejects.toMatchObject({
        code: ApiErrorCode.FORBIDDEN,
        statusCode: HttpStatus.FORBIDDEN,
      } as Partial<AppError>);
    });

    it('calls assertLinked (not assertAccess) when no consent type is required', async () => {
      const { guard, parentAccessPolicyService } = buildGuard({ paramName: 'childId' });
      const ctx = makeContext({ user: { id: PARENT_ID, expiresAt: 0 }, params: { childId: CHILD_ID } });

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(parentAccessPolicyService.assertLinked).toHaveBeenCalledWith(PARENT_ID, CHILD_ID);
      expect(parentAccessPolicyService.assertAccess).not.toHaveBeenCalled();
    });

    it('calls assertAccess with the required consent type when one is configured', async () => {
      const { guard, parentAccessPolicyService } = buildGuard({
        paramName: 'childId',
        consentType: 'progress_view',
      });
      const ctx = makeContext({ user: { id: PARENT_ID, expiresAt: 0 }, params: { childId: CHILD_ID } });

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(parentAccessPolicyService.assertAccess).toHaveBeenCalledWith(
        PARENT_ID,
        CHILD_ID,
        'progress_view',
      );
      expect(parentAccessPolicyService.assertLinked).not.toHaveBeenCalled();
    });

    it('attaches the resolved access scope to the request on success', async () => {
      const scope = makeScope();
      const { guard } = buildGuard(
        { paramName: 'childId' },
        { assertLinked: jest.fn().mockResolvedValue(scope) },
      );
      const request: ParentChildAccessRequest = {
        user: { id: PARENT_ID, expiresAt: 0 },
        params: { childId: CHILD_ID },
      };
      const ctx = makeContext(request);

      await guard.canActivate(ctx);
      expect(request.parentAccessScope).toBe(scope);
    });

    it('propagates ForbiddenException raised by the policy service', async () => {
      const { guard } = buildGuard(
        { paramName: 'childId' },
        {
          assertLinked: jest
            .fn()
            .mockRejectedValue(new ForbiddenException('Parent does not have an active link to this child.')),
        },
      );
      const ctx = makeContext({ user: { id: PARENT_ID, expiresAt: 0 }, params: { childId: CHILD_ID } });

      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('reads the child id from a custom param name', async () => {
      const { guard, parentAccessPolicyService } = buildGuard({ paramName: 'targetChildId' });
      const ctx = makeContext({
        user: { id: PARENT_ID, expiresAt: 0 },
        params: { targetChildId: CHILD_ID },
      });

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(parentAccessPolicyService.assertLinked).toHaveBeenCalledWith(PARENT_ID, CHILD_ID);
    });
  });
});
