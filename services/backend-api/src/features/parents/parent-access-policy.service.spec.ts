// P12-041: Add Parent Permission Tests
// ParentAccessPolicyService unit tests. This is the single backend
// authority for "may this parent see this child's data" — these tests
// verify it rejects unlinked children and revoked links, and correctly
// gates consent-scoped access.

import { ForbiddenException } from '@nestjs/common';

import { ParentAccessPolicyService } from './parent-access-policy.service';
import { ParentAccessScopeEntity } from './dto/parent-access-scope.entity';

const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';
const LINK_ID = 'link-uuid-001';

function buildScope(overrides: Partial<ParentAccessScopeEntity> = {}): ParentAccessScopeEntity {
  const scope = new ParentAccessScopeEntity();
  scope.parentId = PARENT_ID;
  scope.childId = CHILD_ID;
  scope.parentChildLinkId = LINK_ID;
  scope.linkStatus = 'active';
  scope.grantedConsentTypes = [];
  return Object.assign(scope, overrides);
}

function buildService(overrides: {
  resolveAccessScope?: jest.Mock;
  listLinksForParent?: jest.Mock;
} = {}) {
  const parentChildLinkService = {
    listLinksForParent: overrides.listLinksForParent ?? jest.fn().mockResolvedValue([]),
  };

  const parentConsentService = {
    resolveAccessScope: overrides.resolveAccessScope ?? jest.fn().mockResolvedValue(null),
  };

  const service = new ParentAccessPolicyService(
    parentChildLinkService as never,
    parentConsentService as never,
  );

  return { service, parentChildLinkService, parentConsentService };
}

describe('ParentAccessPolicyService', () => {
  describe('assertLinked', () => {
    it('throws ForbiddenException when the parent has no link to the child at all', async () => {
      const { service } = buildService({ resolveAccessScope: jest.fn().mockResolvedValue(null) });

      await expect(service.assertLinked(PARENT_ID, CHILD_ID)).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when the link has been revoked', async () => {
      const { service } = buildService({
        resolveAccessScope: jest.fn().mockResolvedValue(buildScope({ linkStatus: 'revoked' })),
      });

      await expect(service.assertLinked(PARENT_ID, CHILD_ID)).rejects.toThrow(
        'Parent does not have an active link to this child.',
      );
    });

    it('throws ForbiddenException when the link is only pending', async () => {
      const { service } = buildService({
        resolveAccessScope: jest.fn().mockResolvedValue(buildScope({ linkStatus: 'pending' })),
      });

      await expect(service.assertLinked(PARENT_ID, CHILD_ID)).rejects.toThrow(ForbiddenException);
    });

    it('returns the scope when the link is active', async () => {
      const scope = buildScope({ linkStatus: 'active' });
      const { service } = buildService({ resolveAccessScope: jest.fn().mockResolvedValue(scope) });

      await expect(service.assertLinked(PARENT_ID, CHILD_ID)).resolves.toBe(scope);
    });
  });

  describe('assertAccess', () => {
    it('throws ForbiddenException for an unlinked child regardless of requested consent type', async () => {
      const { service } = buildService({ resolveAccessScope: jest.fn().mockResolvedValue(null) });

      await expect(
        service.assertAccess(PARENT_ID, CHILD_ID, 'progress_view'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException for a revoked link even if a consent row exists', async () => {
      const { service } = buildService({
        resolveAccessScope: jest
          .fn()
          .mockResolvedValue(buildScope({ linkStatus: 'revoked', grantedConsentTypes: ['progress_view'] })),
      });

      await expect(
        service.assertAccess(PARENT_ID, CHILD_ID, 'progress_view'),
      ).rejects.toThrow('Parent does not have an active link to this child.');
    });

    it('throws ForbiddenException when the link is active but the required consent is not granted', async () => {
      const { service } = buildService({
        resolveAccessScope: jest
          .fn()
          .mockResolvedValue(buildScope({ linkStatus: 'active', grantedConsentTypes: ['assessment_view'] })),
      });

      await expect(
        service.assertAccess(PARENT_ID, CHILD_ID, 'progress_view'),
      ).rejects.toThrow('Parent has not been granted "progress_view" consent for this child.');
    });

    it('returns the scope when the exact required consent type is granted', async () => {
      const scope = buildScope({ linkStatus: 'active', grantedConsentTypes: ['progress_view'] });
      const { service } = buildService({ resolveAccessScope: jest.fn().mockResolvedValue(scope) });

      await expect(service.assertAccess(PARENT_ID, CHILD_ID, 'progress_view')).resolves.toBe(scope);
    });

    it('returns the scope when full_access has been granted instead of the specific type', async () => {
      const scope = buildScope({ linkStatus: 'active', grantedConsentTypes: ['full_access'] });
      const { service } = buildService({ resolveAccessScope: jest.fn().mockResolvedValue(scope) });

      await expect(service.assertAccess(PARENT_ID, CHILD_ID, 'assessment_view')).resolves.toBe(scope);
    });
  });

  describe('canAccess', () => {
    it('returns false for an unlinked child', async () => {
      const { service } = buildService({ resolveAccessScope: jest.fn().mockResolvedValue(null) });

      await expect(service.canAccess(PARENT_ID, CHILD_ID, 'progress_view')).resolves.toBe(false);
    });

    it('returns false for a revoked link', async () => {
      const { service } = buildService({
        resolveAccessScope: jest.fn().mockResolvedValue(buildScope({ linkStatus: 'revoked' })),
      });

      await expect(service.canAccess(PARENT_ID, CHILD_ID, 'progress_view')).resolves.toBe(false);
    });

    it('returns false for an active link missing the required consent', async () => {
      const { service } = buildService({
        resolveAccessScope: jest.fn().mockResolvedValue(buildScope({ linkStatus: 'active', grantedConsentTypes: [] })),
      });

      await expect(service.canAccess(PARENT_ID, CHILD_ID, 'progress_view')).resolves.toBe(false);
    });

    it('returns true for an active link with the required consent granted', async () => {
      const { service } = buildService({
        resolveAccessScope: jest
          .fn()
          .mockResolvedValue(buildScope({ linkStatus: 'active', grantedConsentTypes: ['progress_view'] })),
      });

      await expect(service.canAccess(PARENT_ID, CHILD_ID, 'progress_view')).resolves.toBe(true);
    });
  });

  describe('listAccessibleChildIds', () => {
    it('returns only child ids from active links, excluding revoked and pending ones', async () => {
      const { service } = buildService({
        listLinksForParent: jest.fn().mockResolvedValue([
          { childId: 'child-active', status: 'active' },
          { childId: 'child-revoked', status: 'revoked' },
          { childId: 'child-pending', status: 'pending' },
        ]),
      });

      await expect(service.listAccessibleChildIds(PARENT_ID)).resolves.toEqual(['child-active']);
    });

    it('returns an empty array when the parent has no links', async () => {
      const { service } = buildService({ listLinksForParent: jest.fn().mockResolvedValue([]) });

      await expect(service.listAccessibleChildIds(PARENT_ID)).resolves.toEqual([]);
    });
  });
});
