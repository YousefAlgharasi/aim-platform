import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/enrollment/data/datasources/enrollment_remote_datasource.dart';
import 'package:aim_mobile/features/enrollment/data/datasources/enrollment_remote_datasource_impl.dart';
import 'package:aim_mobile/features/enrollment/data/repository/repo_impl/enrollment_repository_impl.dart';
import 'package:aim_mobile/features/enrollment/logic/entity/current_enrollment.dart';
import 'package:aim_mobile/features/enrollment/logic/repository/enrollment_repository.dart';

final enrollmentRemoteDatasourceProvider =
    Provider<EnrollmentRemoteDatasource>((ref) {
  return EnrollmentRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final enrollmentRepositoryProvider = Provider<EnrollmentRepository>((ref) {
  return EnrollmentRepositoryImpl(
    datasource: ref.watch(enrollmentRemoteDatasourceProvider),
  );
});

/// The student's current active course (or none yet). Loaded once per app
/// session; call [CurrentEnrollmentNotifier.refresh] after enrolling in a
/// new course so the rest of the app (course list badge, etc.) picks up
/// the change immediately.
class CurrentEnrollmentNotifier extends StateNotifier<AsyncValue<CurrentEnrollment>> {
  CurrentEnrollmentNotifier({required EnrollmentRepository repository})
      : _repository = repository,
        super(const AsyncValue.loading());

  final EnrollmentRepository _repository;

  Future<void> load({required String bearerToken}) async {
    state = const AsyncValue.loading();
    try {
      final result = await _repository.getCurrent(bearerToken: bearerToken);
      state = AsyncValue.data(result);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  /// Enroll in [courseId], making it the active course, and update local
  /// state immediately so callers don't need a separate reload.
  Future<CurrentEnrollment> enroll({
    required String bearerToken,
    required String courseId,
  }) async {
    final result = await _repository.enroll(
      bearerToken: bearerToken,
      courseId: courseId,
    );
    state = AsyncValue.data(result);
    return result;
  }
}

final currentEnrollmentProvider = StateNotifierProvider<CurrentEnrollmentNotifier,
    AsyncValue<CurrentEnrollment>>(
  (ref) => CurrentEnrollmentNotifier(
    repository: ref.watch(enrollmentRepositoryProvider),
  ),
);
