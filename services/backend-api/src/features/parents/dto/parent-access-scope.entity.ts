// P12-017: Create Parent DTOs and Entities
// Backend-computed access scope: which consent types a parent currently
// holds for a given child, derived from an active link plus granted
// consents. This is never accepted from the client — only returned by
// backend guards/services as the source of truth for what a parent may see.

import { ApiProperty } from '@nestjs/swagger';
import { ParentChildLinkStatus, ParentConsentType } from './parent-enums';

export class ParentAccessScopeEntity {
  @ApiProperty()
  parentId!: string;

  @ApiProperty()
  childId!: string;

  @ApiProperty()
  parentChildLinkId!: string;

  @ApiProperty()
  linkStatus!: ParentChildLinkStatus;

  @ApiProperty({ type: [String] })
  grantedConsentTypes!: ParentConsentType[];
}
