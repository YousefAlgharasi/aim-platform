// P10-051: AssessmentRemoteDatasourceImpl — concrete implementation.
// All assessment data fetched from backend APIs only.
// No local scoring, correctness, or deadline computation.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/assessments/data/models/assessment_models.dart';
import 'assessment_remote_datasource.dart';

class AssessmentRemoteDatasourceImpl implements AssessmentRemoteDatasource {
  const AssessmentRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<List<AssessmentListItemModel>> getAssessments({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<List<AssessmentListItemModel>>(
      BackendApiPaths.studentAssessments,
      headers: _auth(bearerToken),
      decodeData: (json) => _decodeList(json, AssessmentListItemModel.fromJson),
    );
    return envelope.data ?? const [];
  }

  @override
  Future<AssessmentListItemModel?> getNextAssessment({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<AssessmentListItemModel?>(
      BackendApiPaths.studentAssessmentNext,
      headers: _auth(bearerToken),
      decodeData: (json) => json == null
          ? null
          : AssessmentListItemModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data;
  }

  @override
  Future<AssessmentDetailModel> getAssessmentDetail({
    required String bearerToken,
    required String assessmentId,
  }) async {
    final envelope = await _apiClient.get<AssessmentDetailModel>(
      BackendApiPaths.studentAssessmentDetail(assessmentId),
      headers: _auth(bearerToken),
      decodeData: (json) =>
          AssessmentDetailModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<ResultHistoryModel> getResultHistory({
    required String bearerToken,
    required String assessmentId,
  }) async {
    final envelope = await _apiClient.get<ResultHistoryModel>(
      BackendApiPaths.studentAssessmentHistory(assessmentId),
      headers: _auth(bearerToken),
      decodeData: (json) =>
          ResultHistoryModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<StudentDeadlinesModel> getDeadlines({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<StudentDeadlinesModel>(
      BackendApiPaths.studentAssessmentDeadlines,
      headers: _auth(bearerToken),
      decodeData: (json) =>
          StudentDeadlinesModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<StartAttemptResultModel> startAttempt({
    required String bearerToken,
    required String assessmentId,
  }) async {
    final envelope = await _apiClient.post<StartAttemptResultModel>(
      BackendApiPaths.studentStartAttempt(assessmentId),
      headers: _auth(bearerToken),
      decodeData: (json) =>
          StartAttemptResultModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<ResumeAttemptResultModel> resumeAttempt({
    required String bearerToken,
    required String attemptId,
  }) async {
    final envelope = await _apiClient.get<ResumeAttemptResultModel>(
      BackendApiPaths.studentResumeAttempt(attemptId),
      headers: _auth(bearerToken),
      decodeData: (json) =>
          ResumeAttemptResultModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<SubmitAttemptResultModel> submitAttempt({
    required String bearerToken,
    required String attemptId,
  }) async {
    final envelope = await _apiClient.post<SubmitAttemptResultModel>(
      BackendApiPaths.studentSubmitAttempt(attemptId),
      headers: _auth(bearerToken),
      decodeData: (json) =>
          SubmitAttemptResultModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<AttemptResultDetailModel> getAttemptResult({
    required String bearerToken,
    required String attemptId,
  }) async {
    final envelope = await _apiClient.get<AttemptResultDetailModel>(
      BackendApiPaths.studentAttemptResult(attemptId),
      headers: _auth(bearerToken),
      decodeData: (json) =>
          AttemptResultDetailModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<List<AttemptQuestionModel>> getAttemptQuestions({
    required String bearerToken,
    required String attemptId,
  }) async {
    final envelope = await _apiClient.get<List<AttemptQuestionModel>>(
      BackendApiPaths.studentAttemptQuestions(attemptId),
      headers: _auth(bearerToken),
      decodeData: (json) => _decodeList(json, AttemptQuestionModel.fromJson),
    );
    return envelope.data ?? const [];
  }

  @override
  Future<SubmittedAnswerModel> submitAnswer({
    required String bearerToken,
    required String attemptId,
    required String assessmentQuestionLinkId,
    required String responseValue,
  }) async {
    final envelope = await _apiClient.post<SubmittedAnswerModel>(
      BackendApiPaths.studentSubmitAnswer(attemptId),
      headers: _auth(bearerToken),
      body: {
        'assessmentQuestionLinkId': assessmentQuestionLinkId,
        'responseValue': responseValue,
      },
      decodeData: (json) =>
          SubmittedAnswerModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  Map<String, String> _auth(String bearerToken) =>
      {'authorization': 'Bearer $bearerToken'};

  List<T> _decodeList<T>(
    Object? json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    if (json is List<dynamic>) {
      return json.whereType<Map<String, dynamic>>().map(fromJson).toList();
    }
    return const [];
  }
}
