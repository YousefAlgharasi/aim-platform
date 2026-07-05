import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'lesson_progress_remote_datasource.dart';

class LessonProgressRemoteDatasourceImpl
    implements LessonProgressRemoteDatasource {
  const LessonProgressRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<void> recordProgress({
    required String bearerToken,
    required String lessonId,
    required int percent,
  }) async {
    await _apiClient.post<void>(
      BackendApiPaths.lessonProgress(lessonId),
      body: {'percent': percent},
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (_) {},
    );
  }

  @override
  Future<void> markComplete({
    required String bearerToken,
    required String lessonId,
  }) async {
    await _apiClient.post<void>(
      BackendApiPaths.lessonComplete(lessonId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (_) {},
    );
  }
}
