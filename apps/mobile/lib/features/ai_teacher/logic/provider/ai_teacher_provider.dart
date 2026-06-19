// Phase 8 — P8-083
// AI Teacher chat Riverpod providers.
//
// Registers:
//   aiTeacherRemoteDatasourceProvider — backend datasource
//   aiTeacherChatRepositoryProvider   — repository
//   aiTeacherChatProvider             — chat state notifier
//
// Security rules:
// - Uses authenticatedBackendApiClientProvider so calls go through the backend
//   gateway only.
// - No AI provider SDKs, endpoints, or secrets are configured in Flutter.
// - No AIM Engine calculations or client-side learning authority are added.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/ai_teacher/data/datasources/ai_teacher_remote_datasource.dart';
import 'package:aim_mobile/features/ai_teacher/data/datasources/ai_teacher_remote_datasource_impl.dart';
import 'package:aim_mobile/features/ai_teacher/data/repository/repo_impl/ai_teacher_chat_repository_impl.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_chat_state.dart';
import 'package:aim_mobile/features/ai_teacher/logic/repository/ai_teacher_chat_repository.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'ai_teacher_chat_notifier.dart';

final aiTeacherRemoteDatasourceProvider =
    Provider<AiTeacherRemoteDatasource>((ref) {
  return AiTeacherRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final aiTeacherChatRepositoryProvider =
    Provider<AiTeacherChatRepository>((ref) {
  return AiTeacherChatRepositoryImpl(
    datasource: ref.watch(aiTeacherRemoteDatasourceProvider),
  );
});

final aiTeacherChatProvider = StateNotifierProvider.autoDispose<
    AiTeacherChatNotifier, AppAsyncState<AiTeacherChatState>>(
  (ref) => AiTeacherChatNotifier(
    repository: ref.watch(aiTeacherChatRepositoryProvider),
  ),
);
