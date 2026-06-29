// BillingDatasourceImpl — concrete implementation.
//
// Scope: Billing screens (subscription, pricing, invoices).
//
// Security rules:
// - Bearer token injected by the authenticated BackendApiClient's
//   AuthInterceptor; never stored here.
// - All plan/price/entitlement/subscription values parsed verbatim from the
//   backend response — Flutter never computes billing state locally.
// - No payment provider URLs or secrets here; checkout only returns a
//   backend-issued checkout URL to open externally.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import '../models/billing_models.dart';
import 'billing_datasource.dart';

class BillingDatasourceImpl implements BillingDatasource {
  const BillingDatasourceImpl({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<List<BillingPlanModel>> getPlans() async {
    final envelope = await _apiClient.get<List<BillingPlanModel>>(
      BackendApiPaths.billingPlans,
      decodeData: (json) => _requireList(json)
          .map(BillingPlanModel.fromJson)
          .toList(),
    );
    return envelope.data ?? const [];
  }

  @override
  Future<List<BillingPriceModel>> getPrices() async {
    final envelope = await _apiClient.get<List<BillingPriceModel>>(
      BackendApiPaths.billingPrices,
      decodeData: (json) => _requireList(json)
          .map(BillingPriceModel.fromJson)
          .toList(),
    );
    return envelope.data ?? const [];
  }

  @override
  Future<CheckoutSessionModel> createCheckoutSession({
    required String priceId,
    required String successUrl,
    required String cancelUrl,
    String? promotionCode,
  }) async {
    final envelope = await _apiClient.post<CheckoutSessionModel>(
      BackendApiPaths.billingCheckout,
      body: {
        'priceId': priceId,
        'successUrl': successUrl,
        'cancelUrl': cancelUrl,
        if (promotionCode != null) 'promotionCode': promotionCode,
      },
      decodeData: (json) =>
          CheckoutSessionModel.fromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  @override
  Future<CheckoutSessionModel> getCheckoutStatus(String sessionId) async {
    final envelope = await _apiClient.get<CheckoutSessionModel>(
      BackendApiPaths.billingCheckoutStatus(sessionId),
      decodeData: (json) =>
          CheckoutSessionModel.fromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  @override
  Future<List<SubscriptionModel>> getSubscriptions() async {
    final envelope = await _apiClient.get<List<SubscriptionModel>>(
      BackendApiPaths.billingSubscriptions,
      decodeData: (json) {
        final items = _requireMap(json)['subscriptions'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(SubscriptionModel.fromJson)
            .toList();
      },
    );
    return envelope.data ?? const [];
  }

  @override
  Future<SubscriptionModel> cancelSubscription(String subscriptionId) async {
    final envelope = await _apiClient.post<SubscriptionModel>(
      BackendApiPaths.billingSubscriptionCancel(subscriptionId),
      decodeData: (json) => SubscriptionModel.fromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  @override
  Future<List<InvoiceModel>> getInvoices() async {
    final envelope = await _apiClient.get<List<InvoiceModel>>(
      BackendApiPaths.billingInvoices,
      decodeData: (json) =>
          _requireList(json).map(InvoiceModel.fromJson).toList(),
    );
    return envelope.data ?? const [];
  }

  @override
  Future<List<EntitlementModel>> getEntitlements() async {
    final envelope = await _apiClient.get<List<EntitlementModel>>(
      BackendApiPaths.billingSubscriptions,
      decodeData: (json) {
        final items = _requireMap(json)['entitlements'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(EntitlementModel.fromJson)
            .toList();
      },
    );
    return envelope.data ?? const [];
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  Map<String, dynamic> _requireMap(Object? json) {
    if (json is! Map<String, dynamic>) {
      throw const FormatException('Unexpected billing response shape');
    }
    return json;
  }

  List<Map<String, dynamic>> _requireList(Object? json) {
    if (json is! List) {
      throw const FormatException('Unexpected billing response shape');
    }
    return json.whereType<Map<String, dynamic>>().toList();
  }
}
