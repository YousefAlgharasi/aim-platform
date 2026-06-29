// PricingNotifier — drives the "Plans & Pricing" screen.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import '../../data/models/billing_models.dart';
import '../entity/billing_data.dart';
import '../repository/billing_repository.dart';

class PricingNotifier extends AppStateNotifier<PricingData> {
  PricingNotifier({required BillingRepository repository})
      : _repository = repository;

  final BillingRepository _repository;

  Future<void> load() async {
    setLoading();
    try {
      final results = await Future.wait<Object>([
        _repository.getPlans(),
        _repository.getPrices(),
      ]);

      setSuccess(PricingData(
        plans: results[0] as List<BillingPlanModel>,
        prices: results[1] as List<BillingPriceModel>,
      ));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load pricing data',
        code: 'PRICING_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh() => load();
}
