import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { SubscriptionService } from './subscription.service';
import { PaymentService } from './payment.service';
import { InvoiceService } from './invoice.service';
import { RefundService } from './refund.service';
import { ProviderWebhookService } from './provider-webhook.service';
import { BillingAuditService } from './billing-audit.service';

@ApiTags('Admin Billing')
@Controller('admin/billing')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminBillingController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly paymentService: PaymentService,
    private readonly invoiceService: InvoiceService,
    private readonly refundService: RefundService,
    private readonly webhookService: ProviderWebhookService,
    private readonly auditService: BillingAuditService,
  ) {}

  @Get('subscriptions/:userId')
  @ApiOperation({ summary: 'Get subscriptions for a user (admin)' })
  async getUserSubscriptions(@Param('userId') userId: string) {
    return this.subscriptionService.getUserSubscriptions(userId);
  }

  @Get('payments/:userId')
  @ApiOperation({ summary: 'Get payments for a user (admin)' })
  async getUserPayments(@Param('userId') userId: string) {
    return this.paymentService.getUserPayments(userId);
  }

  @Get('invoices/:userId')
  @ApiOperation({ summary: 'Get invoices for a user (admin)' })
  async getUserInvoices(@Param('userId') userId: string) {
    return this.invoiceService.getUserInvoices(userId);
  }

  @Get('refunds/:paymentId')
  @ApiOperation({ summary: 'Get refunds for a payment (admin)' })
  async getPaymentRefunds(@Param('paymentId') paymentId: string) {
    return this.refundService.getRefundsByPayment(paymentId);
  }

  @Get('provider-events')
  @ApiOperation({ summary: 'Get provider events by status (admin)' })
  async getProviderEvents(
    @Query('status') status: 'pending' | 'processed' | 'failed' | 'skipped' = 'pending',
  ) {
    return this.webhookService.getEventsByStatus(status);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get billing audit logs (admin)' })
  async getAuditLogs(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('actorId') actorId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getAuditLogs({
      entityType,
      entityId,
      actorId,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
