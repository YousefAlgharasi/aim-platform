// P10-052: AssessmentRepository — abstract interface (logic layer).
// All assessment data comes from the backend. Flutter never computes
// scoring, correctness, deadline status, or attempt eligibility.

import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';

abstract class AssessmentRepository {
  Future<List<AssessmentListItem>> getAssessments({
    required String bearerToken,
  });

  /// The single "current" assessment for the student — the oldest unlocked,
  /// not-yet-attempted assessment, or null when nothing is currently due.
  Future<AssessmentListItem?> getNextAssessment({
    required String bearerToken,
  });

  Future<AssessmentDetail> getAssessmentDetail({
    required String bearerToken,
    required String assessmentId,
  });

  Future<ResultHistory> getResultHistory({
    required String bearerToken,
    required String assessmentId,
  });

  Future<StudentDeadlines> getDeadlines({
    required String bearerToken,
  });

  Future<StartAttemptResult> startAttempt({
    required String bearerToken,
    required String assessmentId,
  });

  Future<ResumeAttemptResult> resumeAttempt({
    required String bearerToken,
    required String attemptId,
  });

  Future<SubmitAttemptResult> submitAttempt({
    required String bearerToken,
    required String attemptId,
  });

  Future<AttemptResultDetail> getAttemptResult({
    required String bearerToken,
    required String attemptId,
  });

  Future<List<AttemptQuestion>> getAttemptQuestions({
    required String bearerToken,
    required String attemptId,
  });

  Future<SubmittedAnswer> submitAnswer({
    required String bearerToken,
    required String attemptId,
    required String assessmentQuestionLinkId,
    required String responseValue,
  });
}
