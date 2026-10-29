/// <reference types="multer" />
// Admin course billing endpoints (operations admins).
//
//   GET    /admin/course-billing/prices                     every course with its price
//   PUT    /admin/course-billing/prices/:courseId           set price / discount / access days
//   GET    /admin/course-billing/wallets                    all wallets
//   POST   /admin/course-billing/wallets                    add a wallet
//   PATCH  /admin/course-billing/wallets/:id                edit a wallet
//   DELETE /admin/course-billing/wallets/:id                delete (or deactivate if used)
//   PUT    /admin/course-billing/wallets/:id/logo|qr        upload image (multipart "image")
//   DELETE /admin/course-billing/wallets/:id/logo|qr        remove image
//   GET    /admin/course-billing/payment-requests?status=   payments to review
//   GET    /admin/course-billing/payment-requests/pending-count
//   GET    /admin/course-billing/payment-requests/:id/receipt
//   POST   /admin/course-billing/payment-requests/:id/approve|reject
//   GET    /admin/course-billing/access                     students' course access windows

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../auth/authenticated-user';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { OperationsAdminGuard, OperationsAdminOnly } from '../operations/operations.guards';
import { CourseAccessService } from './course-access.service';
import { ReviewPaymentDto, UpsertCoursePriceDto, WalletDto } from './course-billing.dtos';
import { AdminCoursePriceView, AdminPaymentRequestView, WalletView } from './course-billing.types';
import { CoursePaymentService } from './course-payment.service';
import { CoursePriceService } from './course-price.service';
import { MAX_PAYMENT_IMAGE_BYTES } from './payment-image.service';
import { PaymentWalletService, WalletImageKind } from './payment-wallet.service';

function imageKind(kind: string): WalletImageKind {
  if (kind !== 'logo' && kind !== 'qr') throw new BadRequestException('Image must be "logo" or "qr"');
  return kind;
}

@ApiTags('Admin Course Billing')
@Controller('admin/course-billing')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminCourseBillingController {
  constructor(
    private readonly prices: CoursePriceService,
    private readonly wallets: PaymentWalletService,
    private readonly payments: CoursePaymentService,
    private readonly access: CourseAccessService,
  ) {}

  // ── Prices ──

  @Get('prices')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Every course with its price and discount (admin).' })
  async listPrices(): Promise<AdminCoursePriceView[]> {
    return this.prices.list();
  }

  @Put('prices/:courseId')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Set a course price, discount and access days (admin).' })
  async upsertPrice(
    @Req() req: AuthenticatedRequest,
    @Param('courseId') courseId: string,
    @Body() dto: UpsertCoursePriceDto,
  ): Promise<AdminCoursePriceView> {
    return this.prices.upsert(courseId, dto, req.internalUserId!);
  }

  // ── Wallets ──

  @Get('wallets')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'All payment wallets (admin).' })
  async listWallets(): Promise<WalletView[]> {
    return this.wallets.list(false);
  }

  @Post('wallets')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Add a payment wallet (admin).' })
  async createWallet(@Body() dto: WalletDto): Promise<WalletView> {
    return this.wallets.create(dto);
  }

  @Patch('wallets/:id')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Edit a payment wallet (admin).' })
  async updateWallet(@Param('id') id: string, @Body() dto: WalletDto): Promise<WalletView> {
    return this.wallets.update(id, dto);
  }

  @Delete('wallets/:id')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Delete a wallet, or deactivate it if payments use it (admin).' })
  async removeWallet(@Param('id') id: string): Promise<{ deleted: boolean; deactivated: boolean }> {
    return this.wallets.remove(id);
  }

  @Put('wallets/:id/:kind')
  @OperationsAdminOnly()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a wallet logo or account/QR image (admin).' })
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: MAX_PAYMENT_IMAGE_BYTES } }))
  async uploadWalletImage(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('kind') kind: string,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<WalletView> {
    return this.wallets.setImage(id, imageKind(kind), image, req.internalUserId!);
  }

  @Delete('wallets/:id/:kind')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Remove a wallet logo or account/QR image (admin).' })
  async removeWalletImage(@Param('id') id: string, @Param('kind') kind: string): Promise<WalletView> {
    return this.wallets.clearImage(id, imageKind(kind));
  }

  // ── Payments ──

  @Get('payment-requests')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Course payments, optionally filtered by status (admin).' })
  async listPayments(@Query('status') status?: string): Promise<AdminPaymentRequestView[]> {
    return this.payments.listForAdmin(status || undefined);
  }

  @Get('payment-requests/pending-count')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'How many payments are waiting for review (admin).' })
  async pendingCount(): Promise<{ count: number }> {
    return { count: await this.payments.pendingCount() };
  }

  @Get('payment-requests/:id/receipt')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Receipt image of a payment (admin).' })
  async receipt(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const image = await this.payments.receiptForAdmin(id);
    res.setHeader('Content-Type', image.contentType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(image.data);
  }

  @Post('payment-requests/:id/approve')
  @OperationsAdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a payment and unlock the course for the student (admin).' })
  async approve(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ReviewPaymentDto,
  ): Promise<AdminPaymentRequestView> {
    return this.payments.approve(id, req.internalUserId!, dto.note);
  }

  @Post('payment-requests/:id/reject')
  @OperationsAdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a payment with a note for the student (admin).' })
  async reject(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ReviewPaymentDto,
  ): Promise<AdminPaymentRequestView> {
    return this.payments.reject(id, req.internalUserId!, dto.note);
  }

  // ── Access ──

  @Get('access')
  @OperationsAdminOnly()
  @ApiOperation({ summary: "Students' paid course access windows (admin)." })
  async listAccess(@Query('status') status?: string) {
    return this.access.listForAdmin(status || undefined);
  }
}
