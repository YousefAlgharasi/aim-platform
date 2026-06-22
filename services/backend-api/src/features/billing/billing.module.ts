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

// Controllers are not registered yet — several services reference
// BillingRepository methods that have not been implemented (e.g.
// updatePayment, updateRefund, findPaymentsBySubscriptionId).
// Register controllers once the repository layer is complete.
@Module({
  imports: [DatabaseModule, AnalyticsModule],
  controllers: [],
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
