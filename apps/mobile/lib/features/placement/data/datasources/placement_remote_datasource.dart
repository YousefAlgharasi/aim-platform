// Phase 4 — P4-063
// PlacementRemoteDatasource — abstract interface.
//
// Scope: Placement Test phase only.
// Covers all student-facing placement endpoints from the API map (P4-006):
//   #1  GET  /placement/active                     → active test metadata
//   #2  GET  /placement/active/sections             → sections for active test
//   #3  GET  /placement/questions?sectionId=:id    → questions for a section
//   #4  POST /placement/attempts                   → start an attempt
//   #5  POST /placement/attempts/:id/answers        → submit a single answer
//   #6  POST /placement/attempts/:id/complete       → complete an attempt
//   #7  GET  /placement/attempts/:id/result         → fetch placement result
//
// Security rules:
// - Flutter never calculates placement scores, CEFR levels, mastery, or weakness maps.
// - All scoring and result generation is done exclusively by the backend.
// - Bearer token is passed in from the provider/repository layer — never stored here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.

import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';

abstract class PlacementRemoteDatasource {
  /// Fetch the currently active placement test metadata.
  /// Endpoint #1 — GET /placement/active
  Future<PlacementTestModel> getActivePlacementTest(String bearerToken);

  /// Fetch the ordered list of sections for the active placement test.
  /// Endpoint #2 — GET /placement/active/sections
  Future<List<PlacementSectionModel>> getActiveSections(String bearerToken);

  /// Fetch student-safe questions for a given section.
  /// correct_answer is never included in the response.
  /// Endpoint #3 — GET /placement/questions?sectionId=:id
  Future<List<PlacementQuestionModel>> getQuestionsForSection(
    String bearerToken, {
    required String sectionId,
  });

  /// Start a new placement attempt and return the created attempt.
  /// student_id is resolved from the JWT on the backend — never sent by Flutter.
  /// Endpoint #4 — POST /placement/attempts
  Future<PlacementAttemptModel> startAttempt(
    String bearerToken, {
    required String placementTestId,
  });

  /// Submit a single answer during an active attempt.
  /// is_correct is never evaluated or returned at this stage.
  /// Endpoint #5 — POST /placement/attempts/:id/answers
  Future<PlacementAnswerModel> submitAnswer(
    String bearerToken, {
    required String attemptId,
    required PlacementSubmitAnswerPayload payload,
  });

  /// Signal that the student has finished answering.
  /// Transitions the attempt from active → submitted.
  /// Scoring is triggered server-side only.
  /// Endpoint #6 — POST /placement/attempts/:id/complete
  Future<PlacementAttemptModel> completeAttempt(
    String bearerToken, {
    required String attemptId,
  });

  /// Fetch the student-safe placement result.
  /// Only available after attempt status = completed.
  /// estimatedLevel and skillSummary are backend-computed; Flutter displays as-is.
  /// Endpoint #7 — GET /placement/attempts/:id/result
  Future<PlacementResultModel> getResult(
    String bearerToken, {
    required String attemptId,
  });

  /// Fetch a listening_choice question's synthesized audio bytes.
  /// Returns an empty list when the backend has no listening_script
  /// authored yet (204 No Content) — a real content gap, not an error.
  /// Endpoint — GET /placement/questions/:id/audio
  Future<List<int>> getQuestionAudio(
    String bearerToken, {
    required String questionId,
  });

  /// Fetch the student's overall placement status without requiring a known
  /// attemptId — status is one of 'none'/'active'/'submitted'/'completed'.
  /// Endpoint — GET /placement/attempts/latest
  Future<PlacementLatestStatusModel> getLatestStatus(String bearerToken);

  /// Submit a SPEAKING answer's recorded audio. Transcribed server-side via
  /// the same STT pipeline used for voice teacher, then AI-graded.
  /// Endpoint — POST /placement/attempts/:id/answers/speaking
  Future<PlacementSpeakingAnswerModel> submitSpeakingAnswer(
    String bearerToken, {
    required String attemptId,
    required String questionId,
    required List<int> audioBytes,
    required String mimeType,
  });

  /// First-login placement gate status.
  /// Endpoint — GET /placement/decision
  Future<PlacementDecisionModel> getPlacementDecision(String bearerToken);

  /// Persist the student's one-time first-login placement gate choice.
  /// Endpoint — POST /placement/decision
  Future<PlacementDecisionModel> setPlacementDecision(
    String bearerToken, {
    required String decision,
  });
}
