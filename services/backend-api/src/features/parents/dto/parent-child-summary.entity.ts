// P12-031: Create Parent Children API
// Read-only summary of a linked child for the parent child selector. No
// progress, assessment, or AIM data is included here.

import { ApiProperty } from '@nestjs/swagger';

import { ParentRelationshipType, ParentChildLinkStatus } from './parent-enums';

export class ParentChildSummaryEntity {
  @ApiProperty()
  childId!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty()
  relationshipType!: ParentRelationshipType;

  @ApiProperty()
  linkStatus!: ParentChildLinkStatus;
}
