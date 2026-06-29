import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';

import '../datasources/billing_datasource.dart';
import '../models/billing_models.dart';
import '../../logic/repository/billing_repository.dart';

class BillingRepositoryImpl implements BillingRepository {
  final BillingDatasource _datasource;

  const BillingRepositoryImpl(this._datasource);

  @override
  Future<List<BillingPlanModel>> getPlans() => _wrap(_datasource.getPlans);

  @override
  Future<List<BillingPriceModel>> getPrices() => _wrap(_datasource.getPrices);

  @override
  Future<CheckoutSessionModel> createCheckoutSession({
    required String priceId,
    required String successUrl,
    required String cancelUrl,
    String? promotionCode,
  }) =>
      _wrap(() => _datasource.createCheckoutSession(
            priceId: priceId,
            successUrl: successUrl,
            cancelUrl: cancelUrl,
            promotionCode: promotionCode,
          ));

  @override
  Future<CheckoutSessionModel> getCheckoutStatus(String sessionId) =>
      _wrap(() => _datasource.getCheckoutStatus(sessionId));

  @override
  Future<List<SubscriptionModel>> getSubscriptions() =>
      _wrap(_datasource.getSubscriptions);

  @override
  Future<SubscriptionModel> cancelSubscription(String subscriptionId) =>
      _wrap(() => _datasource.cancelSubscription(subscriptionId));

  @override
  Future<List<InvoiceModel>> getInvoices() => _wrap(_datasource.getInvoices);

  @override
  Future<List<EntitlementModel>> getEntitlements() =>
      _wrap(_datasource.getEntitlements);

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
