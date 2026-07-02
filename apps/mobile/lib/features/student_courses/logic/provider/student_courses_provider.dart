// StudentCourses Riverpod providers.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/student_courses/data/datasources/student_courses_remote_datasource.dart';
import 'package:aim_mobile/features/student_courses/data/datasources/student_courses_remote_datasource_impl.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/data/repository/repo_impl/student_courses_repository_impl.dart';
import 'package:aim_mobile/features/student_courses/logic/repository/student_courses_repository.dart';
import 'student_courses_notifier.dart';

final studentCoursesRemoteDatasourceProvider =
    Provider<StudentCoursesRemoteDatasource>((ref) {
  return StudentCoursesRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final studentCoursesRepositoryProvider =
    Provider<StudentCoursesRepository>((ref) {
  return StudentCoursesRepositoryImpl(
    datasource: ref.watch(studentCoursesRemoteDatasourceProvider),
  );
});

final studentCoursesProvider = StateNotifierProvider<StudentCoursesNotifier,
    AppAsyncState<List<StudentCourseModel>>>(
  (ref) => StudentCoursesNotifier(
    repository: ref.watch(studentCoursesRepositoryProvider),
  ),
);
