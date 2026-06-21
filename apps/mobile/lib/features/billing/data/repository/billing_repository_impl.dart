import '../datasources/billing_datasource.dart';
import '../models/billing_models.dart';
import '../../logic/repository/billing_repository.dart';

class BillingRepositoryImpl implements BillingRepository {
  final BillingDatasource _datasource;

  const BillingRepositoryImpl(this._datasource);

  @override
  Future<List<BillingPlanModel>> getPlans() => _datasource.getPlans();

  @override
  Future<List<BillingPriceModel>> getPrices() => _datasource.getPrices();

  @override
  Future<CheckoutSessionModel> createCheckoutSession({
    required String priceId,
    required String successUrl,
    required String cancelUrl,
    String? promotionCode,
  }) =>
      _datasource.createCheckoutSession(
        priceId: priceId,
        successUrl: successUrl,
        cancelUrl: cancelUrl,
        promotionCode: promotionCode,
      );

  @override
  Future<CheckoutSessionModel> getCheckoutStatus(String sessionId) =>
      _datasource.getCheckoutStatus(sessionId);

  @override
  Future<List<SubscriptionModel>> getSubscriptions() =>
      _datasource.getSubscriptions();

  @override
  Future<SubscriptionModel> cancelSubscription(String subscriptionId) =>
      _datasource.cancelSubscription(subscriptionId);

  @override
  Future<List<InvoiceModel>> getInvoices() => _datasource.getInvoices();

  @override
  Future<List<EntitlementModel>> getEntitlements() =>
      _datasource.getEntitlements();
}
