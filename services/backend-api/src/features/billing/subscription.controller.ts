import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { UsersService } from '../users/users.service';
import { SubscriptionService } from './subscription.service';
import { EntitlementService } from './entitlement.service';
import { Subscription, BillingEntitlement } from './billing.entities';

export interface UserSubscriptionResponse {
  subscriptions: Subscription[];
  entitlements: BillingEntitlement[];
}

@ApiTags('Billing')
@Controller('billing/subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly entitlementService: EntitlementService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user subscriptions and entitlements' })
  async getUserSubscriptions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserSubscriptionResponse> {
    const internalUser = await this.usersService.getBySupabaseUid(user.id);
    const [subscriptions, entitlements] = await Promise.all([
      this.subscriptionService.getUserSubscriptions(internalUser.id),
      this.entitlementService.getUserEntitlements(internalUser.id),
    ]);

    return { subscriptions, entitlements };
  }

  @Get(':id')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription by ID' })
  async getSubscription(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Subscription> {
    const internalUser = await this.usersService.getBySupabaseUid(user.id);
    return this.subscriptionService.getSubscriptionById(id, internalUser.id);
  }

  @Post(':id/cancel')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription at period end' })
  async cancelSubscription(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Subscription> {
    const internalUser = await this.usersService.getBySupabaseUid(user.id);
    return this.subscriptionService.cancelSubscription(id, internalUser.id);
  }
}
