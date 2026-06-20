import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { BillingRepository } from './billing.repository';
import { ProductPriceService } from './product-price.service';
import { EntitlementService } from './entitlement.service';
import { SubscriptionService } from './subscription.service';
import { CheckoutService } from './checkout.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    BillingRepository,
    ProductPriceService,
    EntitlementService,
    SubscriptionService,
    CheckoutService,
  ],
  exports: [
    BillingRepository,
    ProductPriceService,
    EntitlementService,
    SubscriptionService,
    CheckoutService,
  ],
})
export class BillingModule {}
