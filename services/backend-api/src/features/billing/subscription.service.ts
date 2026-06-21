import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { EntitlementService } from './entitlement.service';
import { Subscription } from './billing.entities';
import { validateUUID } from './billing.validation';
import { AnalyticsEventIngestionService } from '../analytics/analytics-event-ingestion.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly billingRepo: BillingRepository,
    private readonly entitlementService: EntitlementService,
    private readonly analyticsEventIngestionService: AnalyticsEventIngestionService,
  ) {}

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    validateUUID(userId, 'userId');
    return this.billingRepo.findSubscriptionsByUserId(userId);
  }

  async getSubscriptionById(id: string, userId?: string): Promise<Subscription> {
    validateUUID(id, 'subscriptionId');
    const subscription = await this.billingRepo.findSubscriptionById(id);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    if (userId && subscription.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this subscription');
    }
    return subscription;
  }

  async createSubscription(data: {
    userId: string;
    planId: string;
    providerSubscriptionId?: string;
    status?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  }): Promise<Subscription> {
    validateUUID(data.userId, 'userId');
    validateUUID(data.planId, 'planId');

    const plan = await this.billingRepo.findPlanById(data.planId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const subscription = await this.billingRepo.createSubscription({
      userId: data.userId,
      planId: data.planId,
      providerSubscriptionId: data.providerSubscriptionId,
      status: (data.status as Subscription['status']) || 'active',
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
    });

    if (subscription.status === 'active' || subscription.status === 'trialing') {
      await this.entitlementService.grantEntitlementsForSubscription(
        data.userId,
        subscription.id,
        plan,
      );
    }

    await this.billingRepo.createAuditLog({
      action: 'subscription_created',
      entityType: 'subscription',
      entityId: subscription.id,
      actorType: 'system',
      changes: { planId: data.planId, status: subscription.status },
    });

    await this.analyticsEventIngestionService.ingest({
      eventType: 'subscription.created',
      actorRole: 'student',
      actorId: subscription.userId,
      subjectType: 'subscription',
      subjectId: subscription.id,
      metadata: { plan_key: subscription.planId, status: subscription.status },
    });

    return subscription;
  }

  async cancelSubscription(id: string, userId: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id, userId);

    if (subscription.status === 'canceled' || subscription.status === 'expired') {
      throw new ForbiddenException('Subscription is already canceled or expired');
    }

    const updated = await this.billingRepo.updateSubscription(id, {
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
    });

    await this.billingRepo.createAuditLog({
      action: 'subscription_cancel_requested',
      entityType: 'subscription',
      entityId: id,
      actorId: userId,
      actorType: 'user',
      changes: { cancelAtPeriodEnd: true },
    });

    await this.analyticsEventIngestionService.ingest({
      eventType: 'subscription.canceled',
      actorRole: 'student',
      actorId: userId,
      subjectType: 'subscription',
      subjectId: id,
      metadata: { plan_key: updated!.planId, status: updated!.status },
    });

    return updated!;
  }

  async updateSubscriptionFromProvider(
    providerSubscriptionId: string,
    data: {
      status: string;
      currentPeriodStart?: Date;
      currentPeriodEnd?: Date;
    },
  ): Promise<Subscription | null> {
    const subscription = await this.billingRepo.findSubscriptionByProviderSubscriptionId(providerSubscriptionId);
    if (!subscription) return null;

    const previousStatus = subscription.status;
    const updated = await this.billingRepo.updateSubscription(subscription.id, {
      status: data.status as Subscription['status'],
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
    });

    if (data.status === 'canceled' || data.status === 'expired') {
      await this.entitlementService.revokeEntitlementsForSubscription(subscription.id);
    }

    if (
      (data.status === 'active' || data.status === 'trialing') &&
      (previousStatus === 'incomplete' || previousStatus === 'past_due')
    ) {
      const plan = await this.billingRepo.findPlanById(subscription.planId);
      if (plan) {
        await this.entitlementService.grantEntitlementsForSubscription(
          subscription.userId,
          subscription.id,
          plan,
        );
      }
    }

    await this.billingRepo.createAuditLog({
      action: 'subscription_provider_update',
      entityType: 'subscription',
      entityId: subscription.id,
      actorType: 'provider',
      changes: { previousStatus, newStatus: data.status },
    });

    if (updated) {
      if (data.status === 'canceled' || data.status === 'expired') {
        await this.analyticsEventIngestionService.ingest({
          eventType: 'subscription.canceled',
          actorRole: 'student',
          actorId: subscription.userId,
          subjectType: 'subscription',
          subjectId: subscription.id,
          metadata: { plan_key: subscription.planId, status: data.status },
        });
      } else if (data.status === 'active' && previousStatus !== 'active') {
        await this.analyticsEventIngestionService.ingest({
          eventType: 'subscription.renewed',
          actorRole: 'student',
          actorId: subscription.userId,
          subjectType: 'subscription',
          subjectId: subscription.id,
          metadata: { plan_key: subscription.planId, status: data.status },
        });
      }
    }

    return updated;
  }
}
