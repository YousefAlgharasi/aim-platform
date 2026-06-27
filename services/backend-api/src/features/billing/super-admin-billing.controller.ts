import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { BillingSuperAdminGuard } from './billing-super-admin.guard';
import { ProductPriceService } from './product-price.service';
import { SubscriptionService } from './subscription.service';
import { InvoiceService } from './invoice.service';
import { RefundService } from './refund.service';
import { CouponService } from './coupon.service';

@ApiTags('Super Admin Billing')
@Controller('admin/billing/manage')
@UseGuards(SupabaseJwtAuthGuard, BillingSuperAdminGuard)
@ApiBearerAuth()
export class SuperAdminBillingController {
  constructor(
    private readonly productPriceService: ProductPriceService,
    private readonly subscriptionService: SubscriptionService,
    private readonly invoiceService: InvoiceService,
    private readonly refundService: RefundService,
    private readonly couponService: CouponService,
  ) {}

  @Get('products')
  @ApiOperation({ summary: 'List all active products (super admin)' })
  async listProducts() {
    return this.productPriceService.getActiveProducts();
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a new product (super admin)' })
  async createProduct(
    @Body() body: { name: string; description?: string; productType: string },
  ) {
    return this.productPriceService.createProduct(body);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update a product (super admin)' })
  async updateProduct(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; status?: string },
  ) {
    return this.productPriceService.updateProduct(id, body);
  }

  @Get('prices')
  @ApiOperation({ summary: 'List all active prices (super admin)' })
  async listPrices() {
    return this.productPriceService.getActivePrices();
  }

  @Post('prices')
  @ApiOperation({ summary: 'Create a new price (super admin)' })
  async createPrice(
    @Body() body: { productId: string; amount: number; currency: string; billingInterval: string },
  ) {
    return this.productPriceService.createPrice(body);
  }

  @Get('plans')
  @ApiOperation({ summary: 'List all active plans (super admin)' })
  async listPlans() {
    return this.productPriceService.getActivePlans();
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create a new plan (super admin)' })
  async createPlan(
    @Body() body: { name: string; description?: string; priceId: string; features?: Record<string, unknown>; planType: string },
  ) {
    return this.productPriceService.createPlan(body);
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Update a plan (super admin)' })
  async updatePlan(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; features?: Record<string, unknown>; status?: string },
  ) {
    return this.productPriceService.updatePlan(id, body);
  }

  @Post('subscriptions')
  @ApiOperation({ summary: 'Create a subscription manually (super admin)' })
  async createSubscription(
    @Body() body: { userId: string; planId: string; status?: string },
  ) {
    return this.subscriptionService.createSubscription({
      userId: body.userId,
      planId: body.planId,
      status: (body.status as 'active' | 'trialing') ?? 'active',
    });
  }

  @Post('invoices')
  @ApiOperation({ summary: 'Create an invoice manually (super admin)' })
  async createInvoice(
    @Body() body: { userId: string; subscriptionId?: string; totalAmount: number; currency: string; dueDate?: string },
  ) {
    return this.invoiceService.createInvoice({
      userId: body.userId,
      subscriptionId: body.subscriptionId,
      totalAmount: body.totalAmount,
      currency: body.currency,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    });
  }

  @Patch('invoices/:id/status')
  @ApiOperation({ summary: 'Update invoice status (super admin)' })
  async updateInvoiceStatus(
    @Param('id') id: string,
    @Body() body: { status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible' },
  ) {
    return this.invoiceService.updateInvoiceStatus(id, body.status);
  }

  @Post('refunds/:id/approve')
  @ApiOperation({ summary: 'Approve a refund (super admin)' })
  async approveRefund(@Param('id') id: string) {
    return this.refundService.approveRefund(id, 'super_admin');
  }

  @Post('refunds/:id/deny')
  @ApiOperation({ summary: 'Deny a refund (super admin)' })
  async denyRefund(@Param('id') id: string) {
    return this.refundService.denyRefund(id, 'super_admin');
  }

  @Get('coupons')
  @ApiOperation({ summary: 'List all active coupons (super admin)' })
  async listCoupons() {
    return this.couponService.getActiveCoupons();
  }
}
