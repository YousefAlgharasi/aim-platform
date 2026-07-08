// P10-051: AssessmentRemoteDatasource — abstract interface.
// All data comes from backend APIs. Flutter never computes scoring,
// correctness, deadline status, or attempt eligibility.

import 'package:aim_mobile/features/assessments/data/models/assessment_models.dart';

abstract class AssessmentRemoteDatasource {
  /// GET /student/assessments
  Future<List<AssessmentListItemModel>> getAssessments({
    required String bearerToken,
  });

  /// GET /student/assessments/next
  Future<AssessmentListItemModel?> getNextAssessment({
    required String bearerToken,
  });

  /// GET /student/assessments/:id
  Future<AssessmentDetailModel> getAssessmentDetail({
    required String bearerToken,
    required String assessmentId,
  });

  /// GET /student/assessments/:id/history
  Future<ResultHistoryModel> getResultHistory({
    required String bearerToken,
    required String assessmentId,
  });

  /// GET /student/assessments/deadlines
  Future<StudentDeadlinesModel> getDeadlines({
    required String bearerToken,
  });

  /// POST /student/assessments/:id/attempts
  Future<StartAttemptResultModel> startAttempt({
    required String bearerToken,
    required String assessmentId,
  });

  /// GET /student/assessments/attempts/:attemptId/resume
  Future<ResumeAttemptResultModel> resumeAttempt({
    required String bearerToken,
    required String attemptId,
  });

  /// POST /student/assessments/attempts/:attemptId/submit
  Future<SubmitAttemptResultModel> submitAttempt({
    required String bearerToken,
    required String attemptId,
  });

  /// GET /student/assessments/attempts/:attemptId/result
  Future<AttemptResultDetailModel> getAttemptResult({
    required String bearerToken,
    required String attemptId,
  });
}
