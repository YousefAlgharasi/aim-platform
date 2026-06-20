// P12-038: Create Parent Consent APIs
// ParentConsentService.revokeConsentByType unit tests (new method added to
// support the revoke-by-type request shape used by the consent endpoints).

import { NotFoundException } from '@nestjs/common';

import { ParentConsentService } from './parent-consent.service';

const LINK_ID = 'link-uuid-001';

function buildService(overrides: {
  findActiveConsent?: jest.Mock;
  findConsentById?: jest.Mock;
} = {}) {
  const parentRepository = {
    findActiveConsent:
      overrides.findActiveConsent ??
      jest.fn().mockResolvedValue({
        id: 'consent-1',
        parent_child_link_id: LINK_ID,
        consent_type: 'progress_view',
        status: 'granted',
        granted_at: new Date(),
        revoked_at: null,
        granted_by: 'child-1',
        created_at: new Date(),
        updated_at: new Date(),
      }),
    findConsentById:
      overrides.findConsentById ??
      jest
        .fn()
        .mockResolvedValueOnce({
          id: 'consent-1',
          parent_child_link_id: LINK_ID,
          consent_type: 'progress_view',
          status: 'granted',
          granted_at: new Date(),
          revoked_at: null,
          granted_by: 'child-1',
          created_at: new Date(),
          updated_at: new Date(),
        })
        .mockResolvedValueOnce({
          id: 'consent-1',
          parent_child_link_id: LINK_ID,
          consent_type: 'progress_view',
          status: 'revoked',
          granted_at: new Date(),
          revoked_at: new Date(),
          granted_by: 'child-1',
          created_at: new Date(),
          updated_at: new Date(),
        }),
    revokeConsent: jest.fn().mockResolvedValue(undefined),
  };

  const service = new ParentConsentService(parentRepository as never);

  return { service, parentRepository };
}

describe('ParentConsentService.revokeConsentByType', () => {
  it('throws NotFoundException when no active consent of that type exists', async () => {
    const { service } = buildService({ findActiveConsent: jest.fn().mockResolvedValue(null) });

    await expect(service.revokeConsentByType(LINK_ID, 'progress_view')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('revokes the matching active consent and returns the updated entity', async () => {
    const { service, parentRepository } = buildService();

    const result = await service.revokeConsentByType(LINK_ID, 'progress_view');

    expect(parentRepository.revokeConsent).toHaveBeenCalledWith('consent-1');
    expect(result.status).toBe('revoked');
  });
});
