// P12-017: Create Parent DTOs and Entities
// Request payload for accepting a pending invitation by its code.

import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptParentInvitationRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly invitationCode!: string;
}
