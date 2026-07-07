// Phase 6 — P6-088 / P6-091
// QuestionAnswerRepository — abstract interface (logic layer).
//
// Scope: Question/answer session only.
//
// Security rules:
// - Flutter never calculates correctness, mastery, difficulty, or any
//   AIM-owned value. All values come from the backend verbatim.
// - questionId and sessionId are always backend-supplied values.
// - Bearer token is passed from the provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.

import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';

abstract class QuestionAnswerRepository {
  /// Start a learning session for the JWT student (POST /sessions/start).
  /// The returned session id is backend-issued; Flutter never constructs it.
  Future<SessionStartResponseModel> startSession({
    required String bearerToken,
    required String sessionType,
    List<String> skillFocusIds,
  });

  /// Fetch the published questions delivered for a lesson within the active
  /// session (GET /sessions/:sessionId/questions?lessonId=). No correctness
  /// data is ever present.
  Future<List<QuestionModel>> getLessonQuestions({
    required String bearerToken,
    required String sessionId,
    required String lessonId,
  });

  /// Fetch a student-facing question (no correctness information).
  Future<QuestionModel> getQuestion({
    required String bearerToken,
    required String questionId,
  });

  /// Submit a student attempt and receive a safe backend acknowledgement.
  /// The response never contains is_correct or AIM-owned values.
  Future<AttemptSubmitResponseModel> submitAttempt({
    required String bearerToken,
    required String sessionId,
    required AttemptSubmitRequestModel request,
  });

  /// GET /aim/students/:studentId/sessions/:sessionId/state
  ///
  /// Returns backend-persisted AIM session summary after pipeline runs.
  /// [found] == false when not yet available. Read-only; never mutated.
  Future<SessionFeedbackModel> getSessionState({
    required String bearerToken,
    required String studentId,
    required String sessionId,
  });

  /// POST /lessons/:id/progress — record in-progress percent for a lesson.
  Future<void> recordLessonProgress({
    required String bearerToken,
    required String lessonId,
    required int percent,
  });

  /// POST /lessons/:id/complete — mark the lesson completed. The only
  /// backend call that unlocks the next lesson/course (P20-011/P20-012).
  Future<void> markLessonComplete({
    required String bearerToken,
    required String lessonId,
  });

  /// GET /sessions/questions/:id/audio — synthesized listening audio for a
  /// listening_choice practice question. Empty bytes means no
  /// listening_script authored yet (a real content gap, not an error).
  Future<List<int>> getQuestionAudio({
    required String bearerToken,
    required String questionId,
  });

  /// GET /sessions/lesson-assets/:id/audio — synthesized audio for a
  /// listening lesson's spoken-passage asset.
  Future<List<int>> getLessonAssetAudio({
    required String bearerToken,
    required String assetId,
  });
}
