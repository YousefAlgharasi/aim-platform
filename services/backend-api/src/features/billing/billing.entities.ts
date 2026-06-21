export interface BillingProduct {
  id: string;
  name: string;
  description: string | null;
  productType: 'course' | 'subscription' | 'feature' | 'addon';
  providerProductId: string | null;
  status: 'active' | 'inactive' | 'archived';
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingPrice {
  id: string;
  productId: string;
  amount: number;
  currency: string;
  billingInterval: 'month' | 'year' | 'one_time';
  providerPriceId: string | null;
  status: 'active' | 'inactive' | 'archived';
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingPlan {
  id: string;
  name: string;
  description: string | null;
  priceId: string;
  features: Record<string, unknown>;
  planType: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'archived';
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingEntitlement {
  id: string;
  userId: string;
  planId: string | null;
  subscriptionId: string | null;
  featureKey: string;
  granted: boolean;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: Date | null;
  source: 'subscription' | 'payment' | 'admin_grant' | 'promotion';
  status: 'active' | 'expired' | 'revoked';
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  providerSubscriptionId: string | null;
  status:
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'expired'
    | 'trialing'
    | 'paused'
    | 'incomplete';
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutSession {
  id: string;
  userId: string;
  priceId: string;
  subscriptionId: string | null;
  providerSessionId: string | null;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  checkoutUrl: string | null;
  successUrl: string | null;
  cancelUrl: string | null;
  expiresAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  checkoutSessionId: string | null;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  status:
    | 'pending'
    | 'succeeded'
    | 'failed'
    | 'refunded'
    | 'partially_refunded';
  providerPaymentId: string | null;
  paymentMethodType: 'card' | 'bank_transfer' | 'wallet' | 'other' | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string | null;
  providerInvoiceId: string | null;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  invoiceUrl: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  dueDate: Date | null;
  paidAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  priceId: string | null;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  currency: string;
  createdAt: Date;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'denied';
  providerRefundId: string | null;
  requestedBy: string;
  approvedBy: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coupon {
  id: string;
  name: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  currency: string | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  validFrom: Date;
  validUntil: Date | null;
  status: 'active' | 'expired' | 'disabled';
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromotionCode {
  id: string;
  couponId: string;
  code: string;
  maxRedemptions: number | null;
  timesRedeemed: number;
  eligibleUserIds: string[] | null;
  status: 'active' | 'expired' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentProviderEvent {
  id: string;
  providerEventId: string;
  eventType: string;
  provider: string;
  processingStatus: 'pending' | 'processed' | 'failed' | 'skipped';
  idempotencyKey: string;
  payloadSummary: Record<string, unknown>;
  errorMessage: string | null;
  processedAt: Date | null;
  createdAt: Date;
}

export interface BillingAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId: string | null;
  actorType: 'user' | 'system' | 'provider' | 'admin';
  changes: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
