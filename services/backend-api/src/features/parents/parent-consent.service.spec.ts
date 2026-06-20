// P12-038: Create Parent Consent APIs
// P12-043: Add Parent Consent Tests
// ParentConsentService unit tests covering consent grant, revoke, and
// access-scope resolution — the backend authority for which visibility
// scopes a parent currently holds for a child.

import { BadRequestException, NotFoundException } from '@nestjs/common';

import { ParentConsentService } from './parent-consent.service';

const LINK_ID = 'link-uuid-001';
const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';
const GRANTED_BY = 'child-uuid-001';

function buildConsentRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'consent-1',
    parent_child_link_id: LINK_ID,
    consent_type: 'progress_view',
    status: 'granted',
    granted_at: new Date(),
    revoked_at: null,
    granted_by: GRANTED_BY,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function buildLinkRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: LINK_ID,
    parent_id: PARENT_ID,
    child_id: CHILD_ID,
    relationship_type: 'parent',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function buildService(overrides: {
  findLinkById?: jest.Mock;
  findActiveConsent?: jest.Mock;
  findConsentById?: jest.Mock;
  grantConsent?: jest.Mock;
  revokeConsent?: jest.Mock;
  findConsentsByLink?: jest.Mock;
  findActiveLink?: jest.Mock;
} = {}) {
  const parentRepository = {
    findLinkById: overrides.findLinkById ?? jest.fn().mockResolvedValue(buildLinkRow()),
    findActiveConsent: overrides.findActiveConsent ?? jest.fn().mockResolvedValue(null),
    findConsentById: overrides.findConsentById ?? jest.fn().mockResolvedValue(buildConsentRow()),
    grantConsent: overrides.grantConsent ?? jest.fn().mockResolvedValue(buildConsentRow()),
    revokeConsent: overrides.revokeConsent ?? jest.fn().mockResolvedValue(undefined),
    findConsentsByLink: overrides.findConsentsByLink ?? jest.fn().mockResolvedValue([buildConsentRow()]),
    findActiveLink: overrides.findActiveLink ?? jest.fn().mockResolvedValue(buildLinkRow()),
  };

  const service = new ParentConsentService(parentRepository as never);

  return { service, parentRepository };
}

describe('ParentConsentService', () => {
  describe('grantConsent', () => {
    it('throws NotFoundException when the parent-child link does not exist', async () => {
      const { service } = buildService({ findLinkById: jest.fn().mockResolvedValue(null) });

      await expect(service.grantConsent(LINK_ID, 'progress_view', GRANTED_BY)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws BadRequestException when the link is not active (e.g. pending)', async () => {
      const { service } = buildService({
        findLinkById: jest.fn().mockResolvedValue(buildLinkRow({ status: 'pending' })),
      });

      await expect(service.grantConsent(LINK_ID, 'progress_view', GRANTED_BY)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('throws BadRequestException when the link has been revoked', async () => {
      const { service } = buildService({
        findLinkById: jest.fn().mockResolvedValue(buildLinkRow({ status: 'revoked' })),
      });

      await expect(service.grantConsent(LINK_ID, 'progress_view', GRANTED_BY)).rejects.toThrow(
        'Consent can only be granted for an active parent-child link.',
      );
    });

    it('throws BadRequestException when the consent type is already granted', async () => {
      const { service } = buildService({
        findActiveConsent: jest.fn().mockResolvedValue(buildConsentRow()),
      });

      await expect(service.grantConsent(LINK_ID, 'progress_view', GRANTED_BY)).rejects.toThrow(
        'This consent type is already granted for this link.',
      );
    });

    it('grants consent and returns the persisted entity', async () => {
      const { service, parentRepository } = buildService();

      const result = await service.grantConsent(LINK_ID, 'progress_view', GRANTED_BY);

      expect(parentRepository.grantConsent).toHaveBeenCalledWith(LINK_ID, 'progress_view', GRANTED_BY);
      expect(result.status).toBe('granted');
      expect(result.consentType).toBe('progress_view');
    });
  });

  describe('revokeConsentByType', () => {
    it('throws NotFoundException when no active consent of that type exists', async () => {
      const { service } = buildService({ findActiveConsent: jest.fn().mockResolvedValue(null) });

      await expect(service.revokeConsentByType(LINK_ID, 'progress_view')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('revokes the matching active consent and returns the updated entity', async () => {
      const { service, parentRepository } = buildService({
        findActiveConsent: jest.fn().mockResolvedValue(buildConsentRow()),
        findConsentById: jest
          .fn()
          .mockResolvedValueOnce(buildConsentRow({ status: 'granted' }))
          .mockResolvedValueOnce(buildConsentRow({ status: 'revoked', revoked_at: new Date() })),
      });

      const result = await service.revokeConsentByType(LINK_ID, 'progress_view');

      expect(parentRepository.revokeConsent).toHaveBeenCalledWith('consent-1');
      expect(result.status).toBe('revoked');
    });
  });

  describe('revokeConsent', () => {
    it('throws NotFoundException when the consent id does not exist', async () => {
      const { service } = buildService({ findConsentById: jest.fn().mockResolvedValue(null) });

      await expect(service.revokeConsent('missing-consent')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when the consent is already revoked', async () => {
      const { service } = buildService({
        findConsentById: jest.fn().mockResolvedValue(buildConsentRow({ status: 'revoked' })),
      });

      await expect(service.revokeConsent('consent-1')).rejects.toThrow('Consent is already revoked.');
    });

    it('revokes a granted consent and returns the updated entity', async () => {
      const { service, parentRepository } = buildService({
        findConsentById: jest
          .fn()
          .mockResolvedValueOnce(buildConsentRow({ status: 'granted' }))
          .mockResolvedValueOnce(buildConsentRow({ status: 'revoked', revoked_at: new Date() })),
      });

      const result = await service.revokeConsent('consent-1');

      expect(parentRepository.revokeConsent).toHaveBeenCalledWith('consent-1');
      expect(result.status).toBe('revoked');
      expect(result.revokedAt).not.toBeNull();
    });
  });

  describe('listConsentsForLink', () => {
    it('maps consent rows for the given link to entities', async () => {
      const { service, parentRepository } = buildService();

      const result = await service.listConsentsForLink(LINK_ID);

      expect(parentRepository.findConsentsByLink).toHaveBeenCalledWith(LINK_ID);
      expect(result).toHaveLength(1);
      expect(result[0].parentChildLinkId).toBe(LINK_ID);
    });
  });

  describe('hasGrantedConsent', () => {
    it('returns false when no active consent of that type exists', async () => {
      const { service } = buildService({ findActiveConsent: jest.fn().mockResolvedValue(null) });

      await expect(service.hasGrantedConsent(LINK_ID, 'assessment_view')).resolves.toBe(false);
    });

    it('returns true when an active consent of that type exists', async () => {
      const { service } = buildService({
        findActiveConsent: jest.fn().mockResolvedValue(buildConsentRow({ consent_type: 'assessment_view' })),
      });

      await expect(service.hasGrantedConsent(LINK_ID, 'assessment_view')).resolves.toBe(true);
    });
  });

  describe('resolveAccessScope', () => {
    it('returns null when the parent has no active link to the child', async () => {
      const { service } = buildService({ findActiveLink: jest.fn().mockResolvedValue(null) });

      await expect(service.resolveAccessScope(PARENT_ID, CHILD_ID)).resolves.toBeNull();
    });

    it('includes only currently-granted consent types, excluding revoked ones', async () => {
      const { service } = buildService({
        findConsentsByLink: jest.fn().mockResolvedValue([
          buildConsentRow({ consent_type: 'progress_view', status: 'granted' }),
          buildConsentRow({ consent_type: 'assessment_view', status: 'revoked' }),
        ]),
      });

      const scope = await service.resolveAccessScope(PARENT_ID, CHILD_ID);

      expect(scope?.grantedConsentTypes).toEqual(['progress_view']);
    });

    it('returns an empty grantedConsentTypes array when no consent has been granted', async () => {
      const { service } = buildService({ findConsentsByLink: jest.fn().mockResolvedValue([]) });

      const scope = await service.resolveAccessScope(PARENT_ID, CHILD_ID);

      expect(scope?.grantedConsentTypes).toEqual([]);
      expect(scope?.linkStatus).toBe('active');
    });
  });
});
