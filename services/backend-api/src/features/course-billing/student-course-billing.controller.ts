/// <reference types="multer" />
// Student course billing endpoints.
//
//   GET  /student/billing/wallets                       active wallets to pay with
//   GET  /student/courses/:courseId/billing              price + access for a course
//   POST /student/courses/:courseId/payment-requests     submit a payment (multipart:
//                                                        walletId, transactionNumber, receipt)
//   GET  /student/payment-requests                      the student's payments
//   GET  /student/payment-requests/:id/receipt          the student's own receipt image
//
// The student id always comes from the verified JWT.

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CourseAccessService } from './course-access.service';
import { PaymentRequestView, StudentCourseBilling, WalletView } from './course-billing.types';
import { CoursePaymentService } from './course-payment.service';
import { MAX_PAYMENT_IMAGE_BYTES } from './payment-image.service';
import { PaymentWalletService } from './payment-wallet.service';

@ApiTags('course-billing')
@Controller('student')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class StudentCourseBillingController {
  constructor(
    private readonly access: CourseAccessService,
    private readonly payments: CoursePaymentService,
    private readonly wallets: PaymentWalletService,
  ) {}

  @Get('billing/wallets')
  @ApiOperation({ summary: 'Active wallets a student can pay with.' })
  async listWallets(): Promise<WalletView[]> {
    return this.wallets.list(true);
  }

  @Get('courses/:courseId/billing')
  @ApiOperation({ summary: "Price quote and the student's access for a course." })
  async getCourseBilling(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<StudentCourseBilling> {
    return this.access.getBilling(user.id, courseId);
  }

  @Post('courses/:courseId/payment-requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit a wallet payment (transaction number + receipt) for a course.' })
  @UseInterceptors(FileInterceptor('receipt', { limits: { fileSize: MAX_PAYMENT_IMAGE_BYTES } }))
  async submitPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body('walletId') walletId: string,
    @Body('transactionNumber') transactionNumber: string,
    @UploadedFile() receipt?: Express.Multer.File,
  ): Promise<PaymentRequestView> {
    return this.payments.submit(user.id, courseId, { walletId, transactionNumber }, receipt);
  }

  @Get('payment-requests')
  @ApiOperation({ summary: "The student's course payments, newest first." })
  async listPayments(@CurrentUser() user: AuthenticatedUser): Promise<PaymentRequestView[]> {
    return this.payments.listForStudent(user.id);
  }

  @Get('payment-requests/:id/receipt')
  @ApiOperation({ summary: "The student's own receipt image." })
  async getReceipt(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const image = await this.payments.receiptForStudent(user.id, id);
    res.setHeader('Content-Type', image.contentType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(image.data);
  }
}
