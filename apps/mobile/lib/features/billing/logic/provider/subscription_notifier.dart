// SubscriptionNotifier — drives the "My Subscription" screen.
//
// Fetches subscriptions + entitlements in parallel and exposes them as a
// single [AppAsyncState<SubscriptionData>] for the UI to render.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import '../../data/models/billing_models.dart';
import '../entity/billing_data.dart';
import '../repository/billing_repository.dart';

class SubscriptionNotifier extends AppStateNotifier<SubscriptionData> {
  SubscriptionNotifier({required BillingRepository repository})
      : _repository = repository;

  final BillingRepository _repository;

  Future<void> load() async {
    setLoading();
    try {
      final results = await Future.wait<Object>([
        _repository.getSubscriptions(),
        _repository.getEntitlements(),
      ]);

      setSuccess(SubscriptionData(
        subscriptions: results[0] as List<SubscriptionModel>,
        entitlements: results[1] as List<EntitlementModel>,
      ));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load subscription data',
        code: 'SUBSCRIPTION_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh() => load();

  Future<void> cancelSubscription(String subscriptionId) async {
    try {
      await _repository.cancelSubscription(subscriptionId);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
      return;
    } catch (e) {
      setFailure(
        message: 'Failed to cancel subscription',
        code: 'SUBSCRIPTION_CANCEL_FAILED',
      );
      return;
    }
    await refresh();
  }
}
