import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  BillingProduct,
  BillingPrice,
  BillingPlan,
  BillingEntitlement,
  Subscription,
  CheckoutSession,
  Payment,
  Invoice,
  InvoiceItem,
  Refund,
  Coupon,
  PromotionCode,
  PaymentProviderEvent,
  BillingAuditLog,
} from './billing.entities';

@Injectable()
export class BillingRepository {
  constructor(private readonly db: DatabaseService) {}

  // --- Products ---

  async findActiveProducts(): Promise<BillingProduct[]> {
    const result = await this.db.query<BillingProduct>(
      `SELECT * FROM billing_products WHERE status = 'active' ORDER BY created_at ASC`,
    );
    return result.rows;
  }

  async findProductById(id: string): Promise<BillingProduct | null> {
    const result = await this.db.query<BillingProduct>(
      `SELECT * FROM billing_products WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createProduct(data: Partial<BillingProduct>): Promise<BillingProduct> {
    const result = await this.db.query<BillingProduct>(
      `INSERT INTO billing_products (name, description, product_type, provider_product_id, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.description, data.productType, data.providerProductId, data.status || 'active', data.metadata || {}],
    );
    return result.rows[0];
  }

  async updateProduct(id: string, data: Partial<BillingProduct>): Promise<BillingProduct | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined) { sets.push(`name = $${idx++}`); values.push(data.name); }
    if (data.description !== undefined) { sets.push(`description = $${idx++}`); values.push(data.description); }
    if (data.status !== undefined) { sets.push(`status = $${idx++}`); values.push(data.status); }

    if (sets.length === 0) return this.findProductById(id);

    sets.push(`updated_at = now()`);
    values.push(id);

    const result = await this.db.query<BillingProduct>(
      `UPDATE billing_products SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  }

  // --- Prices ---

  async findActivePrices(): Promise<BillingPrice[]> {
    const result = await this.db.query<BillingPrice>(
      `SELECT * FROM billing_prices WHERE status = 'active' ORDER BY amount ASC`,
    );
    return result.rows;
  }

  async findPriceById(id: string): Promise<BillingPrice | null> {
    const result = await this.db.query<BillingPrice>(
      `SELECT * FROM billing_prices WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findPricesByProductId(productId: string): Promise<BillingPrice[]> {
    const result = await this.db.query<BillingPrice>(
      `SELECT * FROM billing_prices WHERE product_id = $1 AND status = 'active' ORDER BY amount ASC`,
      [productId],
    );
    return result.rows;
  }

  async createPrice(data: Partial<BillingPrice>): Promise<BillingPrice> {
    const result = await this.db.query<BillingPrice>(
      `INSERT INTO billing_prices (product_id, amount, currency, billing_interval, provider_price_id, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [data.productId, data.amount, data.currency, data.billingInterval, data.providerPriceId, data.status || 'active', data.metadata || {}],
    );
    return result.rows[0];
  }

  // --- Plans ---

  async findActivePlans(): Promise<BillingPlan[]> {
    const result = await this.db.query<BillingPlan>(
      `SELECT * FROM billing_plans WHERE status = 'active' ORDER BY created_at ASC`,
    );
    return result.rows;
  }

  async findPlanById(id: string): Promise<BillingPlan | null> {
    const result = await this.db.query<BillingPlan>(
      `SELECT * FROM billing_plans WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createPlan(data: Partial<BillingPlan>): Promise<BillingPlan> {
    const result = await this.db.query<BillingPlan>(
      `INSERT INTO billing_plans (name, description, price_id, features, plan_type, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [data.name, data.description, data.priceId, data.features || {}, data.planType, data.status || 'active', data.metadata || {}],
    );
    return result.rows[0];
  }

  async updatePlan(id: string, data: Partial<BillingPlan>): Promise<BillingPlan | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined) { sets.push(`name = $${idx++}`); values.push(data.name); }
    if (data.description !== undefined) { sets.push(`description = $${idx++}`); values.push(data.description); }
    if (data.features !== undefined) { sets.push(`features = $${idx++}`); values.push(data.features); }
    if (data.status !== undefined) { sets.push(`status = $${idx++}`); values.push(data.status); }

    if (sets.length === 0) return this.findPlanById(id);

    sets.push(`updated_at = now()`);
    values.push(id);

    const result = await this.db.query<BillingPlan>(
      `UPDATE billing_plans SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  }

  // --- Subscriptions ---

  async findSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    const result = await this.db.query<Subscription>(
      `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findSubscriptionById(id: string): Promise<Subscription | null> {
    const result = await this.db.query<Subscription>(
      `SELECT * FROM subscriptions WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findSubscriptionByProviderSubscriptionId(providerSubId: string): Promise<Subscription | null> {
    const result = await this.db.query<Subscription>(
      `SELECT * FROM subscriptions WHERE provider_subscription_id = $1`,
      [providerSubId],
    );
    return result.rows[0] || null;
  }

  async createSubscription(data: Partial<Subscription>): Promise<Subscription> {
    const result = await this.db.query<Subscription>(
      `INSERT INTO subscriptions (user_id, plan_id, provider_subscription_id, status, current_period_start, current_period_end, cancel_at_period_end, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [data.userId, data.planId, data.providerSubscriptionId, data.status || 'active', data.currentPeriodStart, data.currentPeriodEnd, data.cancelAtPeriodEnd || false, data.metadata || {}],
    );
    return result.rows[0];
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.status !== undefined) { sets.push(`status = $${idx++}`); values.push(data.status); }
    if (data.currentPeriodStart !== undefined) { sets.push(`current_period_start = $${idx++}`); values.push(data.currentPeriodStart); }
    if (data.currentPeriodEnd !== undefined) { sets.push(`current_period_end = $${idx++}`); values.push(data.currentPeriodEnd); }
    if (data.cancelAtPeriodEnd !== undefined) { sets.push(`cancel_at_period_end = $${idx++}`); values.push(data.cancelAtPeriodEnd); }
    if (data.canceledAt !== undefined) { sets.push(`canceled_at = $${idx++}`); values.push(data.canceledAt); }

    if (sets.length === 0) return this.findSubscriptionById(id);

    sets.push(`updated_at = now()`);
    values.push(id);

    const result = await this.db.query<Subscription>(
      `UPDATE subscriptions SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  }

  // --- Checkout Sessions ---

  async findCheckoutSessionById(id: string): Promise<CheckoutSession | null> {
    const result = await this.db.query<CheckoutSession>(
      `SELECT * FROM checkout_sessions WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findCheckoutSessionByProviderSessionId(providerSessionId: string): Promise<CheckoutSession | null> {
    const result = await this.db.query<CheckoutSession>(
      `SELECT * FROM checkout_sessions WHERE provider_session_id = $1`,
      [providerSessionId],
    );
    return result.rows[0] || null;
  }

  async createCheckoutSession(data: Partial<CheckoutSession>): Promise<CheckoutSession> {
    const result = await this.db.query<CheckoutSession>(
      `INSERT INTO checkout_sessions (user_id, price_id, provider_session_id, status, checkout_url, success_url, cancel_url, expires_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [data.userId, data.priceId, data.providerSessionId, data.status || 'pending', data.checkoutUrl, data.successUrl, data.cancelUrl, data.expiresAt, data.metadata || {}],
    );
    return result.rows[0];
  }

  async updateCheckoutSessionStatus(id: string, status: string): Promise<CheckoutSession | null> {
    const result = await this.db.query<CheckoutSession>(
      `UPDATE checkout_sessions SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [status, id],
    );
    return result.rows[0] || null;
  }

  // --- Payments ---

  async findPaymentsByUserId(userId: string): Promise<Payment[]> {
    const result = await this.db.query<Payment>(
      `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findPaymentById(id: string): Promise<Payment | null> {
    const result = await this.db.query<Payment>(
      `SELECT * FROM payments WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findPaymentByProviderPaymentId(providerPaymentId: string): Promise<Payment | null> {
    const result = await this.db.query<Payment>(
      `SELECT * FROM payments WHERE provider_payment_id = $1`,
      [providerPaymentId],
    );
    return result.rows[0] || null;
  }

  async createPayment(data: Partial<Payment>): Promise<Payment> {
    const result = await this.db.query<Payment>(
      `INSERT INTO payments (user_id, checkout_session_id, subscription_id, amount, currency, status, provider_payment_id, payment_method_type, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [data.userId, data.checkoutSessionId, data.subscriptionId, data.amount, data.currency, data.status || 'pending', data.providerPaymentId, data.paymentMethodType, data.metadata || {}],
    );
    return result.rows[0];
  }

  async updatePaymentStatus(id: string, status: string): Promise<Payment | null> {
    const result = await this.db.query<Payment>(
      `UPDATE payments SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [status, id],
    );
    return result.rows[0] || null;
  }

  // --- Invoices ---

  async findInvoicesByUserId(userId: string): Promise<Invoice[]> {
    const result = await this.db.query<Invoice>(
      `SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findInvoiceById(id: string): Promise<Invoice | null> {
    const result = await this.db.query<Invoice>(
      `SELECT * FROM invoices WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    const result = await this.db.query<Invoice>(
      `INSERT INTO invoices (user_id, subscription_id, provider_invoice_id, status, subtotal, tax, total, currency, invoice_url, period_start, period_end, due_date, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [data.userId, data.subscriptionId, data.providerInvoiceId, data.status || 'draft', data.subtotal || 0, data.tax || 0, data.total || 0, data.currency, data.invoiceUrl, data.periodStart, data.periodEnd, data.dueDate, data.metadata || {}],
    );
    return result.rows[0];
  }

  async updateInvoiceStatus(id: string, status: string, paidAt?: Date): Promise<Invoice | null> {
    const result = await this.db.query<Invoice>(
      `UPDATE invoices SET status = $1, paid_at = COALESCE($2, paid_at), updated_at = now() WHERE id = $3 RETURNING *`,
      [status, paidAt || null, id],
    );
    return result.rows[0] || null;
  }

  async createInvoiceItem(data: Partial<InvoiceItem>): Promise<InvoiceItem> {
    const result = await this.db.query<InvoiceItem>(
      `INSERT INTO invoice_items (invoice_id, price_id, description, quantity, unit_amount, amount, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [data.invoiceId, data.priceId, data.description, data.quantity || 1, data.unitAmount, data.amount, data.currency],
    );
    return result.rows[0];
  }

  async findInvoiceItemsByInvoiceId(invoiceId: string): Promise<InvoiceItem[]> {
    const result = await this.db.query<InvoiceItem>(
      `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at ASC`,
      [invoiceId],
    );
    return result.rows;
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.status !== undefined) { sets.push(`status = $${idx++}`); values.push(data.status); }
    if (data.paidAt !== undefined) { sets.push(`paid_at = $${idx++}`); values.push(data.paidAt); }
    if (data.invoiceUrl !== undefined) { sets.push(`invoice_url = $${idx++}`); values.push(data.invoiceUrl); }
    if (data.metadata !== undefined) { sets.push(`metadata = $${idx++}`); values.push(data.metadata); }

    if (sets.length === 0) return this.findInvoiceById(id);

    sets.push(`updated_at = now()`);
    values.push(id);

    const result = await this.db.query<Invoice>(
      `UPDATE invoices SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0] ?? null;
  }

  // --- Refunds ---

  async findRefundsByUserId(userId: string): Promise<Refund[]> {
    const result = await this.db.query<Refund>(
      `SELECT r.* FROM refunds r JOIN payments p ON r.payment_id = p.id WHERE p.user_id = $1 ORDER BY r.created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findRefundById(id: string): Promise<Refund | null> {
    const result = await this.db.query<Refund>(
      `SELECT * FROM refunds WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findRefundsByPaymentId(paymentId: string): Promise<Refund[]> {
    const result = await this.db.query<Refund>(
      `SELECT * FROM refunds WHERE payment_id = $1 ORDER BY created_at DESC`,
      [paymentId],
    );
    return result.rows;
  }

  async createRefund(data: Partial<Refund>): Promise<Refund> {
    const result = await this.db.query<Refund>(
      `INSERT INTO refunds (payment_id, amount, currency, reason, status, provider_refund_id, requested_by, approved_by, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [data.paymentId, data.amount, data.currency, data.reason, data.status || 'pending', data.providerRefundId, data.requestedBy, data.approvedBy, data.metadata || {}],
    );
    return result.rows[0];
  }

  async updateRefundStatus(id: string, status: string, approvedBy?: string): Promise<Refund | null> {
    const result = await this.db.query<Refund>(
      `UPDATE refunds SET status = $1, approved_by = COALESCE($2, approved_by), updated_at = now() WHERE id = $3 RETURNING *`,
      [status, approvedBy || null, id],
    );
    return result.rows[0] || null;
  }

  // --- Coupons ---

  async findActiveCoupons(): Promise<Coupon[]> {
    const result = await this.db.query<Coupon>(
      `SELECT * FROM coupons WHERE status = 'active' ORDER BY created_at DESC`,
    );
    return result.rows;
  }

  async findCouponById(id: string): Promise<Coupon | null> {
    const result = await this.db.query<Coupon>(
      `SELECT * FROM coupons WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const result = await this.db.query<Coupon>(
      `INSERT INTO coupons (name, discount_type, discount_value, currency, max_redemptions, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [data.name, data.discountType, data.discountValue, data.currency, data.maxRedemptions, data.status || 'active', data.metadata || {}],
    );
    return result.rows[0];
  }

  // --- Promotion Codes ---

  async findPromotionCodeByCode(code: string): Promise<PromotionCode | null> {
    const result = await this.db.query<PromotionCode>(
      `SELECT * FROM promotion_codes WHERE code = $1 AND status = 'active'`,
      [code],
    );
    return result.rows[0] || null;
  }

  // --- Entitlements ---

  async findEntitlementsByUserId(userId: string): Promise<BillingEntitlement[]> {
    const result = await this.db.query<BillingEntitlement>(
      `SELECT * FROM billing_entitlements WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findEntitlementByUserAndFeature(userId: string, featureKey: string): Promise<BillingEntitlement | null> {
    const result = await this.db.query<BillingEntitlement>(
      `SELECT * FROM billing_entitlements WHERE user_id = $1 AND feature_key = $2 AND status = 'active'`,
      [userId, featureKey],
    );
    return result.rows[0] || null;
  }

  async createEntitlement(data: Partial<BillingEntitlement>): Promise<BillingEntitlement> {
    const result = await this.db.query<BillingEntitlement>(
      `INSERT INTO billing_entitlements (user_id, plan_id, subscription_id, feature_key, granted, usage_limit, usage_count, expires_at, source, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [data.userId, data.planId, data.subscriptionId, data.featureKey, data.granted ?? true, data.usageLimit, data.usageCount || 0, data.expiresAt, data.source, data.status || 'active'],
    );
    return result.rows[0];
  }

  async revokeEntitlementsBySubscriptionId(subscriptionId: string): Promise<void> {
    await this.db.query(
      `UPDATE billing_entitlements SET status = 'revoked', updated_at = now() WHERE subscription_id = $1 AND status = 'active'`,
      [subscriptionId],
    );
  }

  // --- Provider Events ---

  async findProviderEventByEventId(providerEventId: string): Promise<PaymentProviderEvent | null> {
    const result = await this.db.query<PaymentProviderEvent>(
      `SELECT * FROM payment_provider_events WHERE provider_event_id = $1`,
      [providerEventId],
    );
    return result.rows[0] || null;
  }

  async createProviderEvent(data: Partial<PaymentProviderEvent>): Promise<PaymentProviderEvent> {
    const result = await this.db.query<PaymentProviderEvent>(
      `INSERT INTO payment_provider_events (provider_event_id, event_type, provider, processing_status, idempotency_key, payload_summary)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.providerEventId, data.eventType, data.provider, data.processingStatus || 'pending', data.idempotencyKey, data.payloadSummary || {}],
    );
    return result.rows[0];
  }

  async updateProviderEventStatus(id: string, status: string, errorMessage?: string): Promise<void> {
    await this.db.query(
      `UPDATE payment_provider_events SET processing_status = $1, error_message = $2, processed_at = now() WHERE id = $3`,
      [status, errorMessage || null, id],
    );
  }

  async findProviderEventByIdempotencyKey(idempotencyKey: string): Promise<PaymentProviderEvent | null> {
    const result = await this.db.query<PaymentProviderEvent>(
      `SELECT * FROM payment_provider_events WHERE idempotency_key = $1`,
      [idempotencyKey],
    );
    return result.rows[0] || null;
  }

  async updateProviderEvent(id: string, data: Partial<PaymentProviderEvent>): Promise<PaymentProviderEvent | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.processingStatus !== undefined) { sets.push(`processing_status = $${idx++}`); values.push(data.processingStatus); }
    if (data.errorMessage !== undefined) { sets.push(`error_message = $${idx++}`); values.push(data.errorMessage); }
    if (data.processedAt !== undefined) { sets.push(`processed_at = $${idx++}`); values.push(data.processedAt); }

    if (sets.length === 0) return this.findProviderEventByEventId(id);

    values.push(id);

    const result = await this.db.query<PaymentProviderEvent>(
      `UPDATE payment_provider_events SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  }

  async findProviderEventsByStatus(
    status: PaymentProviderEvent['processingStatus'],
  ): Promise<PaymentProviderEvent[]> {
    return (await this.db.query<PaymentProviderEvent>(
      `SELECT * FROM payment_provider_events WHERE processing_status = $1 ORDER BY created_at DESC`,
      [status],
    )).rows;
  }

  // --- Audit Logs ---

  async createAuditLog(data: Partial<BillingAuditLog>): Promise<BillingAuditLog> {
    const result = await this.db.query<BillingAuditLog>(
      `INSERT INTO billing_audit_logs (action, entity_type, entity_id, actor_id, actor_type, changes, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [data.action, data.entityType, data.entityId, data.actorId, data.actorType, data.changes || {}, data.metadata || {}],
    );
    return result.rows[0];
  }

  async findAuditLogs(limit: number = 50, offset: number = 0): Promise<BillingAuditLog[]> {
    const result = await this.db.query<BillingAuditLog>(
      `SELECT * FROM billing_audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return result.rows;
  }

  // --- Admin queries ---

  async findAllSubscriptions(limit: number = 50, offset: number = 0): Promise<Subscription[]> {
    const result = await this.db.query<Subscription>(
      `SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return result.rows;
  }

  async findAllPayments(limit: number = 50, offset: number = 0): Promise<Payment[]> {
    const result = await this.db.query<Payment>(
      `SELECT * FROM payments ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return result.rows;
  }

  async findAllInvoices(limit: number = 50, offset: number = 0): Promise<Invoice[]> {
    const result = await this.db.query<Invoice>(
      `SELECT * FROM invoices ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return result.rows;
  }

  async findAllRefunds(limit: number = 50, offset: number = 0): Promise<Refund[]> {
    const result = await this.db.query<Refund>(
      `SELECT * FROM refunds ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return result.rows;
  }
}
