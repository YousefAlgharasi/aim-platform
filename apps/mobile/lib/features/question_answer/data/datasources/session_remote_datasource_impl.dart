// AIM pipeline live wiring.
// SessionRemoteDatasourceImpl — concrete implementation.
//
// Endpoints: POST /sessions/start, GET /sessions/:sessionId/questions
//
// Security rules:
// - studentId is never in any payload — the backend resolves it from the JWT.
// - Bearer token injected from provider layer; never stored here.
// - QuestionModel has NO isCorrect field; any correctness data in the JSON
//   (there is none by backend contract) would be silently dropped.
// - Flutter never calls the AIM Engine or any AI provider.
// - No secrets here.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_model.dart';
import 'package:aim_mobile/features/question_answer/data/models/session_start_response_model.dart';
import 'session_remote_datasource.dart';

class SessionRemoteDatasourceImpl implements SessionRemoteDatasource {
  const SessionRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<SessionStartResponseModel> startSession({
    required String bearerToken,
    required String sessionType,
    List<String> skillFocusIds = const [],
  }) async {
    final envelope = await _apiClient.post<SessionStartResponseModel>(
      BackendApiPaths.sessionsStart,
      body: {
        'sessionType': sessionType,
        'skillFocusIds': skillFocusIds,
      },
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        if (json is! Map<String, dynamic>) {
          throw const FormatException('Unexpected session start response shape');
        }
        return SessionStartResponseModel.fromJson(json);
      },
    );
    return envelope.data!;
  }

  @override
  Future<List<QuestionModel>> getLessonQuestions({
    required String bearerToken,
    required String sessionId,
    required String lessonId,
  }) async {
    final envelope = await _apiClient.get<List<QuestionModel>>(
      BackendApiPaths.sessionQuestions(sessionId),
      queryParameters: {'lessonId': lessonId},
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        if (json is! Map<String, dynamic>) {
          throw const FormatException(
            'Unexpected session questions response shape',
          );
        }
        final rawQuestions = json['questions'] as List<dynamic>? ?? [];
        return rawQuestions
            .whereType<Map<String, dynamic>>()
            .map(QuestionModel.fromJson)
            .toList();
      },
    );
    return envelope.data!;
  }
}
