// Phase 6 — P6-091
// SessionFeedbackRemoteDatasourceImpl — concrete implementation.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/question_answer/data/models/session_feedback_model.dart';
import 'session_feedback_remote_datasource.dart';

class SessionFeedbackRemoteDatasourceImpl
    implements SessionFeedbackRemoteDatasource {
  const SessionFeedbackRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<SessionFeedbackModel> getSessionState({
    required String bearerToken,
    required String studentId,
    required String sessionId,
  }) async {
    final envelope = await _apiClient.get<SessionFeedbackModel>(
      BackendApiPaths.aimSessionState(studentId, sessionId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        if (json is! Map<String, dynamic>) {
          throw const FormatException('Unexpected session state response shape');
        }
        return SessionFeedbackModel.fromJson(json);
      },
    );
    return envelope.data!;
  }
}
