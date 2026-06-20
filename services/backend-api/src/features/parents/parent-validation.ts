// P12-018: Add Parent Validation Rules
// Pure validation helpers for the business rules that DTO-level class-validator
// decorators cannot express: invitation acceptability (status + expiry), link
// status, consent status, child id shape, and access-scope membership.
//
// These helpers never trust client-submitted status/expiry/scope values — they
// only validate rows already resolved from ParentRepository, or raw route/query
// input before it is used to look anything up. They throw the same Nest
// exceptions already used across the parent feature (BadRequestException,
// ForbiddenException, NotFoundException) so error responses stay consistent
// with the existing GlobalExceptionFilter envelope.

import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

import {
  PARENT_CONSENT_TYPES,
  ParentConsentType,
  PARENT_CHILD_LINK_STATUSES,
  ParentChildLinkStatus,
} from './dto/parent-enums';
import { ParentChildLinkRow, ParentConsentRow, ParentInvitationRow } from './parent-repository.types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function assertValidChildId(childId: string): void {
  if (!isUuid(childId)) {
    throw new BadRequestException('childId must be a valid UUID.');
  }
}

export function isValidConsentType(value: string): value is ParentConsentType {
  return (PARENT_CONSENT_TYPES as readonly string[]).includes(value);
}

export function assertValidConsentScope(value: string): void {
  if (!isValidConsentType(value)) {
    throw new BadRequestException(`"${value}" is not a supported consent scope.`);
  }
}

export function isValidLinkStatus(value: string): value is ParentChildLinkStatus {
  return (PARENT_CHILD_LINK_STATUSES as readonly string[]).includes(value);
}

export function assertLinkExists(link: ParentChildLinkRow | null): ParentChildLinkRow {
  if (!link) {
    throw new NotFoundException('Parent-child link not found.');
  }

  return link;
}

export function assertLinkIsActive(link: ParentChildLinkRow): void {
  if (link.status !== 'active') {
    throw new ForbiddenException('Parent-child link is not active.');
  }
}

export function assertConsentIsGranted(consent: ParentConsentRow | null): ParentConsentRow {
  if (!consent || consent.status !== 'granted') {
    throw new ForbiddenException('Consent for this access type has not been granted.');
  }

  return consent;
}

export function assertInvitationExists(
  invitation: ParentInvitationRow | null,
): ParentInvitationRow {
  if (!invitation) {
    throw new NotFoundException('Invitation not found or already used.');
  }

  return invitation;
}

export function assertInvitationIsAcceptable(invitation: ParentInvitationRow): void {
  if (invitation.status !== 'pending') {
    throw new BadRequestException('Invitation is not pending and cannot be accepted.');
  }

  if (invitation.expires_at.getTime() < Date.now()) {
    throw new BadRequestException('Invitation has expired.');
  }
}

export function assertInvitationIsRevocable(invitation: ParentInvitationRow): void {
  if (invitation.status !== 'pending') {
    throw new BadRequestException('Only a pending invitation can be revoked.');
  }
}
