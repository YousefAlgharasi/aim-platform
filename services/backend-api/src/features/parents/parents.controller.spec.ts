// P12-031: Create Parent Children API
// ParentsController unit tests.

import { ParentsController } from './parents.controller';

const PARENT_ID = 'parent-uuid-001';

function buildController(overrides: {
  links?: Array<Record<string, unknown>>;
  findByUserId?: jest.Mock;
  getSummaryForParent?: jest.Mock;
  getProgressForParent?: jest.Mock;
  getAssessmentSummaryForParent?: jest.Mock;
  getActivitySummaryForParent?: jest.Mock;
  getReportForParent?: jest.Mock;
  createInvitation?: jest.Mock;
  acceptInvitation?: jest.Mock;
  revokeInvitation?: jest.Mock;
  listInvitationsForParent?: jest.Mock;
  findLinkById?: jest.Mock;
  grantConsent?: jest.Mock;
  revokeConsentByType?: jest.Mock;
  listConsentsForLink?: jest.Mock;
  listPreferencesForParent?: jest.Mock;
  updatePreference?: jest.Mock;
} = {}) {
  const parentChildLinkService = {
    listLinksForParent: jest.fn().mockResolvedValue(
      overrides.links ?? [
        {
          id: 'link-1',
          parentId: PARENT_ID,
          childId: 'child-1',
          relationshipType: 'parent',
          status: 'active',
        },
      ],
    ),
    findLinkById:
      overrides.findLinkById ??
      jest.fn().mockResolvedValue({
        id: 'link-1',
        parentId: PARENT_ID,
        childId: 'child-1',
        relationshipType: 'parent',
        status: 'active',
      }),
  };

  const studentsService = {
    findByUserId:
      overrides.findByUserId ?? jest.fn().mockResolvedValue({ displayName: 'Child One' }),
  };

  const parentDashboardSummaryService = {
    getSummaryForParent:
      overrides.getSummaryForParent ??
      jest.fn().mockResolvedValue({ parentId: PARENT_ID, children: [] }),
  };

  const parentChildProgressService = {
    getProgressForParent:
      overrides.getProgressForParent ??
      jest.fn().mockResolvedValue({ childId: 'child-1', skillStates: [] }),
  };

  const parentAssessmentSummaryService = {
    getAssessmentSummaryForParent:
      overrides.getAssessmentSummaryForParent ??
      jest.fn().mockResolvedValue({ childId: 'child-1', results: [], upcomingAssessments: [] }),
  };

  const parentActivitySummaryService = {
    getActivitySummaryForParent:
      overrides.getActivitySummaryForParent ??
      jest.fn().mockResolvedValue({ childId: 'child-1', recentSessions: [], lastActiveAt: null }),
  };

  const parentReportService = {
    getReportForParent:
      overrides.getReportForParent ??
      jest.fn().mockResolvedValue({ childId: 'child-1', reportType: 'weekly', summary: 'ok' }),
  };

  const parentInvitationService = {
    createInvitation:
      overrides.createInvitation ??
      jest.fn().mockResolvedValue({ id: 'invitation-1', status: 'pending' }),
    acceptInvitation:
      overrides.acceptInvitation ??
      jest.fn().mockResolvedValue({ id: 'invitation-1', status: 'accepted' }),
    revokeInvitation:
      overrides.revokeInvitation ??
      jest.fn().mockResolvedValue({ id: 'invitation-1', status: 'cancelled' }),
    listInvitationsForParent:
      overrides.listInvitationsForParent ?? jest.fn().mockResolvedValue([{ id: 'invitation-1' }]),
  };

  const parentConsentService = {
    grantConsent:
      overrides.grantConsent ??
      jest.fn().mockResolvedValue({ id: 'consent-1', status: 'granted' }),
    revokeConsentByType:
      overrides.revokeConsentByType ??
      jest.fn().mockResolvedValue({ id: 'consent-1', status: 'revoked' }),
    listConsentsForLink:
      overrides.listConsentsForLink ?? jest.fn().mockResolvedValue([{ id: 'consent-1' }]),
  };

  const parentNotificationPreferenceService = {
    listPreferencesForParent:
      overrides.listPreferencesForParent ??
      jest.fn().mockResolvedValue([{ id: 'pref-1', channel: 'email', category: 'progress_update', enabled: true }]),
    updatePreference:
      overrides.updatePreference ??
      jest.fn().mockResolvedValue({ id: 'pref-1', channel: 'email', category: 'progress_update', enabled: false }),
  };

  const controller = new ParentsController(
    parentChildLinkService as never,
    studentsService as never,
    parentDashboardSummaryService as never,
    parentChildProgressService as never,
    parentAssessmentSummaryService as never,
    parentActivitySummaryService as never,
    parentReportService as never,
    parentInvitationService as never,
    parentConsentService as never,
    parentNotificationPreferenceService as never,
  );

  return {
    controller,
    parentChildLinkService,
    studentsService,
    parentDashboardSummaryService,
    parentChildProgressService,
    parentAssessmentSummaryService,
    parentActivitySummaryService,
    parentReportService,
    parentInvitationService,
    parentConsentService,
    parentNotificationPreferenceService,
  };
}

describe('ParentsController', () => {
  describe('listChildren', () => {
    it('lists links for the authenticated parent', async () => {
      const { controller, parentChildLinkService } = buildController();

      await controller.listChildren({ id: PARENT_ID } as never);

      expect(parentChildLinkService.listLinksForParent).toHaveBeenCalledWith(PARENT_ID);
    });

    it('excludes revoked links', async () => {
      const { controller } = buildController({
        links: [
          { id: 'l1', childId: 'child-1', relationshipType: 'parent', status: 'active' },
          { id: 'l2', childId: 'child-2', relationshipType: 'parent', status: 'revoked' },
        ],
      });

      const result = await controller.listChildren({ id: PARENT_ID } as never);

      expect(result).toHaveLength(1);
      expect(result[0].childId).toBe('child-1');
    });

    it('maps childId, displayName, relationshipType, and linkStatus', async () => {
      const { controller } = buildController();

      const result = await controller.listChildren({ id: PARENT_ID } as never);

      expect(result).toEqual([
        {
          childId: 'child-1',
          displayName: 'Child One',
          relationshipType: 'parent',
          linkStatus: 'active',
        },
      ]);
    });

    it('falls back to childId as displayName when no student profile exists', async () => {
      const { controller } = buildController({
        findByUserId: jest.fn().mockResolvedValue(null),
      });

      const result = await controller.listChildren({ id: PARENT_ID } as never);

      expect(result[0].displayName).toBe('child-1');
    });
  });

  describe('getDashboardSummary', () => {
    it('delegates to ParentDashboardSummaryService for the authenticated parent', async () => {
      const { controller, parentDashboardSummaryService } = buildController();

      const result = await controller.getDashboardSummary({ id: PARENT_ID } as never);

      expect(parentDashboardSummaryService.getSummaryForParent).toHaveBeenCalledWith(PARENT_ID);
      expect(result).toEqual({ parentId: PARENT_ID, children: [] });
    });
  });

  describe('getChildProgress', () => {
    it('delegates to ParentChildProgressService with the authenticated parent and route childId', async () => {
      const { controller, parentChildProgressService } = buildController();

      const result = await controller.getChildProgress({ id: PARENT_ID } as never, 'child-1');

      expect(parentChildProgressService.getProgressForParent).toHaveBeenCalledWith(PARENT_ID, 'child-1');
      expect(result).toEqual({ childId: 'child-1', skillStates: [] });
    });
  });

  describe('getChildAssessments', () => {
    it('delegates to ParentAssessmentSummaryService with the authenticated parent and route childId', async () => {
      const { controller, parentAssessmentSummaryService } = buildController();

      const result = await controller.getChildAssessments({ id: PARENT_ID } as never, 'child-1');

      expect(parentAssessmentSummaryService.getAssessmentSummaryForParent).toHaveBeenCalledWith(
        PARENT_ID,
        'child-1',
      );
      expect(result).toEqual({ childId: 'child-1', results: [], upcomingAssessments: [] });
    });
  });

  describe('getChildActivity', () => {
    it('delegates to ParentActivitySummaryService with the authenticated parent and route childId', async () => {
      const { controller, parentActivitySummaryService } = buildController();

      const result = await controller.getChildActivity({ id: PARENT_ID } as never, 'child-1');

      expect(parentActivitySummaryService.getActivitySummaryForParent).toHaveBeenCalledWith(
        PARENT_ID,
        'child-1',
      );
      expect(result).toEqual({ childId: 'child-1', recentSessions: [], lastActiveAt: null });
    });
  });

  describe('getChildReport', () => {
    it('delegates to ParentReportService with the authenticated parent, childId, and requested period', async () => {
      const { controller, parentReportService } = buildController();

      const result = await controller.getChildReport({ id: PARENT_ID } as never, 'child-1', {
        period: 'monthly',
      });

      expect(parentReportService.getReportForParent).toHaveBeenCalledWith(
        PARENT_ID,
        'child-1',
        'monthly',
      );
      expect(result).toEqual({ childId: 'child-1', reportType: 'weekly', summary: 'ok' });
    });

    it('defaults to a weekly report when no period is given', async () => {
      const { controller, parentReportService } = buildController();

      await controller.getChildReport({ id: PARENT_ID } as never, 'child-1', {});

      expect(parentReportService.getReportForParent).toHaveBeenCalledWith(PARENT_ID, 'child-1', 'weekly');
    });
  });

  describe('createInvitation', () => {
    it('delegates to ParentInvitationService with the authenticated parent and body fields', async () => {
      const { controller, parentInvitationService } = buildController();

      await controller.createInvitation({ id: PARENT_ID } as never, {
        relationshipType: 'parent',
        childEmail: 'child@example.com',
      });

      expect(parentInvitationService.createInvitation).toHaveBeenCalledWith(
        PARENT_ID,
        'parent',
        'child@example.com',
        undefined,
      );
    });
  });

  describe('acceptInvitation', () => {
    it('delegates to ParentInvitationService with the authenticated child and invitation code', async () => {
      const { controller, parentInvitationService } = buildController();

      await controller.acceptInvitation({ id: 'child-1' } as never, { invitationCode: 'abc123' });

      expect(parentInvitationService.acceptInvitation).toHaveBeenCalledWith('child-1', 'abc123');
    });

    it('propagates a not-found error for an invalid/unknown invitation token', async () => {
      const { NotFoundException } = await import('@nestjs/common');
      const { controller } = buildController({
        acceptInvitation: jest.fn().mockRejectedValue(new NotFoundException('Invitation not found or already used.')),
      });

      await expect(
        controller.acceptInvitation({ id: 'child-1' } as never, { invitationCode: 'garbage-token' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('propagates a bad-request error for an expired invitation token', async () => {
      const { BadRequestException } = await import('@nestjs/common');
      const { controller } = buildController({
        acceptInvitation: jest.fn().mockRejectedValue(new BadRequestException('Invitation has expired.')),
      });

      await expect(
        controller.acceptInvitation({ id: 'child-1' } as never, { invitationCode: 'expired-code' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('revokeInvitation', () => {
    it('delegates to ParentInvitationService with the authenticated parent and route invitationId', async () => {
      const { controller, parentInvitationService } = buildController();

      await controller.revokeInvitation({ id: PARENT_ID } as never, 'invitation-1');

      expect(parentInvitationService.revokeInvitation).toHaveBeenCalledWith(PARENT_ID, 'invitation-1');
    });

    it('propagates a forbidden error when revoking an invitation owned by another parent', async () => {
      const { ForbiddenException } = await import('@nestjs/common');
      const { controller } = buildController({
        revokeInvitation: jest.fn().mockRejectedValue(new ForbiddenException('Invitation does not belong to this parent.')),
      });

      await expect(
        controller.revokeInvitation({ id: 'someone-else' } as never, 'invitation-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('listInvitations', () => {
    it('delegates to ParentInvitationService for the authenticated parent', async () => {
      const { controller, parentInvitationService } = buildController();

      const result = await controller.listInvitations({ id: PARENT_ID } as never);

      expect(parentInvitationService.listInvitationsForParent).toHaveBeenCalledWith(PARENT_ID);
      expect(result).toEqual([{ id: 'invitation-1' }]);
    });
  });

  describe('grantConsent', () => {
    it('grants consent when the caller is the child party of the link', async () => {
      const { controller, parentConsentService } = buildController();

      await controller.grantConsent({ id: 'child-1' } as never, {
        parentChildLinkId: 'link-1',
        consentType: 'progress_view',
      });

      expect(parentConsentService.grantConsent).toHaveBeenCalledWith(
        'link-1',
        'progress_view',
        'child-1',
      );
    });

    it('rejects the grant when the caller is not the child party of the link', async () => {
      const { controller } = buildController();

      await expect(
        controller.grantConsent({ id: PARENT_ID } as never, {
          parentChildLinkId: 'link-1',
          consentType: 'progress_view',
        }),
      ).rejects.toThrow('Only the child party of this link may manage its consent.');
    });
  });

  describe('revokeConsent', () => {
    it('revokes consent when the caller is the child party of the link', async () => {
      const { controller, parentConsentService } = buildController();

      await controller.revokeConsent({ id: 'child-1' } as never, {
        parentChildLinkId: 'link-1',
        consentType: 'progress_view',
      });

      expect(parentConsentService.revokeConsentByType).toHaveBeenCalledWith('link-1', 'progress_view');
    });
  });

  describe('listConsentsForLink', () => {
    it('returns consents when the caller is the parent party of the link', async () => {
      const { controller, parentConsentService } = buildController();

      const result = await controller.listConsentsForLink({ id: PARENT_ID } as never, 'link-1');

      expect(parentConsentService.listConsentsForLink).toHaveBeenCalledWith('link-1');
      expect(result).toEqual([{ id: 'consent-1' }]);
    });

    it('rejects an unrelated caller', async () => {
      const { controller } = buildController();

      await expect(
        controller.listConsentsForLink({ id: 'someone-else' } as never, 'link-1'),
      ).rejects.toThrow('You do not have access to this parent-child link.');
    });
  });

  describe('listNotificationPreferences', () => {
    it('lists notification preferences for the authenticated parent', async () => {
      const { controller, parentNotificationPreferenceService } = buildController();

      const result = await controller.listNotificationPreferences({ id: PARENT_ID } as never);

      expect(parentNotificationPreferenceService.listPreferencesForParent).toHaveBeenCalledWith(PARENT_ID);
      expect(result).toEqual([{ id: 'pref-1', channel: 'email', category: 'progress_update', enabled: true }]);
    });
  });

  describe('updateNotificationPreference', () => {
    it('updates the notification preference for the authenticated parent', async () => {
      const { controller, parentNotificationPreferenceService } = buildController();

      const result = await controller.updateNotificationPreference({ id: PARENT_ID } as never, {
        channel: 'email',
        category: 'progress_update',
        enabled: false,
      } as never);

      expect(parentNotificationPreferenceService.updatePreference).toHaveBeenCalledWith(
        PARENT_ID,
        'email',
        'progress_update',
        false,
      );
      expect(result.enabled).toBe(false);
    });
  });
});
