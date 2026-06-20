// P12-017: Create Parent DTOs and Entities
// Request payload to grant consent for a visibility scope on an existing,
// active parent-child link. The backend verifies link ownership/status
// before recording the grant.

import { IsEnum, IsUUID } from 'class-validator';
import { PARENT_CONSENT_TYPES, ParentConsentType } from './parent-enums';

export class GrantParentConsentRequestDto {
  @IsUUID()
  readonly parentChildLinkId!: string;

  @IsEnum(PARENT_CONSENT_TYPES)
  readonly consentType!: ParentConsentType;
}
