// P12-017: Create Parent DTOs and Entities
// Read-only mirror of the parent_invitations table.
// Invitation lifecycle (creation, acceptance, expiry) is decided by the
// backend invitation service only.

import { ApiProperty } from '@nestjs/swagger';
import { ParentInvitationStatus, ParentRelationshipType } from './parent-enums';

export class ParentInvitationEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  parentId!: string;

  @ApiProperty({ nullable: true })
  childEmail!: string | null;

  @ApiProperty({ nullable: true })
  childId!: string | null;

  @ApiProperty()
  invitationCode!: string;

  @ApiProperty()
  relationshipType!: ParentRelationshipType;

  @ApiProperty()
  status!: ParentInvitationStatus;

  @ApiProperty()
  expiresAt!: string;

  @ApiProperty({ nullable: true })
  acceptedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
