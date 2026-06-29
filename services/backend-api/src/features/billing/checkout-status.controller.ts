import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { UsersService } from '../users/users.service';
import { CheckoutService } from './checkout.service';
import { PaymentService } from './payment.service';
import { CheckoutSession } from './billing.entities';

export interface CheckoutStatusResponse {
  sessionId: string;
  status: string;
  paymentStatus?: string;
  subscriptionId?: string;
}

@ApiTags('Billing')
@Controller('billing/checkout')
export class CheckoutStatusController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly paymentService: PaymentService,
    private readonly usersService: UsersService,
  ) {}

  @Get(':sessionId/status')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get checkout session status' })
  async getCheckoutStatus(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CheckoutStatusResponse> {
    const internalUser = await this.usersService.getBySupabaseUid(user.id);
    const session = await this.checkoutService.getCheckoutSession(
      sessionId,
      internalUser.id,
    );

    const response: CheckoutStatusResponse = {
      sessionId: session.id,
      status: session.status,
    };

    if (session.subscriptionId) {
      response.subscriptionId = session.subscriptionId;
    }

    return response;
  }

  @Get('recent')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent checkout sessions for current user' })
  async getRecentCheckouts(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CheckoutStatusResponse[]> {
    const internalUser = await this.usersService.getBySupabaseUid(user.id);
    const sessions = await this.checkoutService.getUserCheckoutSessions(
      internalUser.id,
    );

    return sessions.map((s: CheckoutSession) => ({
      sessionId: s.id,
      status: s.status,
      subscriptionId: s.subscriptionId || undefined,
    }));
  }
}
