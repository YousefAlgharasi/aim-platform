import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { CheckoutService } from './checkout.service';
import { CheckoutSession } from './billing.entities';
import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsNotEmpty()
  @IsString()
  priceId!: string;

  @IsNotEmpty()
  @IsUrl()
  successUrl!: string;

  @IsNotEmpty()
  @IsUrl()
  cancelUrl!: string;

  @IsOptional()
  @IsString()
  promotionCode?: string;
}

@ApiTags('Billing')
@Controller('billing/checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a checkout session' })
  async createCheckoutSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSession> {
    return this.checkoutService.createCheckoutSession({
      userId: user.internalUserId,
      priceId: dto.priceId,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
      promotionCode: dto.promotionCode,
    });
  }
}
