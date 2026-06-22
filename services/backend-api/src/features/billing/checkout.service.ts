import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { ProductPriceService } from './product-price.service';
import { SubscriptionService } from './subscription.service';
import { CheckoutSession } from './billing.entities';
import { validateUUID, validatePromotionCode } from './billing.validation';

export interface PaymentProviderAdapter {
  createCheckoutSession(params: {
    priceProviderPriceId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    promotionCode?: string;
    metadata?: Record<string, string>;
  }): Promise<{
    providerSessionId: string;
    checkoutUrl: string;
    expiresAt: Date;
  }>;

  getCheckoutSessionStatus(providerSessionId: string): Promise<{
    status: 'pending' | 'completed' | 'expired' | 'failed';
    providerSubscriptionId?: string;
    providerPaymentId?: string;
  }>;
}

@Injectable()
export class CheckoutService {
  private providerAdapter: PaymentProviderAdapter | null = null;

  constructor(
    private readonly billingRepo: BillingRepository,
    private readonly productPriceService: ProductPriceService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  setProviderAdapter(adapter: PaymentProviderAdapter): void {
    this.providerAdapter = adapter;
  }

  async createCheckoutSession(
    userId: string,
    data: {
      priceId: string;
      successUrl: string;
      cancelUrl: string;
      promotionCode?: string;
    },
  ): Promise<CheckoutSession> {
    validateUUID(userId, 'userId');
    validateUUID(data.priceId, 'priceId');

    if (data.promotionCode) {
      validatePromotionCode(data.promotionCode);
      const promoCode = await this.billingRepo.findPromotionCodeByCode(data.promotionCode);
      if (!promoCode) {
        throw new BadRequestException('Invalid promotion code');
      }
      if (promoCode.maxRedemptions && promoCode.timesRedeemed >= promoCode.maxRedemptions) {
        throw new BadRequestException('Promotion code has reached maximum redemptions');
      }
    }

    const price = await this.productPriceService.getPriceById(data.priceId);
    if (price.status !== 'active') {
      throw new BadRequestException('Price is not active');
    }

    let providerResult: {
      providerSessionId: string;
      checkoutUrl: string;
      expiresAt: Date;
    } | null = null;

    if (this.providerAdapter && price.providerPriceId) {
      providerResult = await this.providerAdapter.createCheckoutSession({
        priceProviderPriceId: price.providerPriceId,
        successUrl: data.successUrl,
        cancelUrl: data.cancelUrl,
        promotionCode: data.promotionCode,
        metadata: { userId, priceId: data.priceId },
      });
    }

    const session = await this.billingRepo.createCheckoutSession({
      userId,
      priceId: data.priceId,
      providerSessionId: providerResult?.providerSessionId,
      status: 'pending',
      checkoutUrl: providerResult?.checkoutUrl,
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      expiresAt: providerResult?.expiresAt ?? new Date(Date.now() + 30 * 60 * 1000),
    });

    await this.billingRepo.createAuditLog({
      action: 'checkout_session_created',
      entityType: 'checkout_session',
      entityId: session.id,
      actorId: userId,
      actorType: 'user',
      changes: { priceId: data.priceId },
    });

    return session;
  }

  async getCheckoutSession(id: string, userId: string): Promise<CheckoutSession> {
    validateUUID(id, 'checkoutSessionId');
    const session = await this.billingRepo.findCheckoutSessionById(id);
    if (!session) {
      throw new NotFoundException('Checkout session not found');
    }
    if (session.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this checkout session');
    }
    return session;
  }

  async getUserCheckoutSessions(userId: string): Promise<CheckoutSession[]> {
    validateUUID(userId, 'userId');
    return this.billingRepo.findCheckoutSessionsByUser(userId);
  }

  async handleCheckoutCompleted(providerSessionId: string): Promise<void> {
    const session = await this.billingRepo.findCheckoutSessionByProviderSessionId(providerSessionId);
    if (!session) return;

    await this.billingRepo.updateCheckoutSessionStatus(session.id, 'completed');

    const price = await this.productPriceService.getPriceById(session.priceId);

    if (price.billingInterval !== 'one_time') {
      const plan = (await this.billingRepo.findActivePlans()).find(p => p.priceId === price.id);
      if (plan) {
        await this.subscriptionService.createSubscription({
          userId: session.userId,
          planId: plan.id,
        });
      }
    }

    await this.billingRepo.createPayment({
      userId: session.userId,
      checkoutSessionId: session.id,
      amount: price.amount,
      currency: price.currency,
      status: 'succeeded',
    });

    await this.billingRepo.createAuditLog({
      action: 'checkout_completed',
      entityType: 'checkout_session',
      entityId: session.id,
      actorType: 'provider',
      changes: { status: 'completed' },
    });
  }

  async handleCheckoutExpired(providerSessionId: string): Promise<void> {
    const session = await this.billingRepo.findCheckoutSessionByProviderSessionId(providerSessionId);
    if (!session) return;

    await this.billingRepo.updateCheckoutSessionStatus(session.id, 'expired');

    await this.billingRepo.createAuditLog({
      action: 'checkout_expired',
      entityType: 'checkout_session',
      entityId: session.id,
      actorType: 'provider',
      changes: { status: 'expired' },
    });
  }
}
