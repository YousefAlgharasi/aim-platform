// Phase 2 — P2-025 (bootstrap endpoint added)
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OPENAPI_TAGS } from '../openapi/openapi.tags';
import { AuthenticatedUser } from './authenticated-user';
import { AuthMeResponse } from './auth-me.types';
import { AuthProfileBootstrapService } from './auth-profile-bootstrap.service';
import { BootstrapProfileResult } from './auth-profile-bootstrap.types';
import { CurrentUser } from './current-user.decorator';
import { presentAuthMe } from './auth-me.presenter';
import { SupabaseJwtAuthGuard } from './supabase-jwt-auth.guard';
import { PublicRoute } from './public-route.decorator';
import { AuthLoginService } from './auth-login.service';
import {
  AuthLoginResult,
  AuthRegisterResult,
  AuthTokenResult,
} from './auth-login.types';
import { AuthLoginDto, AuthRefreshDto, AuthRegisterDto } from './auth-login.dto';
import { extractBearerToken } from './bearer-token';
import { AuthenticatedRequest } from './authenticated-user';
import { RolesService } from '../features/roles/roles.service';
import { UsersService } from '../features/users/users.service';
import { StudentsService } from '../features/students/students.service';
import { isAuthorizedRole } from './authorization';
import { AuthMeProfile } from './auth-me.types';

@ApiTags(OPENAPI_TAGS.auth)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly profileBootstrap: AuthProfileBootstrapService,
    private readonly authLogin: AuthLoginService,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
    private readonly studentsService: StudentsService,
  ) {}

  /**
   * POST /auth/login
   *
   * Sole client-facing entry point for obtaining a session. Calls Supabase
   * Auth internally with the service-role key — clients never see Supabase
   * credentials or talk to Supabase directly.
   */
  @Post('login')
  @PublicRoute()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password.' })
  @ApiOkResponse({ description: 'Session tokens for the authenticated account.' })
  async login(@Body() body: AuthLoginDto): Promise<AuthLoginResult> {
    return this.authLogin.login(body);
  }

  /**
   * POST /auth/refresh
   *
   * Exchanges a refresh token for a new access/refresh token pair.
   */
  @Post('refresh')
  @PublicRoute()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for a new session.' })
  @ApiOkResponse({ description: 'New session tokens.' })
  async refresh(@Body() body: AuthRefreshDto): Promise<AuthTokenResult> {
    return this.authLogin.refresh(body);
  }

  /**
   * POST /auth/register
   *
   * Creates a new account via Supabase signUp. If email confirmation is
   * disabled on the Supabase project, also bootstraps the internal profile
   * and returns a usable session immediately.
   */
  @Post('register')
  @PublicRoute()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a new account with email and password.' })
  @ApiOkResponse({ description: 'Registration result — session tokens or confirmation pending.' })
  async register(@Body() body: AuthRegisterDto): Promise<AuthRegisterResult> {
    const result = await this.authLogin.register(body);

    if (!result.requiresEmailConfirmation && result.user) {
      await this.profileBootstrap.bootstrap({
        supabaseAuthUid: result.user.id,
        email: result.user.email,
      });
    }

    return result;
  }

  /**
   * POST /auth/logout
   *
   * Invalidates the Supabase session server-side. Requires a valid bearer
   * token; the client discards its locally stored tokens regardless of
   * outcome.
   */
  @Post('logout')
  @UseGuards(SupabaseJwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate the current session server-side.' })
  async logout(@Req() request: AuthenticatedRequest): Promise<void> {
    const token = extractBearerToken(request);
    if (token) {
      await this.authLogin.logout(token);
    }
  }

  @Get('me')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the safe current authenticated user context.' })
  @ApiOkResponse({ description: 'Safe current authenticated user context.' })
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<AuthMeResponse> {
    const internalUser = await this.usersService.findBySupabaseUid(user.id);
    if (!internalUser) {
      return presentAuthMe(user);
    }

    let profile: AuthMeProfile | null = null;
    if (internalUser.userType === 'student') {
      const studentProfile = await this.studentsService.findByUserId(internalUser.id);
      if (studentProfile) {
        profile = {
          id: studentProfile.id,
          profileType: 'student_profile',
          displayName: studentProfile.displayName ?? undefined,
          avatarUrl: studentProfile.avatarUrl ?? undefined,
          preferredLanguage: studentProfile.preferredLanguage ?? undefined,
          timezone: studentProfile.timezone ?? undefined,
        };
      }
    }

    const baseResponse = presentAuthMe(user, {
      userType: internalUser.userType,
      status: internalUser.status,
      profile,
    });

    const dbRoles = (await this.rolesService.getUserRoles(internalUser.id))
      .map((role) => role.key)
      .filter(isAuthorizedRole);

    const mergedRoles = [...new Set([...baseResponse.roles, ...dbRoles])];

    return { ...baseResponse, roles: mergedRoles };
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
