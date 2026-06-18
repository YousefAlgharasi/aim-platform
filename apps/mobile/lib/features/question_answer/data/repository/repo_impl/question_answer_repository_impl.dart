// Phase 6 — P6-088
// QuestionAnswerRepositoryImpl — data-layer implementation.
//
// Scope: Question/answer session only.
//
// Wraps QuestionRemoteDatasource and AttemptRemoteDatasource, mapping
// ApiClientException to AppException so the logic layer deals in domain
// errors only.
//
// Security rules:
// - All values passed verbatim from datasources to logic layer.
// - No correctness evaluation, mastery calculation, or AIM Engine logic here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/attempt_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/question_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';
import 'package:aim_mobile/features/question_answer/logic/repository/question_answer_repository.dart';

class QuestionAnswerRepositoryImpl implements QuestionAnswerRepository {
  const QuestionAnswerRepositoryImpl({
    required QuestionRemoteDatasource questionDatasource,
    required AttemptRemoteDatasource attemptDatasource,
  })  : _questionDatasource = questionDatasource,
        _attemptDatasource = attemptDatasource;

  final QuestionRemoteDatasource _questionDatasource;
  final AttemptRemoteDatasource _attemptDatasource;

  @override
  Future<QuestionModel> getQuestion({
    required String bearerToken,
    required String questionId,
  }) =>
      _wrap(() => _questionDatasource.getQuestion(
            bearerToken: bearerToken,
            questionId: questionId,
          ));

  @override
  Future<AttemptSubmitResponseModel> submitAttempt({
    required String bearerToken,
    required String sessionId,
    required AttemptSubmitRequestModel request,
  }) =>
      _wrap(() => _attemptDatasource.submitAttempt(
            bearerToken: bearerToken,
            sessionId: sessionId,
            request: request,
          ));

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
