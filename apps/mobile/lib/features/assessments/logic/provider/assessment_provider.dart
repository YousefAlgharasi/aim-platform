// P10-053: Riverpod providers for the assessments feature.
// All assessment data comes from the backend. Flutter never computes
// scoring, correctness, deadline status, or attempt eligibility.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/assessments/data/datasources/assessment_datasources.dart';
import 'package:aim_mobile/features/assessments/data/repository/assessment_data_repository.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/repository/assessment_repository.dart';
import 'assessment_list_notifier.dart';
import 'assessment_detail_notifier.dart';
import 'attempt_notifier.dart';
import 'result_notifier.dart';
import 'deadlines_notifier.dart';

final assessmentRemoteDatasourceProvider =
    Provider<AssessmentRemoteDatasource>((ref) {
  return AssessmentRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final assessmentRepositoryProvider = Provider<AssessmentRepository>((ref) {
  return AssessmentRepositoryImpl(
    datasource: ref.watch(assessmentRemoteDatasourceProvider),
  );
});

final assessmentListProvider = StateNotifierProvider<AssessmentListNotifier,
    AppAsyncState<List<AssessmentListItem>>>(
  (ref) => AssessmentListNotifier(
    repository: ref.watch(assessmentRepositoryProvider),
  ),
);

final assessmentDetailProvider = StateNotifierProvider.autoDispose<
    AssessmentDetailNotifier, AppAsyncState<AssessmentDetail>>(
  (ref) => AssessmentDetailNotifier(
    repository: ref.watch(assessmentRepositoryProvider),
  ),
);

final startAttemptProvider = StateNotifierProvider.autoDispose<
    StartAttemptNotifier, AppAsyncState<StartAttemptResult>>(
  (ref) => StartAttemptNotifier(
    repository: ref.watch(assessmentRepositoryProvider),
  ),
);

final resumeAttemptProvider = StateNotifierProvider.autoDispose<
    ResumeAttemptNotifier, AppAsyncState<ResumeAttemptResult>>(
  (ref) => ResumeAttemptNotifier(
    repository: ref.watch(assessmentRepositoryProvider),
  ),
);

final submitAttemptProvider = StateNotifierProvider.autoDispose<
    SubmitAttemptNotifier, AppAsyncState<SubmitAttemptResult>>(
  (ref) => SubmitAttemptNotifier(
    repository: ref.watch(assessmentRepositoryProvider),
  ),
);

final attemptResultProvider = StateNotifierProvider.autoDispose<
    AttemptResultNotifier, AppAsyncState<AttemptResultDetail>>(
  (ref) => AttemptResultNotifier(
    repository: ref.watch(assessmentRepositoryProvider),
  ),
);

final resultHistoryProvider = StateNotifierProvider.autoDispose<
    ResultHistoryNotifier, AppAsyncState<ResultHistory>>(
  (ref) => ResultHistoryNotifier(
    repository: ref.watch(assessmentRepositoryProvider),
  ),
);

final deadlinesProvider = StateNotifierProvider<DeadlinesNotifier,
    AppAsyncState<StudentDeadlines>>(
  (ref) => DeadlinesNotifier(
    repository: ref.watch(assessmentRepositoryProvider),
  ),
);
