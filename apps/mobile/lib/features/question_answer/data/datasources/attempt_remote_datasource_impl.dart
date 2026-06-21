// Phase 6 — P6-087
// AttemptRemoteDatasourceImpl — concrete implementation.
//
// Scope: Question/answer session only.
//
// Security rules:
// - sessionId and itemId come from backend-supplied session state; never raw
//   user input.
// - Bearer token injected from provider layer; never stored here.
// - Response parsed as AttemptSubmitResponseModel — which has NO is_correct
//   field. Backend intentionally omits it during an active session.
// - Flutter never calls the AIM Engine or any AI provider.
// - No secrets here.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';
import 'attempt_remote_datasource.dart';

class AttemptRemoteDatasourceImpl implements AttemptRemoteDatasource {
  const AttemptRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<AttemptSubmitResponseModel> submitAttempt({
    required String bearerToken,
    required String sessionId,
    required AttemptSubmitRequestModel request,
  }) async {
    final envelope = await _apiClient.post<AttemptSubmitResponseModel>(
      BackendApiPaths.sessionAttempt(sessionId),
      body: request.toJson(),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        if (json is! Map<String, dynamic>) {
          throw const FormatException('Unexpected attempt response shape');
        }
        // AttemptSubmitResponseModel.fromJson never reads is_correct —
        // the field does not exist on the model by design.
        return AttemptSubmitResponseModel.fromJson(json);
      },
    );
    return envelope.data!;
  }
}
