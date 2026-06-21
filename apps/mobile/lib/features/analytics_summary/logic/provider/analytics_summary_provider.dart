// Phase 15 — P15-072
// Analytics summary Riverpod providers.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/analytics_summary/data/datasources/analytics_summary_remote_datasource.dart';
import 'package:aim_mobile/features/analytics_summary/data/datasources/analytics_summary_remote_datasource_impl.dart';
import 'package:aim_mobile/features/analytics_summary/data/models/analytics_summary_report_model.dart';
import 'package:aim_mobile/features/analytics_summary/data/repository/repo_impl/analytics_summary_repository_impl.dart';
import 'package:aim_mobile/features/analytics_summary/logic/repository/analytics_summary_repository.dart';
import 'analytics_summary_notifier.dart';

final analyticsSummaryRemoteDatasourceProvider =
    Provider<AnalyticsSummaryRemoteDatasource>((ref) {
  return AnalyticsSummaryRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final analyticsSummaryRepositoryProvider =
    Provider<AnalyticsSummaryRepository>((ref) {
  return AnalyticsSummaryRepositoryImpl(
    datasource: ref.watch(analyticsSummaryRemoteDatasourceProvider),
  );
});

final analyticsSummaryProvider = StateNotifierProvider<
    AnalyticsSummaryNotifier,
    AppAsyncState<List<AnalyticsSummaryReportModel>>>(
  (ref) => AnalyticsSummaryNotifier(
    repository: ref.watch(analyticsSummaryRepositoryProvider),
  ),
);
