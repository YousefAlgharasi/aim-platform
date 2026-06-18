// Phase 6 — P6-088
// Question/answer feature Riverpod providers.
//
// Scope: Question/answer session only.
//
// Registers:
//   questionRemoteDatasourceProvider  — question datasource
//   attemptRemoteDatasourceProvider   — attempt datasource
//   questionAnswerRepositoryProvider  — repository (use this in notifiers/UI)
//
// Security rules:
// - Uses authenticatedBackendApiClientProvider so bearer token is injected
//   automatically; never stored in the datasource.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/attempt_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/attempt_remote_datasource_impl.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/question_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/question_remote_datasource_impl.dart';
import 'package:aim_mobile/features/question_answer/data/repository/repo_impl/question_answer_repository_impl.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/question_answer/logic/repository/question_answer_repository.dart';
import 'question_answer_notifier.dart';

/// Provides the concrete [QuestionRemoteDatasource].
final questionRemoteDatasourceProvider =
    Provider<QuestionRemoteDatasource>((ref) {
  return QuestionRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

/// Provides the concrete [AttemptRemoteDatasource].
final attemptRemoteDatasourceProvider =
    Provider<AttemptRemoteDatasource>((ref) {
  return AttemptRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

/// Provides the [QuestionAnswerRepository] used by notifiers and pages.
final questionAnswerRepositoryProvider =
    Provider<QuestionAnswerRepository>((ref) {
  return QuestionAnswerRepositoryImpl(
    questionDatasource: ref.watch(questionRemoteDatasourceProvider),
    attemptDatasource: ref.watch(attemptRemoteDatasourceProvider),
  );
});

/// Q/A screen state provider (autoDispose — clears on navigation away).
final questionAnswerProvider = StateNotifierProvider.autoDispose<
    QuestionAnswerNotifier, AppAsyncState<QuestionAnswerScreenState>>(
  (ref) => QuestionAnswerNotifier(
    repository: ref.watch(questionAnswerRepositoryProvider),
  ),
);
