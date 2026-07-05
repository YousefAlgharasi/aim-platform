// Phase 6 — P6-088 / P6-091
// QuestionAnswerRepositoryImpl — data-layer implementation.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/attempt_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/question_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/session_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/session_feedback_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/lesson_progress_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';
import 'package:aim_mobile/features/question_answer/logic/repository/question_answer_repository.dart';

class QuestionAnswerRepositoryImpl implements QuestionAnswerRepository {
  const QuestionAnswerRepositoryImpl({
    required QuestionRemoteDatasource questionDatasource,
    required AttemptRemoteDatasource attemptDatasource,
    required SessionFeedbackRemoteDatasource sessionFeedbackDatasource,
    required SessionRemoteDatasource sessionDatasource,
    required LessonProgressRemoteDatasource lessonProgressDatasource,
  })  : _questionDatasource = questionDatasource,
        _attemptDatasource = attemptDatasource,
        _sessionFeedbackDatasource = sessionFeedbackDatasource,
        _sessionDatasource = sessionDatasource,
        _lessonProgressDatasource = lessonProgressDatasource;

  final QuestionRemoteDatasource _questionDatasource;
  final AttemptRemoteDatasource _attemptDatasource;
  final SessionFeedbackRemoteDatasource _sessionFeedbackDatasource;
  final SessionRemoteDatasource _sessionDatasource;
  final LessonProgressRemoteDatasource _lessonProgressDatasource;

  @override
  Future<SessionStartResponseModel> startSession({
    required String bearerToken,
    required String sessionType,
    List<String> skillFocusIds = const [],
  }) =>
      _wrap(() => _sessionDatasource.startSession(
            bearerToken: bearerToken,
            sessionType: sessionType,
            skillFocusIds: skillFocusIds,
          ));

  @override
  Future<List<QuestionModel>> getLessonQuestions({
    required String bearerToken,
    required String sessionId,
    required String lessonId,
  }) =>
      _wrap(() => _sessionDatasource.getLessonQuestions(
            bearerToken: bearerToken,
            sessionId: sessionId,
            lessonId: lessonId,
          ));

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

  @override
  Future<SessionFeedbackModel> getSessionState({
    required String bearerToken,
    required String studentId,
    required String sessionId,
  }) =>
      _wrap(() => _sessionFeedbackDatasource.getSessionState(
            bearerToken: bearerToken,
            studentId: studentId,
            sessionId: sessionId,
          ));

  @override
  Future<void> recordLessonProgress({
    required String bearerToken,
    required String lessonId,
    required int percent,
  }) =>
      _wrap(() => _lessonProgressDatasource.recordProgress(
            bearerToken: bearerToken,
            lessonId: lessonId,
            percent: percent,
          ));

  @override
  Future<void> markLessonComplete({
    required String bearerToken,
    required String lessonId,
  }) =>
      _wrap(() => _lessonProgressDatasource.markComplete(
            bearerToken: bearerToken,
            lessonId: lessonId,
          ));

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
