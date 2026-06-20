// P12-017: Create Parent DTOs and Entities
// Shared enums backing parent_child_links, parent_invitations, and
// parent_consents (see prisma/migrations/2026062000*_*parent*).

export const PARENT_RELATIONSHIP_TYPES = ['parent', 'guardian', 'other'] as const;
export type ParentRelationshipType = (typeof PARENT_RELATIONSHIP_TYPES)[number];

export const PARENT_CHILD_LINK_STATUSES = ['pending', 'active', 'revoked'] as const;
export type ParentChildLinkStatus = (typeof PARENT_CHILD_LINK_STATUSES)[number];

export const PARENT_INVITATION_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'expired',
  'cancelled',
] as const;
export type ParentInvitationStatus = (typeof PARENT_INVITATION_STATUSES)[number];

export const PARENT_CONSENT_TYPES = [
  'progress_view',
  'assessment_view',
  'activity_view',
  'report_view',
  'full_access',
] as const;
export type ParentConsentType = (typeof PARENT_CONSENT_TYPES)[number];

export const PARENT_CONSENT_STATUSES = ['granted', 'revoked'] as const;
export type ParentConsentStatus = (typeof PARENT_CONSENT_STATUSES)[number];
