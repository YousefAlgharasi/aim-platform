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
  ) {}

  @Get()
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user subscriptions and entitlements' })
  async getUserSubscriptions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserSubscriptionResponse> {
    const [subscriptions, entitlements] = await Promise.all([
      this.subscriptionService.getUserSubscriptions(user.internalUserId),
      this.entitlementService.getUserEntitlements(user.internalUserId),
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
    return this.subscriptionService.getSubscriptionById(id, user.internalUserId);
  }

  @Post(':id/cancel')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription at period end' })
  async cancelSubscription(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Subscription> {
    return this.subscriptionService.cancelSubscription(id, user.internalUserId);
  }
}
