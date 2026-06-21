import { Injectable, Logger } from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { PaymentProviderEvent } from './billing.entities';

export interface IdempotencyCheckResult {
  isDuplicate: boolean;
  existingEvent?: PaymentProviderEvent;
}

@Injectable()
export class BillingIdempotencyService {
  private readonly logger = new Logger(BillingIdempotencyService.name);

  constructor(private readonly billingRepo: BillingRepository) {}

  async checkIdempotency(idempotencyKey: string): Promise<IdempotencyCheckResult> {
    const existing = await this.billingRepo.findProviderEventByIdempotencyKey(idempotencyKey);
    if (existing) {
      this.logger.log(`Duplicate idempotency key detected: ${idempotencyKey}`);
      return { isDuplicate: true, existingEvent: existing };
    }
    return { isDuplicate: false };
  }

  async ensureIdempotent<T>(
    idempotencyKey: string,
    operation: () => Promise<T>,
  ): Promise<{ result: T; wasNew: boolean }> {
    const check = await this.checkIdempotency(idempotencyKey);
    if (check.isDuplicate) {
      return { result: check.existingEvent as unknown as T, wasNew: false };
    }

    const result = await operation();
    return { result, wasNew: true };
  }

  async checkCheckoutIdempotency(
    userId: string,
    priceId: string,
  ): Promise<{ isDuplicate: boolean; sessionId?: string }> {
    const pendingSessions = await this.billingRepo.findPendingCheckoutSessionsByUser(userId);
    const duplicate = pendingSessions.find(
      (s) => s.priceId === priceId && s.status === 'pending',
    );
    if (duplicate) {
      return { isDuplicate: true, sessionId: duplicate.id };
    }
    return { isDuplicate: false };
  }

  async checkRefundIdempotency(
    paymentId: string,
    amount: number,
  ): Promise<{ isDuplicate: boolean; refundId?: string }> {
    const pendingRefunds = await this.billingRepo.findRefundsByPaymentId(paymentId);
    const duplicate = pendingRefunds.find(
      (r) => r.amount === amount && r.status === 'pending',
    );
    if (duplicate) {
      return { isDuplicate: true, refundId: duplicate.id };
    }
    return { isDuplicate: false };
  }

  async checkSubscriptionIdempotency(
    userId: string,
    planId: string,
  ): Promise<{ isDuplicate: boolean; subscriptionId?: string }> {
    const activeSubscriptions = await this.billingRepo.findSubscriptionsByUserId(userId);
    const duplicate = activeSubscriptions.find(
      (s) => s.planId === planId && (s.status === 'active' || s.status === 'trialing'),
    );
    if (duplicate) {
      return { isDuplicate: true, subscriptionId: duplicate.id };
    }
    return { isDuplicate: false };
  }
}
