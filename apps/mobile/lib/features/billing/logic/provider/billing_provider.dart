// Billing feature Riverpod providers.
//
// Registers:
//   billingDatasourceProvider  — datasource
//   billingRepositoryProvider  — repository (use this in notifiers/UI)
//   subscriptionProvider       — "My Subscription" screen state
//   pricingProvider            — "Plans & Pricing" screen state
//   invoiceProvider            — "Invoice History" screen state
//
// Security rules:
// - Uses authenticatedBackendApiClientProvider so bearer token is injected
//   automatically; never stored in the datasource.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/billing/data/datasources/billing_datasource.dart';
import 'package:aim_mobile/features/billing/data/datasources/billing_datasource_impl.dart';
import 'package:aim_mobile/features/billing/data/models/billing_models.dart';
import 'package:aim_mobile/features/billing/data/repository/billing_repository_impl.dart';
import 'package:aim_mobile/features/billing/logic/entity/billing_data.dart';
import 'package:aim_mobile/features/billing/logic/provider/invoice_notifier.dart';
import 'package:aim_mobile/features/billing/logic/provider/pricing_notifier.dart';
import 'package:aim_mobile/features/billing/logic/provider/subscription_notifier.dart';
import 'package:aim_mobile/features/billing/logic/repository/billing_repository.dart';

/// Provides the concrete [BillingDatasource].
/// Consumers should depend on [billingRepositoryProvider] instead.
final billingDatasourceProvider = Provider<BillingDatasource>((ref) {
  return BillingDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

/// Provides the [BillingRepository] used by notifiers and pages.
final billingRepositoryProvider = Provider<BillingRepository>((ref) {
  return BillingRepositoryImpl(ref.watch(billingDatasourceProvider));
});

/// "My Subscription" screen state.
final subscriptionProvider =
    StateNotifierProvider<SubscriptionNotifier, AppAsyncState<SubscriptionData>>(
  (ref) => SubscriptionNotifier(
    repository: ref.watch(billingRepositoryProvider),
  ),
);

/// "Plans & Pricing" screen state.
final pricingProvider =
    StateNotifierProvider<PricingNotifier, AppAsyncState<PricingData>>(
  (ref) => PricingNotifier(
    repository: ref.watch(billingRepositoryProvider),
  ),
);

/// "Invoice History" screen state.
final invoiceProvider =
    StateNotifierProvider<InvoiceNotifier, AppAsyncState<List<InvoiceModel>>>(
  (ref) => InvoiceNotifier(
    repository: ref.watch(billingRepositoryProvider),
  ),
);

/// Bumped by [DeepLinkHandler] when the app is resumed via the
/// `aim://billing/checkout/...` redirect from the payment provider, so
/// [CheckoutStatusPage] knows to re-check the session status.
final checkoutReturnSignalProvider = StateProvider<int>((ref) => 0);
