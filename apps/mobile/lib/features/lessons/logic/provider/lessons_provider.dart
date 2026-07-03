// Phase 6 — P6-072 / P6-073
// lessons_provider.dart — Riverpod providers for the lessons feature.
//
// Scope: Lessons / curriculum browser only.
//
// Registers:
//   lessonsRemoteDatasourceProvider — datasource
//   lessonsRepositoryProvider        — repository (use this in notifiers/UI)
//   coursesProvider                  — course list notifier
//
// Security rules:
// - Uses authenticatedBackendApiClientProvider so bearer token is injected
//   automatically; never stored in the datasource or repository.
// - levelId and chapterId are always sourced from prior backend responses.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lessons_remote_datasource.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lessons_remote_datasource_impl.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lesson_detail_remote_datasource.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lesson_detail_remote_datasource_impl.dart';
import 'package:aim_mobile/features/lessons/data/repository/repo_impl/lesson_detail_repository_impl.dart';
import 'package:aim_mobile/features/lessons/data/repository/repo_impl/lessons_repository_impl.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lesson_detail_repository.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';
import 'chapters_notifier.dart';
import 'lesson_detail_notifier.dart';
import 'lessons_list_notifier.dart';
import 'courses_notifier.dart';

/// Provides the concrete [LessonsRemoteDatasource].
/// Consumers should depend on [lessonsRepositoryProvider] instead.
final lessonsRemoteDatasourceProvider =
    Provider<LessonsRemoteDatasource>((ref) {
  return LessonsRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

/// Provides the [LessonsRepository] used by notifiers and pages.
///
/// Security: all IDs (levelId, chapterId) passed to repository methods must
/// come from prior backend responses — never from user input.
final lessonsRepositoryProvider = Provider<LessonsRepository>((ref) {
  return LessonsRepositoryImpl(
    datasource: ref.watch(lessonsRemoteDatasourceProvider),
  );
});

/// Course list state provider.
///
/// Consumers call [CoursesNotifier.load] with a bearer token from
/// [authFlowProvider]. Stays alive for the session so the list page
/// does not reload on every navigation event.
final coursesProvider =
    StateNotifierProvider<CoursesNotifier, AppAsyncState<List<CourseModel>>>(
  (ref) => CoursesNotifier(
    repository: ref.watch(lessonsRepositoryProvider),
  ),
);

/// Chapter list state provider.
///
/// Consumers must call [ChaptersNotifier.load] with a bearer token and
/// the backend-supplied levelId. Uses .autoDispose so state is cleared
/// when navigating away from the chapter list screen.
///
/// Security: levelId must come from a prior backend CourseModel response.
final chaptersProvider = StateNotifierProvider.autoDispose<
    ChaptersNotifier, AppAsyncState<List<ChapterProgressModel>>>(
  (ref) => ChaptersNotifier(
    repository: ref.watch(lessonsRepositoryProvider),
  ),
);

/// Lesson list state provider.
///
/// Consumers must call [LessonsListNotifier.load] with a bearer token and
/// the backend-supplied chapterId. Uses .autoDispose so state is cleared
/// when navigating away from the lesson list screen.
///
/// Security: chapterId must come from a prior backend ChapterModel response.
final lessonsListProvider = StateNotifierProvider.autoDispose<
    LessonsListNotifier, AppAsyncState<List<LessonProgressModel>>>(
  (ref) => LessonsListNotifier(
    repository: ref.watch(lessonsRepositoryProvider),
  ),
);

/// Lesson detail datasource provider.
final lessonDetailRemoteDatasourceProvider =
    Provider<LessonDetailRemoteDatasource>((ref) {
  return LessonDetailRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

/// Lesson detail repository provider.
final lessonDetailRepositoryProvider =
    Provider<LessonDetailRepository>((ref) {
  return LessonDetailRepositoryImpl(
    datasource: ref.watch(lessonDetailRemoteDatasourceProvider),
  );
});

/// Lesson detail state provider.
///
/// Consumers call [LessonDetailNotifier.load] with bearerToken and
/// the backend-supplied lessonId. Uses .autoDispose so state is cleared
/// when navigating away from the lesson detail screen.
///
/// Security: lessonId must come from a prior backend LessonModel response.
final lessonDetailProvider = StateNotifierProvider.autoDispose<
    LessonDetailNotifier, AppAsyncState<LessonDetail>>(
  (ref) => LessonDetailNotifier(
    repository: ref.watch(lessonDetailRepositoryProvider),
  ),
);
