import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { BillingRepository } from './billing.repository';
import { ProductPriceService } from './product-price.service';
import { EntitlementService } from './entitlement.service';
import { SubscriptionService } from './subscription.service';
import { CheckoutService } from './checkout.service';
import { PaymentService } from './payment.service';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [DatabaseModule, AnalyticsModule],
  providers: [
    BillingRepository,
    ProductPriceService,
    EntitlementService,
    SubscriptionService,
    CheckoutService,
    PaymentService,
    InvoiceService,
  ],
  exports: [
    BillingRepository,
    ProductPriceService,
    EntitlementService,
    SubscriptionService,
    CheckoutService,
    PaymentService,
    InvoiceService,
  ],
})
export class BillingModule {}
