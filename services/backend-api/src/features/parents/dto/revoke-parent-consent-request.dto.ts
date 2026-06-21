// P12-017: Create Parent DTOs and Entities
// Request payload to revoke a previously granted consent scope.

import { IsEnum, IsUUID } from 'class-validator';
import { PARENT_CONSENT_TYPES, ParentConsentType } from './parent-enums';

export class RevokeParentConsentRequestDto {
  @IsUUID()
  readonly parentChildLinkId!: string;

  @IsEnum(PARENT_CONSENT_TYPES)
  readonly consentType!: ParentConsentType;
}
