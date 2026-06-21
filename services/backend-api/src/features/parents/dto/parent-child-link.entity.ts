// P12-017: Create Parent DTOs and Entities
// Read-only mirror of the parent_child_links table.
// The backend is the sole authority over link creation, acceptance, and
// revocation; parent UI may only display this entity, never construct it.

import { ApiProperty } from '@nestjs/swagger';
import { ParentChildLinkStatus, ParentRelationshipType } from './parent-enums';

export class ParentChildLinkEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  parentId!: string;

  @ApiProperty()
  childId!: string;

  @ApiProperty()
  relationshipType!: ParentRelationshipType;

  @ApiProperty()
  status!: ParentChildLinkStatus;

  @ApiProperty({ nullable: true })
  linkedAt!: string | null;

  @ApiProperty({ nullable: true })
  revokedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
