import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/home/data/course_path_loader.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';

/// Loads the Home roadmap's course path. The API client is read lazily so a
/// problem creating it falls back to the separate endpoints instead of
/// failing the roadmap.
final coursePathLoaderProvider = Provider<CoursePathLoader>((ref) {
  return CoursePathLoader(
    apiClient: () => ref.read(authenticatedBackendApiClientProvider),
    lessonsRepository: ref.watch(lessonsRepositoryProvider),
  );
});
