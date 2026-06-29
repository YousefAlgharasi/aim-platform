import { Module, forwardRef } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { RolesModule } from '../roles';
import { UsersModule } from '../users';
import { AnalyticsModule } from '../analytics/analytics.module';
import { BillingRepository } from './billing.repository';
import { ProductPriceService } from './product-price.service';
import { EntitlementService } from './entitlement.service';
import { SubscriptionService } from './subscription.service';
import { CheckoutService } from './checkout.service';
import { PaymentService } from './payment.service';
import { InvoiceService } from './invoice.service';
import { RefundService } from './refund.service';
import { ProviderWebhookService } from './provider-webhook.service';
import { BillingAuditService } from './billing-audit.service';
import { BillingIdempotencyService } from './billing-idempotency.service';
import { CouponService } from './coupon.service';
import { PAYMENT_PROVIDER_ADAPTER } from './payment-provider.adapter';
import { AdminBillingController } from './admin-billing.controller';
import { CheckoutStatusController } from './checkout-status.controller';
import { CheckoutController } from './checkout.controller';
import { InvoicesController } from './invoices.controller';
import { PricingController } from './pricing.controller';
import { RefundController } from './refund.controller';
import { SubscriptionController } from './subscription.controller';
import { WebhookController } from './webhook.controller';
import { SuperAdminBillingController } from './super-admin-billing.controller';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule), RolesModule, UsersModule, AnalyticsModule],
  controllers: [
    AdminBillingController,
    SuperAdminBillingController,
    CheckoutController,
    CheckoutStatusController,
    InvoicesController,
    PricingController,
    RefundController,
    SubscriptionController,
    WebhookController,
  ],
  providers: [
    {
      provide: PAYMENT_PROVIDER_ADAPTER,
      useValue: {},
    },
    BillingRepository,
    ProductPriceService,
    EntitlementService,
    SubscriptionService,
    CheckoutService,
    PaymentService,
    InvoiceService,
    RefundService,
    ProviderWebhookService,
    BillingAuditService,
    BillingIdempotencyService,
    CouponService,
  ],
  exports: [
    BillingRepository,
    ProductPriceService,
    EntitlementService,
    SubscriptionService,
    CheckoutService,
    PaymentService,
    InvoiceService,
    RefundService,
    ProviderWebhookService,
    BillingAuditService,
    BillingIdempotencyService,
    CouponService,
  ],
})
export class BillingModule {}
