export interface CheckoutSessionParams {
  priceProviderPriceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  promotionCode?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  providerSessionId: string;
  checkoutUrl: string;
  expiresAt: Date;
}

export interface CheckoutSessionStatus {
  status: 'pending' | 'completed' | 'expired' | 'failed';
  providerSubscriptionId?: string;
  providerPaymentId?: string;
}

export interface SubscriptionResult {
  providerSubscriptionId: string;
  status: 'active' | 'past_due' | 'canceled' | 'expired' | 'trialing' | 'paused' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export interface RefundParams {
  providerPaymentId: string;
  amount: number;
  currency: string;
  reason: string;
}

export interface RefundResult {
  providerRefundId: string;
  status: 'pending' | 'succeeded' | 'failed';
}

export interface InvoiceResult {
  providerInvoiceId: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  totalAmount: number;
  currency: string;
}

export interface WebhookEventParseResult {
  valid: boolean;
  eventId: string;
  eventType: string;
  provider: string;
  payloadSummary: Record<string, unknown>;
}

export const PAYMENT_PROVIDER_ADAPTER = 'PAYMENT_PROVIDER_ADAPTER';

export interface PaymentProviderAdapter {
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult>;
  getCheckoutSessionStatus(providerSessionId: string): Promise<CheckoutSessionStatus>;

  getSubscription(providerSubscriptionId: string): Promise<SubscriptionResult>;
  cancelSubscription(providerSubscriptionId: string, cancelAtPeriodEnd: boolean): Promise<SubscriptionResult>;

  createRefund(params: RefundParams): Promise<RefundResult>;
  getRefundStatus(providerRefundId: string): Promise<RefundResult>;

  getInvoice(providerInvoiceId: string): Promise<InvoiceResult>;

  verifyWebhookSignature(payload: Buffer, signature: string): Promise<boolean>;
  parseWebhookEvent(payload: Buffer): Promise<WebhookEventParseResult>;
}
