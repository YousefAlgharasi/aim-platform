// P12-017: Create Parent DTOs and Entities
// Request payload for a parent requesting a new invitation. The backend
// generates the invitation code, status, and expiry; none of those are
// client-writable.

import { IsEmail, IsEnum, IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { PARENT_RELATIONSHIP_TYPES, ParentRelationshipType } from './parent-enums';

export class CreateParentInvitationRequestDto {
  @ValidateIf((dto: CreateParentInvitationRequestDto) => !dto.childId)
  @IsEmail()
  readonly childEmail?: string;

  @ValidateIf((dto: CreateParentInvitationRequestDto) => !dto.childEmail)
  @IsUUID()
  readonly childId?: string;

  @IsEnum(PARENT_RELATIONSHIP_TYPES)
  readonly relationshipType!: ParentRelationshipType;
}
