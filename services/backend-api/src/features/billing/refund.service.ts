import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { Refund, Payment } from './billing.entities';
import { validateUUID, validateAmount } from './billing.validation';

export interface RefundProviderAdapter {
  createRefund(params: {
    providerPaymentId: string;
    amount: number;
    currency: string;
    reason: string;
  }): Promise<{
    providerRefundId: string;
    status: Refund['status'];
  }>;
}

@Injectable()
export class RefundService {
  constructor(private readonly billingRepo: BillingRepository) {}

  async getRefundById(id: string): Promise<Refund> {
    validateUUID(id, 'refundId');
    const refund = await this.billingRepo.findRefundById(id);
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }
    return refund;
  }

  async getRefundsByPayment(paymentId: string): Promise<Refund[]> {
    validateUUID(paymentId, 'paymentId');
    return this.billingRepo.findRefundsByPaymentId(paymentId);
  }

  async requestRefund(data: {
    paymentId: string;
    amount: number;
    currency: string;
    reason: string;
    requestedBy: string;
  }): Promise<Refund> {
    validateUUID(data.paymentId, 'paymentId');
    validateUUID(data.requestedBy, 'requestedBy');
    validateAmount(data.amount);

    const payment = await this.billingRepo.findPaymentById(data.paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'succeeded') {
      throw new BadRequestException('Can only refund succeeded payments');
    }

    const existingRefunds = await this.billingRepo.findRefundsByPaymentId(data.paymentId);
    const totalRefunded = existingRefunds
      .filter((r) => r.status === 'succeeded' || r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);

    if (totalRefunded + data.amount > payment.amount) {
      throw new BadRequestException('Refund amount exceeds remaining refundable amount');
    }

    return this.billingRepo.createRefund({
      paymentId: data.paymentId,
      amount: data.amount,
      currency: data.currency.toUpperCase(),
      reason: data.reason,
      status: 'pending',
      requestedBy: data.requestedBy,
      approvedBy: null,
      metadata: {},
    } as Partial<Refund>);
  }

  async approveRefund(id: string, approvedBy: string): Promise<Refund> {
    validateUUID(id, 'refundId');
    validateUUID(approvedBy, 'approvedBy');

    const refund = await this.billingRepo.findRefundById(id);
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }
    if (refund.status !== 'pending') {
      throw new BadRequestException('Only pending refunds can be approved');
    }

    const updated = await this.billingRepo.updateRefund(id, {
      status: 'succeeded',
      approvedBy,
    });
    if (!updated) {
      throw new NotFoundException('Refund not found after update');
    }

    await this.billingRepo.updatePayment(refund.paymentId, {
      status: 'refunded',
    });

    return updated;
  }

  async denyRefund(id: string, approvedBy: string): Promise<Refund> {
    validateUUID(id, 'refundId');
    const refund = await this.billingRepo.findRefundById(id);
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }
    if (refund.status !== 'pending') {
      throw new BadRequestException('Only pending refunds can be denied');
    }

    const updated = await this.billingRepo.updateRefund(id, {
      status: 'denied',
      approvedBy,
    });
    if (!updated) {
      throw new NotFoundException('Refund not found after update');
    }
    return updated;
  }

  async syncProviderRefundStatus(
    providerRefundId: string,
    status: Refund['status'],
  ): Promise<Refund | null> {
    const refund = await this.billingRepo.findRefundByProviderRefundId(providerRefundId);
    if (!refund) return null;
    return this.billingRepo.updateRefund(refund.id, { status });
  }
}
