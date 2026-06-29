import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { UsersService } from '../users/users.service';
import { RefundService } from './refund.service';
import { PaymentService } from './payment.service';
import { Refund } from './billing.entities';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateRefundRequestDto {
  @IsNotEmpty()
  @IsString()
  paymentId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount!: number;

  @IsNotEmpty()
  @IsString()
  currency!: string;

  @IsNotEmpty()
  @IsString()
  reason!: string;
}

@ApiTags('Billing')
@Controller('billing/refunds')
export class RefundController {
  constructor(
    private readonly refundService: RefundService,
    private readonly paymentService: PaymentService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request a refund' })
  async requestRefund(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRefundRequestDto,
  ): Promise<Refund> {
    const internalUser = await this.usersService.getBySupabaseUid(user.id);
    await this.paymentService.getPaymentById(dto.paymentId, internalUser.id);

    return this.refundService.requestRefund({
      paymentId: dto.paymentId,
      amount: dto.amount,
      currency: dto.currency,
      reason: dto.reason,
      requestedBy: internalUser.id,
    });
  }

  @Get(':id')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get refund status' })
  async getRefund(
    @Param('id') id: string,
  ): Promise<Refund> {
    return this.refundService.getRefundById(id);
  }
}
