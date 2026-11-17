import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { PublicRoute } from '../../auth/public-route.decorator';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CourseCouponService } from './course-coupon.service';
import { MAX_PAYMENT_IMAGE_BYTES } from './payment-image.service';
import { PaymentWalletService } from './payment-wallet.service';

/** Landing page: browse prices, pay into a wallet and follow the purchase - no account needed. */
@ApiTags('Public Courses')
@Controller('public')
@PublicRoute()
export class PublicCourseCouponController {
  constructor(
    private readonly coupons: CourseCouponService,
    private readonly wallets: PaymentWalletService,
  ) {}

  @Get('courses')
  @ApiOperation({ summary: 'Published courses with their current price (public).' })
  listCourses() {
    return this.coupons.listPublicCourses();
  }

  @Get('wallets')
  @ApiOperation({ summary: 'Active payment wallets to pay into (public).' })
  listWallets() {
    return this.wallets.list(true);
  }

  @Post('coupon-purchases')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit a wallet payment (receipt + transaction number) to buy a course coupon (public).' })
  @UseInterceptors(FileInterceptor('receipt', { limits: { fileSize: MAX_PAYMENT_IMAGE_BYTES } }))
  submit(
    @Body('courseId') courseId: string,
    @Body('buyerName') buyerName: string,
    @Body('buyerContact') buyerContact: string,
    @Body('walletId') walletId: string,
    @Body('transactionNumber') transactionNumber: string,
    @UploadedFile() receipt?: Express.Multer.File,
  ) {
    return this.coupons.submitPurchase({ courseId, buyerName, buyerContact, walletId, transactionNumber }, receipt);
  }

  @Get('coupon-purchases/:token')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Status of a purchase (and its coupon code once approved) by its private token (public).' })
  status(@Param('token') token: string) {
    return this.coupons.purchaseStatus(token);
  }
}

@ApiTags('Student Coupons')
@Controller('student')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class StudentCourseCouponController {
  constructor(private readonly coupons: CourseCouponService) {}

  @Post('coupons/redeem')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Redeem a coupon code: the course is yours for good.' })
  redeem(@CurrentUser() user: AuthenticatedUser, @Body() body: { code?: string; courseId?: string }) {
    return this.coupons.redeem(user.id, body?.code ?? '', body?.courseId || undefined);
  }

  @Post('courses/:courseId/enroll-free')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enrol in a free course.' })
  enrollFree(@CurrentUser() user: AuthenticatedUser, @Param('courseId') courseId: string) {
    return this.coupons.enrollFree(user.id, courseId);
  }

  @Get('my-courses')
  @ApiOperation({ summary: 'Courses the student owns or has started (free), with progress.' })
  myCourses(@CurrentUser() user: AuthenticatedUser) {
    return this.coupons.myCourses(user.id);
  }
}
