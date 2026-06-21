import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { Payment } from './billing.entities';
import { validateUUID, validateAmount, validateCurrency } from './billing.validation';
import { AnalyticsEventIngestionService } from '../analytics/analytics-event-ingestion.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly billingRepo: BillingRepository,
    private readonly analyticsEventIngestionService: AnalyticsEventIngestionService,
  ) {}

  async getUserPayments(userId: string): Promise<Payment[]> {
    validateUUID(userId, 'userId');
    return this.billingRepo.findPaymentsByUserId(userId);
  }

  async getPaymentById(id: string, userId?: string): Promise<Payment> {
    validateUUID(id, 'paymentId');
    const payment = await this.billingRepo.findPaymentById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (userId && payment.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this payment');
    }
    return payment;
  }

  async createPayment(data: {
    userId: string;
    checkoutSessionId?: string;
    subscriptionId?: string;
    amount: number;
    currency: string;
    status?: string;
    providerPaymentId?: string;
    paymentMethodType?: string;
  }): Promise<Payment> {
    validateUUID(data.userId, 'userId');
    validateAmount(data.amount);
    validateCurrency(data.currency);
    if (data.checkoutSessionId) validateUUID(data.checkoutSessionId, 'checkoutSessionId');
    if (data.subscriptionId) validateUUID(data.subscriptionId, 'subscriptionId');

    return this.billingRepo.createPayment({
      userId: data.userId,
      checkoutSessionId: data.checkoutSessionId || null,
      subscriptionId: data.subscriptionId || null,
      amount: data.amount,
      currency: data.currency.toUpperCase(),
      status: (data.status as Payment['status']) || 'pending',
      providerPaymentId: data.providerPaymentId || null,
      paymentMethodType: (data.paymentMethodType as Payment['paymentMethodType']) || null,
      metadata: {},
    } as Partial<Payment>);
  }

  async updatePaymentStatus(
    id: string,
    status: Payment['status'],
    providerPaymentId?: string,
  ): Promise<Payment> {
    validateUUID(id, 'paymentId');
    const validStatuses: Payment['status'][] = [
      'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid payment status: ${status}`);
    }

    const payment = await this.billingRepo.findPaymentById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const updateData: Partial<Payment> = { status };
    if (providerPaymentId) {
      updateData.providerPaymentId = providerPaymentId;
    }

    const updated = await this.billingRepo.updatePayment(id, updateData);
    if (!updated) {
      throw new NotFoundException('Payment not found after update');
    }

    if (status === 'succeeded' || status === 'failed') {
      await this.analyticsEventIngestionService.ingest({
        eventType: status === 'succeeded' ? 'payment.succeeded' : 'payment.failed',
        actorRole: 'student',
        actorId: updated.userId,
        subjectType: 'payment',
        subjectId: updated.id,
        metadata: {
          amount: updated.amount,
          currency: updated.currency,
          status: updated.status,
        },
      });
    }

    return updated;
  }

  async getPaymentsBySubscription(subscriptionId: string): Promise<Payment[]> {
    validateUUID(subscriptionId, 'subscriptionId');
    return this.billingRepo.findPaymentsBySubscriptionId(subscriptionId);
  }

  async syncProviderPaymentStatus(
    providerPaymentId: string,
    status: Payment['status'],
  ): Promise<Payment | null> {
    const payment = await this.billingRepo.findPaymentByProviderPaymentId(providerPaymentId);
    if (!payment) return null;
    const updated = await this.billingRepo.updatePayment(payment.id, { status });
    return updated;
  }
}
