// Phase 6 — P6-086
// QuestionRemoteDatasourceImpl — concrete implementation.
//
// Scope: Question/answer session only.
//
// Security rules:
// - questionId comes from a backend-supplied session; never from user input.
// - Bearer token injected from provider layer; never stored here.
// - Response is parsed as QuestionModel — which has NO isCorrect field.
//   Any is_correct in the JSON is silently dropped by the model.
// - Flutter never calls the AIM Engine or any AI provider.
// - No secrets here.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';
import 'question_remote_datasource.dart';

class QuestionRemoteDatasourceImpl implements QuestionRemoteDatasource {
  const QuestionRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<QuestionModel> getQuestion({
    required String bearerToken,
    required String questionId,
  }) async {
    final envelope = await _apiClient.get<QuestionModel>(
      BackendApiPaths.curriculumQuestion(questionId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        if (json is! Map<String, dynamic>) {
          throw const FormatException('Unexpected question response shape');
        }
        // QuestionModel.fromJson silently drops is_correct / correct_answer
        // if present — correctness never reaches Flutter state.
        return QuestionModel.fromJson(json);
      },
    );
    return envelope.data!;
  }
}
