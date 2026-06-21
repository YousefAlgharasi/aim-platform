import '../models/billing_models.dart';

abstract class BillingDatasource {
  Future<List<BillingPlanModel>> getPlans();
  Future<List<BillingPriceModel>> getPrices();
  Future<CheckoutSessionModel> createCheckoutSession({
    required String priceId,
    required String successUrl,
    required String cancelUrl,
    String? promotionCode,
  });
  Future<CheckoutSessionModel> getCheckoutStatus(String sessionId);
  Future<List<SubscriptionModel>> getSubscriptions();
  Future<SubscriptionModel> cancelSubscription(String subscriptionId);
  Future<List<InvoiceModel>> getInvoices();
  Future<List<EntitlementModel>> getEntitlements();
}
