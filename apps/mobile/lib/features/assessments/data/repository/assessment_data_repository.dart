// P10-052: AssessmentRepositoryImpl — data-layer implementation.
// Wraps AssessmentRemoteDatasource; maps ApiClientException to AppException.
// All values passed verbatim from datasource to logic layer.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/assessments/data/datasources/assessment_remote_datasource.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/repository/assessment_repository.dart';

class AssessmentRepositoryImpl implements AssessmentRepository {
  const AssessmentRepositoryImpl({
    required AssessmentRemoteDatasource datasource,
  }) : _datasource = datasource;

  final AssessmentRemoteDatasource _datasource;

  @override
  Future<List<AssessmentListItem>> getAssessments({
    required String bearerToken,
  }) =>
      _wrap(() => _datasource.getAssessments(bearerToken: bearerToken));

  @override
  Future<AssessmentListItem?> getNextAssessment({
    required String bearerToken,
  }) =>
      _wrap(() => _datasource.getNextAssessment(bearerToken: bearerToken));

  @override
  Future<AssessmentDetail> getAssessmentDetail({
    required String bearerToken,
    required String assessmentId,
  }) =>
      _wrap(() => _datasource.getAssessmentDetail(
            bearerToken: bearerToken,
            assessmentId: assessmentId,
          ));

  @override
  Future<ResultHistory> getResultHistory({
    required String bearerToken,
    required String assessmentId,
  }) =>
      _wrap(() => _datasource.getResultHistory(
            bearerToken: bearerToken,
            assessmentId: assessmentId,
          ));

  @override
  Future<StudentDeadlines> getDeadlines({
    required String bearerToken,
  }) =>
      _wrap(() => _datasource.getDeadlines(bearerToken: bearerToken));

  @override
  Future<StartAttemptResult> startAttempt({
    required String bearerToken,
    required String assessmentId,
  }) =>
      _wrap(() => _datasource.startAttempt(
            bearerToken: bearerToken,
            assessmentId: assessmentId,
          ));

  @override
  Future<ResumeAttemptResult> resumeAttempt({
    required String bearerToken,
    required String attemptId,
  }) =>
      _wrap(() => _datasource.resumeAttempt(
            bearerToken: bearerToken,
            attemptId: attemptId,
          ));

  @override
  Future<SubmitAttemptResult> submitAttempt({
    required String bearerToken,
    required String attemptId,
  }) =>
      _wrap(() => _datasource.submitAttempt(
            bearerToken: bearerToken,
            attemptId: attemptId,
          ));

  @override
  Future<AttemptResultDetail> getAttemptResult({
    required String bearerToken,
    required String attemptId,
  }) =>
      _wrap(() => _datasource.getAttemptResult(
            bearerToken: bearerToken,
            attemptId: attemptId,
          ));

  @override
  Future<List<AttemptQuestion>> getAttemptQuestions({
    required String bearerToken,
    required String attemptId,
  }) =>
      _wrap(() => _datasource.getAttemptQuestions(
            bearerToken: bearerToken,
            attemptId: attemptId,
          ));

  @override
  Future<SubmittedAnswer> submitAnswer({
    required String bearerToken,
    required String attemptId,
    required String assessmentQuestionLinkId,
    required String responseValue,
  }) =>
      _wrap(() => _datasource.submitAnswer(
            bearerToken: bearerToken,
            attemptId: attemptId,
            assessmentQuestionLinkId: assessmentQuestionLinkId,
            responseValue: responseValue,
          ));

  @override
  Future<List<int>> getQuestionAudio({
    required String bearerToken,
    required String questionId,
  }) =>
      _wrap(() => _datasource.getQuestionAudio(
            bearerToken: bearerToken,
            questionId: questionId,
          ));

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
