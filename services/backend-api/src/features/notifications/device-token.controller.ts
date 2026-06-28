import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { resolveAuthorizedRoles } from '../../auth/authorization/authorized-role.resolver';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { DeviceTokenService } from './device-token.service';
import { NotificationAuditService } from './notification-audit.service';
import { RegisterDeviceTokenRequestDto } from './dto';
import { NotificationOwnershipGuard } from './guards';

function resolveUserType(user: AuthenticatedUser): string {
  return resolveAuthorizedRoles(user).includes(AuthorizedRole.PARENT) ? 'parent' : 'student';
}

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/v1/notifications')
export class DeviceTokenController {
  constructor(
    private readonly deviceTokenService: DeviceTokenService,
    private readonly auditService: NotificationAuditService,
  ) {}

  @Post('device-tokens')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Register or update a push device token' })
  async registerDeviceToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterDeviceTokenRequestDto,
  ) {
    const token = await this.deviceTokenService.registerToken(
      user.id,
      dto.platform,
      dto.token,
      dto.deviceName ?? null,
    );
    await this.auditService.log(user.id, resolveUserType(user), 'token_registered', 'device_token', token.id, {
      platform: dto.platform,
    });
    return token;
  }

  @Delete('device-tokens/:tokenId')
  @UseGuards(SupabaseJwtAuthGuard, NotificationOwnershipGuard)
  @ApiOperation({ summary: 'Disable a device token' })
  async disableDeviceToken(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tokenId') tokenId: string,
  ) {
    await this.deviceTokenService.disableToken(tokenId, user.id);
    await this.auditService.log(user.id, resolveUserType(user), 'token_disabled', 'device_token', tokenId, null);
    return { success: true };
  }
}
