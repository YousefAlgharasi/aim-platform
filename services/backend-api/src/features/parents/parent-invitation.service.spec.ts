// P12-037: Create Parent Invitation APIs
// ParentInvitationService unit tests.

import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { ParentInvitationService } from './parent-invitation.service';

const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';
const INVITATION_ID = 'invitation-uuid-001';

function buildRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: INVITATION_ID,
    parent_id: PARENT_ID,
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
  };
}

function buildService(overrides: {
  findInvitationByCode?: jest.Mock;
  findInvitationById?: jest.Mock;
  createLink?: jest.Mock;
  acceptLink?: jest.Mock;
} = {}) {
  const parentRepository = {
    createInvitation: jest.fn().mockResolvedValue(buildRow()),
    findInvitationByCode: overrides.findInvitationByCode ?? jest.fn().mockResolvedValue(buildRow()),
    findInvitationById: overrides.findInvitationById ?? jest.fn().mockResolvedValue(buildRow({ status: 'accepted', child_id: CHILD_ID })),
    findInvitationsByParent: jest.fn().mockResolvedValue([buildRow()]),
    markInvitationAccepted: jest.fn().mockResolvedValue(undefined),
    markInvitationStatus: jest.fn().mockResolvedValue(undefined),
  };

  const parentChildLinkService = {
    createLink: overrides.createLink ?? jest.fn().mockResolvedValue({ id: 'link-1' }),
    acceptLink: overrides.acceptLink ?? jest.fn().mockResolvedValue({ id: 'link-1', status: 'active' }),
  };

  const service = new ParentInvitationService(
    parentRepository as never,
    parentChildLinkService as never,
  );

  return { service, parentRepository, parentChildLinkService };
}

describe('ParentInvitationService', () => {
  describe('createInvitation', () => {
    it('throws when neither childEmail nor childId is provided', async () => {
      const { service } = buildService();

      await expect(service.createInvitation(PARENT_ID, 'parent')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('generates an invitation code and persists it', async () => {
      const { service, parentRepository } = buildService();

      await service.createInvitation(PARENT_ID, 'parent', 'child@example.com');

      expect(parentRepository.createInvitation).toHaveBeenCalledWith(
        PARENT_ID,
        'parent',
        expect.any(String),
        expect.any(Date),
        'child@example.com',
        null,
      );
    });
  });

  describe('acceptInvitation', () => {
    it('throws NotFoundException when the invitation code does not resolve', async () => {
      const { service } = buildService({ findInvitationByCode: jest.fn().mockResolvedValue(null) });

      await expect(service.acceptInvitation(CHILD_ID, 'bad-code')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('marks an expired invitation as expired and throws', async () => {
      const { service, parentRepository } = buildService({
        findInvitationByCode: jest.fn().mockResolvedValue(buildRow({ expires_at: new Date(Date.now() - 1000) })),
      });

      await expect(service.acceptInvitation(CHILD_ID, 'abc123')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(parentRepository.markInvitationStatus).toHaveBeenCalledWith(INVITATION_ID, 'expired');
    });

    it('marks the invitation accepted and creates+activates a parent-child link', async () => {
      const { service, parentRepository, parentChildLinkService } = buildService();

      await service.acceptInvitation(CHILD_ID, 'abc123');

      expect(parentRepository.markInvitationAccepted).toHaveBeenCalledWith(INVITATION_ID, CHILD_ID);
      expect(parentChildLinkService.createLink).toHaveBeenCalledWith(PARENT_ID, CHILD_ID, 'parent');
      expect(parentChildLinkService.acceptLink).toHaveBeenCalledWith('link-1');
    });
  });

  describe('revokeInvitation', () => {
    it('throws ForbiddenException when the invitation belongs to a different parent', async () => {
      const { service } = buildService({
        findInvitationById: jest.fn().mockResolvedValue(buildRow({ parent_id: 'other-parent' })),
      });

      await expect(service.revokeInvitation(PARENT_ID, INVITATION_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('throws BadRequestException when the invitation is not pending', async () => {
      const { service } = buildService({
        findInvitationById: jest.fn().mockResolvedValue(buildRow({ status: 'accepted' })),
      });

      await expect(service.revokeInvitation(PARENT_ID, INVITATION_ID)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('cancels a pending invitation owned by the parent', async () => {
      const { service, parentRepository } = buildService({
        findInvitationById: jest
          .fn()
          .mockResolvedValueOnce(buildRow({ status: 'pending' }))
          .mockResolvedValueOnce(buildRow({ status: 'cancelled' })),
      });

      const result = await service.revokeInvitation(PARENT_ID, INVITATION_ID);

      expect(parentRepository.markInvitationStatus).toHaveBeenCalledWith(INVITATION_ID, 'cancelled');
      expect(result.status).toBe('cancelled');
    });
  });

  describe('listInvitationsForParent', () => {
    it('maps invitation rows to entities', async () => {
      const { service } = buildService();

      const result = await service.listInvitationsForParent(PARENT_ID);

      expect(result).toHaveLength(1);
      expect(result[0].parentId).toBe(PARENT_ID);
    });
  });
});
