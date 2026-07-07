// AIM pipeline live wiring.
// SessionRemoteDatasource — abstract interface.
//
// Scope: Learning-session lifecycle + session question delivery only.
//
// Security rules:
// - studentId is NEVER sent — the backend resolves it from the JWT.
// - sessionId and lessonId are backend-supplied values; never user input.
// - Delivered questions contain no correctness data; the backend strips
//   is_correct before responding.
// - Flutter never calls the AIM Engine or any AI provider.

import 'package:aim_mobile/features/question_answer/data/models/question_model.dart';
import 'package:aim_mobile/features/question_answer/data/models/session_start_response_model.dart';

abstract class SessionRemoteDatasource {
  /// POST /sessions/start — start a learning session for the JWT student.
  Future<SessionStartResponseModel> startSession({
    required String bearerToken,
    required String sessionType,
    List<String> skillFocusIds,
  });

  /// GET /sessions/:sessionId/questions?lessonId= — published questions for
  /// a lesson, delivered to the active session (no correctness data).
  Future<List<QuestionModel>> getLessonQuestions({
    required String bearerToken,
    required String sessionId,
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
  /// listening lesson's spoken-passage asset. Empty bytes means no script
  /// authored yet.
  Future<List<int>> getLessonAssetAudio({
    required String bearerToken,
    required String assetId,
  });
}
