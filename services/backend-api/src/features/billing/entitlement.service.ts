import { Injectable, NotFoundException } from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { BillingEntitlement, BillingPlan } from './billing.entities';
import { validateUUID } from './billing.validation';

@Injectable()
export class EntitlementService {
  constructor(private readonly billingRepo: BillingRepository) {}

  async getUserEntitlements(userId: string): Promise<BillingEntitlement[]> {
    validateUUID(userId, 'userId');
    return this.billingRepo.findEntitlementsByUserId(userId);
  }

  async checkEntitlement(userId: string, featureKey: string): Promise<BillingEntitlement | null> {
    validateUUID(userId, 'userId');
    const entitlement = await this.billingRepo.findEntitlementByUserAndFeature(userId, featureKey);

    if (!entitlement) return null;
    if (!entitlement.granted) return null;
    if (entitlement.status !== 'active') return null;
    if (entitlement.expiresAt && entitlement.expiresAt < new Date()) return null;
    if (entitlement.usageLimit !== null && entitlement.usageCount >= entitlement.usageLimit) return null;

    return entitlement;
  }

  async grantEntitlementsForSubscription(
    userId: string,
    subscriptionId: string,
    plan: BillingPlan,
  ): Promise<BillingEntitlement[]> {
    validateUUID(userId, 'userId');
    validateUUID(subscriptionId, 'subscriptionId');

    const features = plan.features as Record<string, unknown>;
    const entitlements: BillingEntitlement[] = [];

    for (const [featureKey, value] of Object.entries(features)) {
      const usageLimit = typeof value === 'number' && value > 0 ? value : null;
      const granted = value !== false && value !== 0;

      const entitlement = await this.billingRepo.createEntitlement({
        userId,
        planId: plan.id,
        subscriptionId,
        featureKey,
        granted,
        usageLimit,
        usageCount: 0,
        source: 'subscription',
        status: 'active',
      });

      entitlements.push(entitlement);
    }

    await this.billingRepo.createAuditLog({
      action: 'entitlements_granted',
      entityType: 'entitlement',
      entityId: subscriptionId,
      actorType: 'system',
      changes: { planId: plan.id, featureCount: entitlements.length },
    });

    return entitlements;
  }

  async revokeEntitlementsForSubscription(subscriptionId: string): Promise<void> {
    validateUUID(subscriptionId, 'subscriptionId');

    await this.billingRepo.revokeEntitlementsBySubscriptionId(subscriptionId);

    await this.billingRepo.createAuditLog({
      action: 'entitlements_revoked',
      entityType: 'entitlement',
      entityId: subscriptionId,
      actorType: 'system',
      changes: { reason: 'subscription_ended' },
    });
  }

  async grantAdminEntitlement(
    userId: string,
    featureKey: string,
    adminId: string,
    usageLimit?: number,
    expiresAt?: Date,
  ): Promise<BillingEntitlement> {
    validateUUID(userId, 'userId');
    validateUUID(adminId, 'adminId');

    const entitlement = await this.billingRepo.createEntitlement({
      userId,
      featureKey,
      granted: true,
      usageLimit: usageLimit ?? null,
      usageCount: 0,
      expiresAt: expiresAt ?? null,
      source: 'admin_grant',
      status: 'active',
    });

    await this.billingRepo.createAuditLog({
      action: 'entitlement_admin_granted',
      entityType: 'entitlement',
      entityId: entitlement.id,
      actorId: adminId,
      actorType: 'admin',
      changes: { featureKey, usageLimit, expiresAt },
    });

    return entitlement;
  }
}
