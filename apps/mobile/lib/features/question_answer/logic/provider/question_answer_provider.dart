// Phase 6 — P6-088 / P6-089 / P6-091
// Question/answer feature Riverpod providers.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/attempt_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/attempt_remote_datasource_impl.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/question_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/question_remote_datasource_impl.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/session_feedback_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/session_feedback_remote_datasource_impl.dart';
import 'package:aim_mobile/features/question_answer/data/repository/repo_impl/question_answer_repository_impl.dart';
import 'package:aim_mobile/features/question_answer/logic/entity/question_session_state.dart';
import 'package:aim_mobile/features/question_answer/logic/repository/question_answer_repository.dart';
import 'question_answer_notifier.dart';

final questionRemoteDatasourceProvider =
    Provider<QuestionRemoteDatasource>((ref) {
  return QuestionRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final attemptRemoteDatasourceProvider =
    Provider<AttemptRemoteDatasource>((ref) {
  return AttemptRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final sessionFeedbackRemoteDatasourceProvider =
    Provider<SessionFeedbackRemoteDatasource>((ref) {
  return SessionFeedbackRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final questionAnswerRepositoryProvider =
    Provider<QuestionAnswerRepository>((ref) {
  return QuestionAnswerRepositoryImpl(
    questionDatasource: ref.watch(questionRemoteDatasourceProvider),
    attemptDatasource: ref.watch(attemptRemoteDatasourceProvider),
    sessionFeedbackDatasource:
        ref.watch(sessionFeedbackRemoteDatasourceProvider),
  );
});

final questionAnswerSessionProvider = StateNotifierProvider.autoDispose<
    QuestionAnswerNotifier, QuestionSessionState>(
  (ref) => QuestionAnswerNotifier(
    repository: ref.watch(questionAnswerRepositoryProvider),
  ),
);
