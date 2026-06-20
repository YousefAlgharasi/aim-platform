// P12-017: Create Parent DTOs and Entities
// Read-only mirror of the parent_consents table. Consent grants/revocations
// are decided and recorded by the backend consent service only.

import { ApiProperty } from '@nestjs/swagger';
import { ParentConsentStatus, ParentConsentType } from './parent-enums';

export class ParentConsentEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  parentChildLinkId!: string;

  @ApiProperty()
  consentType!: ParentConsentType;

  @ApiProperty()
  status!: ParentConsentStatus;

  @ApiProperty()
  grantedAt!: string;

  @ApiProperty({ nullable: true })
  revokedAt!: string | null;

  @ApiProperty()
  grantedBy!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
