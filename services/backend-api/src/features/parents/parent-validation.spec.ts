// P12-018: Add Parent Validation Rules
// Unit tests for the parent validation helpers.

import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

import {
  assertConsentIsGranted,
  assertInvitationExists,
  assertInvitationIsAcceptable,
  assertInvitationIsRevocable,
  assertLinkExists,
  assertLinkIsActive,
  assertValidChildId,
  assertValidConsentScope,
  isUuid,
  isValidConsentType,
  isValidLinkStatus,
} from './parent-validation';

const VALID_UUID = '11111111-1111-1111-1111-111111111111';

function buildLink(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: VALID_UUID,
    parent_id: VALID_UUID,
    child_id: VALID_UUID,
    relationship_type: 'parent',
    status: 'active',
    linked_at: new Date(),
    revoked_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  } as never;
}

function buildConsent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: VALID_UUID,
    parent_child_link_id: VALID_UUID,
    consent_type: 'progress_view',
    status: 'granted',
    granted_at: new Date(),
    revoked_at: null,
    granted_by: VALID_UUID,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  } as never;
}

function buildInvitation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: VALID_UUID,
    parent_id: VALID_UUID,
    child_email: 'child@example.com',
    child_id: null,
    invitation_code: 'abc123',
    relationship_type: 'parent',
    status: 'pending',
    expires_at: new Date(Date.now() + 1000 * 60 * 60),
    accepted_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  } as never;
}

describe('parent-validation', () => {
  describe('isUuid / assertValidChildId', () => {
    it('accepts a well-formed UUID', () => {
      expect(isUuid(VALID_UUID)).toBe(true);
    });

    it('rejects a non-UUID string', () => {
      expect(isUuid('not-a-uuid')).toBe(false);
    });

    it('throws BadRequestException for an invalid childId', () => {
      expect(() => assertValidChildId('not-a-uuid')).toThrow(BadRequestException);
    });

    it('does not throw for a valid childId', () => {
      expect(() => assertValidChildId(VALID_UUID)).not.toThrow();
    });
  });

  describe('isValidConsentType / assertValidConsentScope', () => {
    it('accepts every known consent type', () => {
      expect(isValidConsentType('progress_view')).toBe(true);
      expect(isValidConsentType('full_access')).toBe(true);
    });

    it('rejects an unsupported consent scope', () => {
      expect(isValidConsentType('not_a_real_scope')).toBe(false);
    });

    it('throws BadRequestException for an unsupported consent scope', () => {
      expect(() => assertValidConsentScope('not_a_real_scope')).toThrow(BadRequestException);
    });

    it('does not throw for a supported consent scope', () => {
      expect(() => assertValidConsentScope('assessment_view')).not.toThrow();
    });
  });

  describe('isValidLinkStatus', () => {
    it('accepts known link statuses', () => {
      expect(isValidLinkStatus('pending')).toBe(true);
      expect(isValidLinkStatus('active')).toBe(true);
      expect(isValidLinkStatus('revoked')).toBe(true);
    });

    it('rejects an unknown link status', () => {
      expect(isValidLinkStatus('archived')).toBe(false);
    });
  });

  describe('assertLinkExists / assertLinkIsActive', () => {
    it('throws NotFoundException when the link is null', () => {
      expect(() => assertLinkExists(null)).toThrow(NotFoundException);
    });

    it('returns the link when it exists', () => {
      const link = buildLink();
      expect(assertLinkExists(link)).toBe(link);
    });

    it('throws ForbiddenException when the link is pending', () => {
      expect(() => assertLinkIsActive(buildLink({ status: 'pending' }))).toThrow(
        ForbiddenException,
      );
    });

    it('throws ForbiddenException when the link is revoked', () => {
      expect(() => assertLinkIsActive(buildLink({ status: 'revoked' }))).toThrow(
        ForbiddenException,
      );
    });

    it('does not throw when the link is active', () => {
      expect(() => assertLinkIsActive(buildLink({ status: 'active' }))).not.toThrow();
    });
  });

  describe('assertConsentIsGranted', () => {
    it('throws ForbiddenException when the consent is null', () => {
      expect(() => assertConsentIsGranted(null)).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when the consent is revoked', () => {
      expect(() => assertConsentIsGranted(buildConsent({ status: 'revoked' }))).toThrow(
        ForbiddenException,
      );
    });

    it('returns the consent when it is granted', () => {
      const consent = buildConsent();
      expect(assertConsentIsGranted(consent)).toBe(consent);
    });
  });

  describe('assertInvitationExists / assertInvitationIsAcceptable', () => {
    it('throws NotFoundException when the invitation is null', () => {
      expect(() => assertInvitationExists(null)).toThrow(NotFoundException);
    });

    it('returns the invitation when it exists', () => {
      const invitation = buildInvitation();
      expect(assertInvitationExists(invitation)).toBe(invitation);
    });

    it('throws BadRequestException when the invitation is not pending', () => {
      expect(() =>
        assertInvitationIsAcceptable(buildInvitation({ status: 'accepted' })),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException when the invitation has expired', () => {
      expect(() =>
        assertInvitationIsAcceptable(
          buildInvitation({ expires_at: new Date(Date.now() - 1000) }),
        ),
      ).toThrow(BadRequestException);
    });

    it('does not throw for a pending, unexpired invitation', () => {
      expect(() => assertInvitationIsAcceptable(buildInvitation())).not.toThrow();
    });
  });

  describe('assertInvitationIsRevocable', () => {
    it('throws BadRequestException when the invitation is not pending', () => {
      expect(() =>
        assertInvitationIsRevocable(buildInvitation({ status: 'cancelled' })),
      ).toThrow(BadRequestException);
    });

    it('does not throw for a pending invitation', () => {
      expect(() => assertInvitationIsRevocable(buildInvitation())).not.toThrow();
    });
  });
});
