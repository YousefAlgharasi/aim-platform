// Aggregated billing screen data entities.
//
// All values are backend-computed; Flutter renders them verbatim.

import 'package:aim_mobile/features/billing/data/models/billing_models.dart';

/// Aggregated subscription screen data: the user's subscriptions plus the
/// entitlements granted by them.
class SubscriptionData {
  const SubscriptionData({
    required this.subscriptions,
    required this.entitlements,
  });

  final List<SubscriptionModel> subscriptions;
  final List<EntitlementModel> entitlements;

  bool get hasActiveSubscription =>
      subscriptions.any((s) => s.isActive);

  SubscriptionModel? get currentSubscription =>
      subscriptions.where((s) => s.isActive).isEmpty
          ? null
          : subscriptions.firstWhere((s) => s.isActive);
}

/// Aggregated pricing screen data.
class PricingData {
  const PricingData({
    required this.plans,
    required this.prices,
  });

  final List<BillingPlanModel> plans;
  final List<BillingPriceModel> prices;
}
