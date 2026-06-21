// Phase 15 — P15-072
// AnalyticsSummaryNotifier — loads backend-approved report definitions.
//
// Flutter NEVER computes report content. All values are backend outputs.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/analytics_summary/data/models/analytics_summary_report_model.dart';
import 'package:aim_mobile/features/analytics_summary/logic/repository/analytics_summary_repository.dart';

class AnalyticsSummaryNotifier
    extends AppStateNotifier<List<AnalyticsSummaryReportModel>> {
  AnalyticsSummaryNotifier({required AnalyticsSummaryRepository repository})
      : _repository = repository;

  final AnalyticsSummaryRepository _repository;

  Future<void> load({required String bearerToken}) async {
    setLoading();
    try {
      final reports = await _repository.getSummary(bearerToken: bearerToken);
      setSuccess(reports);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load analytics summary',
        code: 'ANALYTICS_SUMMARY_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh({required String bearerToken}) =>
      load(bearerToken: bearerToken);

  void clear() => reset();
}
