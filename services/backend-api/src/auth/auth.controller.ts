// Phase 2 — P2-025 (bootstrap endpoint added)
import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OPENAPI_TAGS } from '../openapi/openapi.tags';
import { AuthenticatedUser } from './authenticated-user';
import { AuthMeResponse } from './auth-me.types';
import { AuthProfileBootstrapService } from './auth-profile-bootstrap.service';
import { BootstrapProfileResult } from './auth-profile-bootstrap.types';
import { CurrentUser } from './current-user.decorator';
import { presentAuthMe } from './auth-me.presenter';
import { SupabaseJwtAuthGuard } from './supabase-jwt-auth.guard';

@ApiTags(OPENAPI_TAGS.auth)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly profileBootstrap: AuthProfileBootstrapService,
  ) {}

  @Get('me')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the safe current authenticated user context.' })
  @ApiOkResponse({ description: 'Safe current authenticated user context.' })
  getMe(@CurrentUser() user: AuthenticatedUser): AuthMeResponse {
    return presentAuthMe(user);
  }

  /**
   * POST /auth/bootstrap
   *
   * Ensures an internal user record and matching profile row exist for the
   * authenticated account.  Idempotent — safe to call on every login.
   *
   * The Supabase Auth UID and email are taken exclusively from the verified JWT;
   * no client-supplied identity fields are accepted.
   *
   * Security: Backend resolves identity from the verified JWT only.
   * Clients cannot supply user IDs, user_type, roles, or permissions.
   */
  @Post('bootstrap')
  @UseGuards(SupabaseJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bootstrap internal user and profile records for the authenticated account.',
  })
  @ApiOkResponse({ description: 'Bootstrap result — user and profile state after upsert.' })
  async bootstrap(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BootstrapProfileResult> {
    return this.profileBootstrap.bootstrap({
      supabaseAuthUid: user.id,
      email: user.email ?? null,
    });
  }
}
