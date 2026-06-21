import { Injectable, Logger } from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { BillingAuditLog } from './billing.entities';

@Injectable()
export class BillingAuditService {
  private readonly logger = new Logger(BillingAuditService.name);

  constructor(private readonly billingRepo: BillingRepository) {}

  async logAction(data: {
    action: string;
    entityType: string;
    entityId: string;
    actorId?: string;
    actorType: BillingAuditLog['actorType'];
    changes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<BillingAuditLog> {
    return this.billingRepo.createAuditLog({
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      actorId: data.actorId || null,
      actorType: data.actorType,
      changes: data.changes || {},
      metadata: data.metadata || {},
    } as Partial<BillingAuditLog>);
  }

  async logCheckout(
    sessionId: string,
    userId: string,
    action: string,
    changes?: Record<string, unknown>,
  ): Promise<void> {
    await this.logAction({
      action: `checkout.${action}`,
      entityType: 'checkout_session',
      entityId: sessionId,
      actorId: userId,
      actorType: 'user',
      changes,
    });
  }

  async logPayment(
    paymentId: string,
    action: string,
    actorType: BillingAuditLog['actorType'],
    actorId?: string,
    changes?: Record<string, unknown>,
  ): Promise<void> {
    await this.logAction({
      action: `payment.${action}`,
      entityType: 'payment',
      entityId: paymentId,
      actorId,
      actorType,
      changes,
    });
  }

  async logSubscription(
    subscriptionId: string,
    action: string,
    actorType: BillingAuditLog['actorType'],
    actorId?: string,
    changes?: Record<string, unknown>,
  ): Promise<void> {
    await this.logAction({
      action: `subscription.${action}`,
      entityType: 'subscription',
      entityId: subscriptionId,
      actorId,
      actorType,
      changes,
    });
  }

  async logRefund(
    refundId: string,
    action: string,
    actorId: string,
    changes?: Record<string, unknown>,
  ): Promise<void> {
    await this.logAction({
      action: `refund.${action}`,
      entityType: 'refund',
      entityId: refundId,
      actorId,
      actorType: 'user',
      changes,
    });
  }

  async logEntitlement(
    entitlementId: string,
    action: string,
    actorType: BillingAuditLog['actorType'],
    actorId?: string,
    changes?: Record<string, unknown>,
  ): Promise<void> {
    await this.logAction({
      action: `entitlement.${action}`,
      entityType: 'entitlement',
      entityId: entitlementId,
      actorId,
      actorType,
      changes,
    });
  }

  async logProviderEvent(
    eventId: string,
    action: string,
    changes?: Record<string, unknown>,
  ): Promise<void> {
    await this.logAction({
      action: `provider_event.${action}`,
      entityType: 'provider_event',
      entityId: eventId,
      actorType: 'provider',
      changes,
    });
  }

  async getAuditLogs(filters?: {
    entityType?: string;
    entityId?: string;
    actorId?: string;
    limit?: number;
  }): Promise<BillingAuditLog[]> {
    return this.billingRepo.findAuditLogs(filters);
  }
}
