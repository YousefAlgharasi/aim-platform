import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';

import '../data/practice_topics_datasource.dart';
import '../data/practice_topics_models.dart';

final practiceTopicsDatasourceProvider = Provider<PracticeTopicsDatasource>((ref) {
  return PracticeTopicsDatasource(apiClient: ref.watch(authenticatedBackendApiClientProvider));
});

/// Active topics of one kind: 'speaking' or 'writing'.
final practiceTopicsProvider =
    FutureProvider.autoDispose.family<List<PracticeTopic>, String>((ref, kind) {
  return ref.watch(practiceTopicsDatasourceProvider).getTopics(kind);
});

/// 402: the student has no started course with access.
bool isPracticeLocked(Object error) => error is ApiClientException && error.statusCode == 402;
