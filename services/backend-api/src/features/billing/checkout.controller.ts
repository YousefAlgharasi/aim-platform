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
import { UsersService } from '../users/users.service';
import { CheckoutService } from './checkout.service';
import { CheckoutSession } from './billing.entities';
import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

const URL_VALIDATION_OPTIONS = {
  require_tld: false,
  protocols: ['http', 'https', 'aim'],
  require_protocol: true,
};

export class CreateCheckoutSessionDto {
  @IsNotEmpty()
  @IsString()
  priceId!: string;

  @IsNotEmpty()
  @IsUrl(URL_VALIDATION_OPTIONS)
  successUrl!: string;

  @IsNotEmpty()
  @IsUrl(URL_VALIDATION_OPTIONS)
  cancelUrl!: string;

  @IsOptional()
  @IsString()
  promotionCode?: string;
}

@ApiTags('Billing')
@Controller('billing/checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a checkout session' })
  async createCheckoutSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSession> {
    const internalUser = await this.usersService.getBySupabaseUid(user.id);
    return this.checkoutService.createCheckoutSession(internalUser.id, {
      priceId: dto.priceId,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
      promotionCode: dto.promotionCode,
    });
  }
}
