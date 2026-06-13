// Phase 2 — P2-032
// Profile controller.
//
// Scope: Auth, Users, Roles only.
//
// Endpoints:
//   GET  /profile/me   — return the authenticated user's own safe profile.
//   PATCH /profile/me  — update the authenticated user's own safe profile fields.
//
// Security rules:
//   - All endpoints require a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - internalUserId is resolved from the verified JWT via @CurrentUser(); clients cannot supply it.
//   - Ownership is enforced by always using the JWT-sourced user ID — no client-supplied user IDs.
//   - Backend is the final authority for identity, roles, permissions, and ownership.
//   - Safe-field rules follow docs/phase-2/safe-auth-fields.md.
//   - No onboarding, placement, lessons, sessions, AIM, AI Teacher, or Student Web App logic.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { CurrentUser } from '../../auth/current-user.decorator';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { ProfileMeResponse, UpdateProfileMeInput } from './profile.types';
import { ProfileService } from './profile.service';

@ApiTags(OPENAPI_TAGS.profile)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * GET /profile/me
   *
   * Returns the authenticated user's own safe profile data.
   *
   * Identity is always sourced from the verified Supabase JWT.
   * Clients cannot supply a user ID — ownership is implicit.
   */
  @Get('me')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the authenticated user\'s own safe profile.' })
  @ApiOkResponse({ description: 'Safe profile data for the authenticated user.' })
  async getMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProfileMeResponse> {
    return this.profileService.getProfileForUser(user.id);
  }

  /**
   * PATCH /profile/me
   *
   * Updates safe, mutable fields on the authenticated user's own profile.
   *
   * Only safe fields defined in docs/phase-2/safe-auth-fields.md may be changed.
   * user_id, profile_type, roles, and permissions cannot be set through this endpoint.
   * Identity is always sourced from the verified JWT — ownership is implicit.
   */
  @Patch('me')
  @UseGuards(SupabaseJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the authenticated user\'s own safe profile fields.' })
  @ApiOkResponse({ description: 'Updated safe profile data.' })
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateProfileMeInput,
  ): Promise<ProfileMeResponse> {
    return this.profileService.updateProfileForUser(user.id, input);
  }
}
