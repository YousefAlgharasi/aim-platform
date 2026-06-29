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

  private readonly PRODUCT_COLUMNS = `id, name, description, product_type AS "productType", provider_product_id AS "providerProductId", status, metadata, created_at AS "createdAt", updated_at AS "updatedAt"`;

  async findActiveProducts(): Promise<BillingProduct[]> {
    const result = await this.db.query<BillingProduct>(
      `SELECT ${this.PRODUCT_COLUMNS} FROM billing_products WHERE status = 'active' ORDER BY created_at ASC`,
    );
    return result.rows;
  }

  async findProductById(id: string): Promise<BillingProduct | null> {
    const result = await this.db.query<BillingProduct>(
      `SELECT ${this.PRODUCT_COLUMNS} FROM billing_products WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createProduct(data: Partial<BillingProduct>): Promise<BillingProduct> {
    const result = await this.db.query<BillingProduct>(
      `INSERT INTO billing_products (name, description, product_type, provider_product_id, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${this.PRODUCT_COLUMNS}`,
      [data.name, data.description, data.productType, data.providerProductId, data.status || 'active', data.metadata || {}],
    );
    return result.rows[0] ?? null;
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
      `UPDATE billing_products SET ${sets.join(', ')} WHERE id = $${idx} RETURNING ${this.PRODUCT_COLUMNS}`,
      values,
    );
    return result.rows[0] || null;
  }

  // --- Prices ---

  private readonly PRICE_COLUMNS = `id, product_id AS "productId", amount, currency, billing_interval AS "billingInterval", provider_price_id AS "providerPriceId", status, metadata, created_at AS "createdAt", updated_at AS "updatedAt"`;

  async findActivePrices(): Promise<BillingPrice[]> {
    const result = await this.db.query<BillingPrice>(
      `SELECT ${this.PRICE_COLUMNS} FROM billing_prices WHERE status = 'active' ORDER BY amount ASC`,
    );
    return result.rows;
  }

  async findPriceById(id: string): Promise<BillingPrice | null> {
    const result = await this.db.query<BillingPrice>(
      `SELECT ${this.PRICE_COLUMNS} FROM billing_prices WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findPricesByProductId(productId: string): Promise<BillingPrice[]> {
    const result = await this.db.query<BillingPrice>(
      `SELECT ${this.PRICE_COLUMNS} FROM billing_prices WHERE product_id = $1 AND status = 'active' ORDER BY amount ASC`,
      [productId],
    );
    return result.rows;
  }

  async createPrice(data: Partial<BillingPrice>): Promise<BillingPrice> {
    const result = await this.db.query<BillingPrice>(
      `INSERT INTO billing_prices (product_id, amount, currency, billing_interval, provider_price_id, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${this.PRICE_COLUMNS}`,
      [data.productId, data.amount, data.currency, data.billingInterval, data.providerPriceId, data.status || 'active', data.metadata || {}],
    );
    return result.rows[0] ?? null;
  }

  // --- Plans ---

  private readonly PLAN_COLUMNS = `id, name, description, price_id AS "priceId", features, plan_type AS "planType", status, metadata, created_at AS "createdAt", updated_at AS "updatedAt"`;

  async findActivePlans(): Promise<BillingPlan[]> {
    const result = await this.db.query<BillingPlan>(
      `SELECT ${this.PLAN_COLUMNS} FROM billing_plans WHERE status = 'active' ORDER BY created_at ASC`,
    );
    return result.rows;
  }

  async findPlanById(id: string): Promise<BillingPlan | null> {
    const result = await this.db.query<BillingPlan>(
      `SELECT ${this.PLAN_COLUMNS} FROM billing_plans WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findPlanByType(planType: string): Promise<BillingPlan | null> {
    const result = await this.db.query<BillingPlan>(
      `SELECT ${this.PLAN_COLUMNS} FROM billing_plans WHERE plan_type = $1 AND status = 'active' ORDER BY created_at ASC LIMIT 1`,
      [planType],
    );
    return result.rows[0] || null;
  }

  async createPlan(data: Partial<BillingPlan>): Promise<BillingPlan> {
    const result = await this.db.query<BillingPlan>(
      `INSERT INTO billing_plans (name, description, price_id, features, plan_type, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${this.PLAN_COLUMNS}`,
      [data.name, data.description, data.priceId, data.features || {}, data.planType, data.status || 'active', data.metadata || {}],
    );
    return result.rows[0] ?? null;
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
      `UPDATE billing_plans SET ${sets.join(', ')} WHERE id = $${idx} RETURNING ${this.PLAN_COLUMNS}`,
      values,
    );
    return result.rows[0] || null;
  }

  // --- Subscriptions ---

  private readonly SUBSCRIPTION_COLUMNS = `id, user_id AS "userId", plan_id AS "planId", provider_subscription_id AS "providerSubscriptionId", status, current_period_start AS "currentPeriodStart", current_period_end AS "currentPeriodEnd", cancel_at_period_end AS "cancelAtPeriodEnd", canceled_at AS "canceledAt", trial_start AS "trialStart", trial_end AS "trialEnd", metadata, created_at AS "createdAt", updated_at AS "updatedAt"`;

  async findSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    const result = await this.db.query<Subscription>(
      `SELECT ${this.SUBSCRIPTION_COLUMNS} FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findSubscriptionById(id: string): Promise<Subscription | null> {
    const result = await this.db.query<Subscription>(
      `SELECT ${this.SUBSCRIPTION_COLUMNS} FROM subscriptions WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findSubscriptionByProviderSubscriptionId(providerSubId: string): Promise<Subscription | null> {
    const result = await this.db.query<Subscription>(
      `SELECT ${this.SUBSCRIPTION_COLUMNS} FROM subscriptions WHERE provider_subscription_id = $1`,
      [providerSubId],
    );
    return result.rows[0] || null;
  }

  async createSubscription(data: Partial<Subscription>): Promise<Subscription> {
    const result = await this.db.query<Subscription>(
      `INSERT INTO subscriptions (user_id, plan_id, provider_subscription_id, status, current_period_start, current_period_end, cancel_at_period_end, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${this.SUBSCRIPTION_COLUMNS}`,
      [data.userId, data.planId, data.providerSubscriptionId, data.status || 'active', data.currentPeriodStart, data.currentPeriodEnd, data.cancelAtPeriodEnd || false, data.metadata || {}],
    );
    return result.rows[0] ?? null;
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
      `UPDATE subscriptions SET ${sets.join(', ')} WHERE id = $${idx} RETURNING ${this.SUBSCRIPTION_COLUMNS}`,
      values,
    );
    return result.rows[0] || null;
  }

  // --- Checkout Sessions ---

  private readonly CHECKOUT_SESSION_COLUMNS = `id, user_id AS "userId", price_id AS "priceId", subscription_id AS "subscriptionId", provider_session_id AS "providerSessionId", status, checkout_url AS "checkoutUrl", success_url AS "successUrl", cancel_url AS "cancelUrl", expires_at AS "expiresAt", metadata, created_at AS "createdAt", updated_at AS "updatedAt"`;

  async findCheckoutSessionById(id: string): Promise<CheckoutSession | null> {
    const result = await this.db.query<CheckoutSession>(
      `SELECT ${this.CHECKOUT_SESSION_COLUMNS} FROM checkout_sessions WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findCheckoutSessionsByUser(userId: string): Promise<CheckoutSession[]> {
    const result = await this.db.query<CheckoutSession>(
      `SELECT ${this.CHECKOUT_SESSION_COLUMNS} FROM checkout_sessions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findPendingCheckoutSessionsByUser(userId: string): Promise<CheckoutSession[]> {
    const result = await this.db.query<CheckoutSession>(
      `SELECT ${this.CHECKOUT_SESSION_COLUMNS} FROM checkout_sessions WHERE user_id = $1 AND status = 'pending' ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findCheckoutSessionByProviderSessionId(providerSessionId: string): Promise<CheckoutSession | null> {
    const result = await this.db.query<CheckoutSession>(
      `SELECT ${this.CHECKOUT_SESSION_COLUMNS} FROM checkout_sessions WHERE provider_session_id = $1`,
      [providerSessionId],
    );
    return result.rows[0] || null;
  }

  async createCheckoutSession(data: Partial<CheckoutSession>): Promise<CheckoutSession> {
    const result = await this.db.query<CheckoutSession>(
      `INSERT INTO checkout_sessions (user_id, price_id, provider_session_id, status, checkout_url, success_url, cancel_url, expires_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${this.CHECKOUT_SESSION_COLUMNS}`,
      [data.userId, data.priceId, data.providerSessionId, data.status || 'pending', data.checkoutUrl, data.successUrl, data.cancelUrl, data.expiresAt, data.metadata || {}],
    );
    return result.rows[0] ?? null;
  }

  async updateCheckoutSessionStatus(id: string, status: string): Promise<CheckoutSession | null> {
    const result = await this.db.query<CheckoutSession>(
      `UPDATE checkout_sessions SET status = $1, updated_at = now() WHERE id = $2 RETURNING ${this.CHECKOUT_SESSION_COLUMNS}`,
      [status, id],
    );
    return result.rows[0] || null;
  }

  // --- Payments ---

  private readonly PAYMENT_COLUMNS = `id, user_id AS "userId", checkout_session_id AS "checkoutSessionId", subscription_id AS "subscriptionId", amount, currency, status, provider_payment_id AS "providerPaymentId", payment_method_type AS "paymentMethodType", metadata, created_at AS "createdAt", updated_at AS "updatedAt"`;

  async findPaymentsByUserId(userId: string): Promise<Payment[]> {
    const result = await this.db.query<Payment>(
      `SELECT ${this.PAYMENT_COLUMNS} FROM payments WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findPaymentById(id: string): Promise<Payment | null> {
    const result = await this.db.query<Payment>(
      `SELECT ${this.PAYMENT_COLUMNS} FROM payments WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findPaymentByProviderPaymentId(providerPaymentId: string): Promise<Payment | null> {
    const result = await this.db.query<Payment>(
      `SELECT ${this.PAYMENT_COLUMNS} FROM payments WHERE provider_payment_id = $1`,
      [providerPaymentId],
    );
    return result.rows[0] || null;
  }

  async createPayment(data: Partial<Payment>): Promise<Payment> {
    const result = await this.db.query<Payment>(
      `INSERT INTO payments (user_id, checkout_session_id, subscription_id, amount, currency, status, provider_payment_id, payment_method_type, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${this.PAYMENT_COLUMNS}`,
      [data.userId, data.checkoutSessionId, data.subscriptionId, data.amount, data.currency, data.status || 'pending', data.providerPaymentId, data.paymentMethodType, data.metadata || {}],
    );
    return result.rows[0] ?? null;
  }

  async updatePaymentStatus(id: string, status: string): Promise<Payment | null> {
    const result = await this.db.query<Payment>(
      `UPDATE payments SET status = $1, updated_at = now() WHERE id = $2 RETURNING ${this.PAYMENT_COLUMNS}`,
      [status, id],
    );
    return result.rows[0] || null;
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.status !== undefined) { sets.push(`status = $${idx++}`); values.push(data.status); }
    if (data.providerPaymentId !== undefined) { sets.push(`provider_payment_id = $${idx++}`); values.push(data.providerPaymentId); }
    if (data.paymentMethodType !== undefined) { sets.push(`payment_method_type = $${idx++}`); values.push(data.paymentMethodType); }
    if (data.metadata !== undefined) { sets.push(`metadata = $${idx++}`); values.push(data.metadata); }

    if (sets.length === 0) return this.findPaymentById(id);

    sets.push(`updated_at = now()`);
    values.push(id);

    const result = await this.db.query<Payment>(
      `UPDATE payments SET ${sets.join(', ')} WHERE id = $${idx} RETURNING ${this.PAYMENT_COLUMNS}`,
      values,
    );
    return result.rows[0] ?? null;
  }

  async findPaymentsBySubscriptionId(subscriptionId: string): Promise<Payment[]> {
    const result = await this.db.query<Payment>(
      `SELECT ${this.PAYMENT_COLUMNS} FROM payments WHERE subscription_id = $1 ORDER BY created_at DESC`,
      [subscriptionId],
    );
    return result.rows;
  }

  // --- Invoices ---

  private readonly INVOICE_COLUMNS = `id, user_id AS "userId", subscription_id AS "subscriptionId", provider_invoice_id AS "providerInvoiceId", status, subtotal, tax, total, currency, invoice_url AS "invoiceUrl", period_start AS "periodStart", period_end AS "periodEnd", due_date AS "dueDate", paid_at AS "paidAt", metadata, created_at AS "createdAt", updated_at AS "updatedAt"`;

  async findInvoicesByUserId(userId: string): Promise<Invoice[]> {
    const result = await this.db.query<Invoice>(
      `SELECT ${this.INVOICE_COLUMNS} FROM invoices WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findInvoicesBySubscriptionId(subscriptionId: string): Promise<Invoice[]> {
    const result = await this.db.query<Invoice>(
      `SELECT ${this.INVOICE_COLUMNS} FROM invoices WHERE subscription_id = $1 ORDER BY created_at DESC`,
      [subscriptionId],
    );
    return result.rows;
  }

  async findInvoiceById(id: string): Promise<Invoice | null> {
    const result = await this.db.query<Invoice>(
      `SELECT ${this.INVOICE_COLUMNS} FROM invoices WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    const result = await this.db.query<Invoice>(
      `INSERT INTO invoices (user_id, subscription_id, provider_invoice_id, status, subtotal, tax, total, currency, invoice_url, period_start, period_end, due_date, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING ${this.INVOICE_COLUMNS}`,
      [data.userId, data.subscriptionId, data.providerInvoiceId, data.status || 'draft', data.subtotal || 0, data.tax || 0, data.total || 0, data.currency, data.invoiceUrl, data.periodStart, data.periodEnd, data.dueDate, data.metadata || {}],
    );
    return result.rows[0] ?? null;
  }

  async updateInvoiceStatus(id: string, status: string, paidAt?: Date): Promise<Invoice | null> {
    const result = await this.db.query<Invoice>(
      `UPDATE invoices SET status = $1, paid_at = COALESCE($2, paid_at), updated_at = now() WHERE id = $3 RETURNING ${this.INVOICE_COLUMNS}`,
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
    return result.rows[0] ?? null;
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
      `UPDATE invoices SET ${sets.join(', ')} WHERE id = $${idx} RETURNING ${this.INVOICE_COLUMNS}`,
      values,
    );
    return result.rows[0] ?? null;
  }

  // --- Refunds ---

  private readonly REFUND_COLUMNS = `id, payment_id AS "paymentId", amount, currency, reason, status, provider_refund_id AS "providerRefundId", requested_by AS "requestedBy", approved_by AS "approvedBy", metadata, created_at AS "createdAt", updated_at AS "updatedAt"`;

  async findRefundsByUserId(userId: string): Promise<Refund[]> {
    const result = await this.db.query<Refund>(
      `SELECT r.id, r.payment_id AS "paymentId", r.amount, r.currency, r.reason, r.status, r.provider_refund_id AS "providerRefundId", r.requested_by AS "requestedBy", r.approved_by AS "approvedBy", r.metadata, r.created_at AS "createdAt", r.updated_at AS "updatedAt" FROM refunds r JOIN payments p ON r.payment_id = p.id WHERE p.user_id = $1 ORDER BY r.created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findRefundById(id: string): Promise<Refund | null> {
    const result = await this.db.query<Refund>(
      `SELECT ${this.REFUND_COLUMNS} FROM refunds WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findRefundsByPaymentId(paymentId: string): Promise<Refund[]> {
    const result = await this.db.query<Refund>(
      `SELECT ${this.REFUND_COLUMNS} FROM refunds WHERE payment_id = $1 ORDER BY created_at DESC`,
      [paymentId],
    );
    return result.rows;
  }

  async createRefund(data: Partial<Refund>): Promise<Refund> {
    const result = await this.db.query<Refund>(
      `INSERT INTO refunds (payment_id, amount, currency, reason, status, provider_refund_id, requested_by, approved_by, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${this.REFUND_COLUMNS}`,
      [data.paymentId, data.amount, data.currency, data.reason, data.status || 'pending', data.providerRefundId, data.requestedBy, data.approvedBy, data.metadata || {}],
    );
    return result.rows[0] ?? null;
  }

  async updateRefundStatus(id: string, status: string, approvedBy?: string): Promise<Refund | null> {
    const result = await this.db.query<Refund>(
      `UPDATE refunds SET status = $1, approved_by = COALESCE($2, approved_by), updated_at = now() WHERE id = $3 RETURNING ${this.REFUND_COLUMNS}`,
      [status, approvedBy || null, id],
    );
    return result.rows[0] || null;
  }

  async findRefundByProviderRefundId(providerRefundId: string): Promise<Refund | null> {
    const result = await this.db.query<Refund>(
      `SELECT ${this.REFUND_COLUMNS} FROM refunds WHERE provider_refund_id = $1`,
      [providerRefundId],
    );
    return result.rows[0] || null;
  }

  async updateRefund(id: string, data: Partial<Refund>): Promise<Refund | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.status !== undefined) { sets.push(`status = $${idx++}`); values.push(data.status); }
    if (data.approvedBy !== undefined) { sets.push(`approved_by = $${idx++}`); values.push(data.approvedBy); }
    if (data.providerRefundId !== undefined) { sets.push(`provider_refund_id = $${idx++}`); values.push(data.providerRefundId); }
    if (data.metadata !== undefined) { sets.push(`metadata = $${idx++}`); values.push(data.metadata); }

    if (sets.length === 0) return this.findRefundById(id);

    sets.push(`updated_at = now()`);
    values.push(id);

    const result = await this.db.query<Refund>(
      `UPDATE refunds SET ${sets.join(', ')} WHERE id = $${idx} RETURNING ${this.REFUND_COLUMNS}`,
      values,
    );
    return result.rows[0] || null;
  }

  // --- Coupons ---

  private readonly COUPON_COLUMNS = `id, name, discount_type AS "discountType", discount_value AS "discountValue", currency, max_redemptions AS "maxRedemptions", times_redeemed AS "timesRedeemed", valid_from AS "validFrom", valid_until AS "validUntil", status, metadata, created_at AS "createdAt", updated_at AS "updatedAt"`;

  async findActiveCoupons(): Promise<Coupon[]> {
    const result = await this.db.query<Coupon>(
      `SELECT ${this.COUPON_COLUMNS} FROM coupons WHERE status = 'active' ORDER BY created_at DESC`,
    );
    return result.rows;
  }

  async findCouponById(id: string): Promise<Coupon | null> {
    const result = await this.db.query<Coupon>(
      `SELECT ${this.COUPON_COLUMNS} FROM coupons WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const result = await this.db.query<Coupon>(
      `INSERT INTO coupons (name, discount_type, discount_value, currency, max_redemptions, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${this.COUPON_COLUMNS}`,
      [data.name, data.discountType, data.discountValue, data.currency, data.maxRedemptions, data.status || 'active', data.metadata || {}],
    );
    return result.rows[0] ?? null;
  }

  async incrementCouponRedemptions(couponId: string): Promise<void> {
    await this.db.query(
      `UPDATE coupons SET times_redeemed = times_redeemed + 1, updated_at = now() WHERE id = $1`,
      [couponId],
    );
  }

  // --- Promotion Codes ---

  async findPromotionCodeByCode(code: string): Promise<PromotionCode | null> {
    const result = await this.db.query<PromotionCode>(
      `SELECT * FROM promotion_codes WHERE code = $1 AND status = 'active'`,
      [code],
    );
    return result.rows[0] || null;
  }

  async incrementPromotionCodeRedemptions(promotionCodeId: string): Promise<void> {
    await this.db.query(
      `UPDATE promotion_codes SET times_redeemed = times_redeemed + 1, updated_at = now() WHERE id = $1`,
      [promotionCodeId],
    );
  }

  // --- Entitlements ---

  private readonly ENTITLEMENT_COLUMNS = `id, user_id AS "userId", plan_id AS "planId", subscription_id AS "subscriptionId", feature_key AS "featureKey", granted, usage_limit AS "usageLimit", usage_count AS "usageCount", expires_at AS "expiresAt", source, status, created_at AS "createdAt", updated_at AS "updatedAt"`;

  async findEntitlementsByUserId(userId: string): Promise<BillingEntitlement[]> {
    const result = await this.db.query<BillingEntitlement>(
      `SELECT ${this.ENTITLEMENT_COLUMNS} FROM billing_entitlements WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findEntitlementByUserAndFeature(userId: string, featureKey: string): Promise<BillingEntitlement | null> {
    const result = await this.db.query<BillingEntitlement>(
      `SELECT ${this.ENTITLEMENT_COLUMNS} FROM billing_entitlements WHERE user_id = $1 AND feature_key = $2 AND status = 'active'`,
      [userId, featureKey],
    );
    return result.rows[0] || null;
  }

  async createEntitlement(data: Partial<BillingEntitlement>): Promise<BillingEntitlement> {
    const result = await this.db.query<BillingEntitlement>(
      `INSERT INTO billing_entitlements (user_id, plan_id, subscription_id, feature_key, granted, usage_limit, usage_count, expires_at, source, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${this.ENTITLEMENT_COLUMNS}`,
      [data.userId, data.planId, data.subscriptionId, data.featureKey, data.granted ?? true, data.usageLimit, data.usageCount || 0, data.expiresAt, data.source, data.status || 'active'],
    );
    return result.rows[0] ?? null;
  }

  async revokeEntitlementsBySubscriptionId(subscriptionId: string): Promise<void> {
    await this.db.query(
      `UPDATE billing_entitlements SET status = 'revoked', updated_at = now() WHERE subscription_id = $1 AND status = 'active'`,
      [subscriptionId],
    );
  }

  // --- Provider Events ---

  private readonly PROVIDER_EVENT_COLUMNS = `id, provider_event_id AS "providerEventId", event_type AS "eventType", provider, processing_status AS "processingStatus", idempotency_key AS "idempotencyKey", payload_summary AS "payloadSummary", error_message AS "errorMessage", processed_at AS "processedAt", created_at AS "createdAt"`;

  async findProviderEventByEventId(providerEventId: string): Promise<PaymentProviderEvent | null> {
    const result = await this.db.query<PaymentProviderEvent>(
      `SELECT ${this.PROVIDER_EVENT_COLUMNS} FROM payment_provider_events WHERE provider_event_id = $1`,
      [providerEventId],
    );
    return result.rows[0] || null;
  }

  async createProviderEvent(data: Partial<PaymentProviderEvent>): Promise<PaymentProviderEvent> {
    const result = await this.db.query<PaymentProviderEvent>(
      `INSERT INTO payment_provider_events (provider_event_id, event_type, provider, processing_status, idempotency_key, payload_summary)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${this.PROVIDER_EVENT_COLUMNS}`,
      [data.providerEventId, data.eventType, data.provider, data.processingStatus || 'pending', data.idempotencyKey, data.payloadSummary || {}],
    );
    return result.rows[0] ?? null;
  }

  async updateProviderEventStatus(id: string, status: string, errorMessage?: string): Promise<void> {
    await this.db.query(
      `UPDATE payment_provider_events SET processing_status = $1, error_message = $2, processed_at = now() WHERE id = $3`,
      [status, errorMessage || null, id],
    );
  }

  async findProviderEventByIdempotencyKey(idempotencyKey: string): Promise<PaymentProviderEvent | null> {
    const result = await this.db.query<PaymentProviderEvent>(
      `SELECT ${this.PROVIDER_EVENT_COLUMNS} FROM payment_provider_events WHERE idempotency_key = $1`,
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
      `UPDATE payment_provider_events SET ${sets.join(', ')} WHERE id = $${idx} RETURNING ${this.PROVIDER_EVENT_COLUMNS}`,
      values,
    );
    return result.rows[0] || null;
  }

  async findProviderEventsByStatus(
    status: PaymentProviderEvent['processingStatus'],
  ): Promise<PaymentProviderEvent[]> {
    return (await this.db.query<PaymentProviderEvent>(
      `SELECT ${this.PROVIDER_EVENT_COLUMNS} FROM payment_provider_events WHERE processing_status = $1 ORDER BY created_at DESC`,
      [status],
    )).rows;
  }

  // --- Audit Logs ---

  private readonly AUDIT_LOG_COLUMNS = `id, action, entity_type AS "entityType", entity_id AS "entityId", actor_id AS "actorId", actor_type AS "actorType", changes, metadata, created_at AS "createdAt"`;

  async createAuditLog(data: Partial<BillingAuditLog>): Promise<BillingAuditLog> {
    const result = await this.db.query<BillingAuditLog>(
      `INSERT INTO billing_audit_logs (action, entity_type, entity_id, actor_id, actor_type, changes, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${this.AUDIT_LOG_COLUMNS}`,
      [data.action, data.entityType, data.entityId, data.actorId, data.actorType, data.changes || {}, data.metadata || {}],
    );
    return result.rows[0] ?? null;
  }

  async findAuditLogs(filters?: {
    entityType?: string;
    entityId?: string;
    actorId?: string;
    limit?: number;
  }): Promise<BillingAuditLog[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (filters?.entityType !== undefined) { conditions.push(`entity_type = $${idx++}`); values.push(filters.entityType); }
    if (filters?.entityId !== undefined) { conditions.push(`entity_id = $${idx++}`); values.push(filters.entityId); }
    if (filters?.actorId !== undefined) { conditions.push(`actor_id = $${idx++}`); values.push(filters.actorId); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(filters?.limit ?? 50);

    const result = await this.db.query<BillingAuditLog>(
      `SELECT ${this.AUDIT_LOG_COLUMNS} FROM billing_audit_logs ${where} ORDER BY created_at DESC LIMIT $${idx}`,
      values,
    );
    return result.rows;
  }

  // --- Admin queries ---

  async findAllSubscriptions(limit: number = 50, offset: number = 0): Promise<Subscription[]> {
    const result = await this.db.query<Subscription>(
      `SELECT ${this.SUBSCRIPTION_COLUMNS} FROM subscriptions ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return result.rows;
  }

  async findAllPayments(limit: number = 50, offset: number = 0): Promise<Payment[]> {
    const result = await this.db.query<Payment>(
      `SELECT ${this.PAYMENT_COLUMNS} FROM payments ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return result.rows;
  }

  async findAllInvoices(limit: number = 50, offset: number = 0): Promise<Invoice[]> {
    const result = await this.db.query<Invoice>(
      `SELECT ${this.INVOICE_COLUMNS} FROM invoices ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return result.rows;
  }

  async findAllRefunds(limit: number = 50, offset: number = 0): Promise<Refund[]> {
    const result = await this.db.query<Refund>(
      `SELECT ${this.REFUND_COLUMNS} FROM refunds ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return result.rows;
  }
}
