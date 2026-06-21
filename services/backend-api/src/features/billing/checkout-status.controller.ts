import {
  Controller,
  Get,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { CheckoutService } from './checkout.service';
import { PaymentService } from './payment.service';

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
  ) {}

  @Get(':sessionId/status')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get checkout session status' })
  async getCheckoutStatus(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CheckoutStatusResponse> {
    const session = await this.checkoutService.getCheckoutSessionById(
      sessionId,
    );

    if (session.userId !== user.internalUserId) {
      throw new ForbiddenException('Not authorized to access this checkout session');
    }

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
    const sessions = await this.checkoutService.getUserCheckoutSessions(
      user.internalUserId,
    );

    return sessions.map((s) => ({
      sessionId: s.id,
      status: s.status,
      subscriptionId: s.subscriptionId || undefined,
    }));
  }
}
