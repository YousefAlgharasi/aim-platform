// Phase 4 — P4-064
// PlacementRepository — abstract interface (logic layer).
//
// Scope: Placement Test phase only.
//
// Security rules:
// - Flutter never calculates placement scores, CEFR levels, mastery, or weakness maps.
// - All scoring and result generation is done exclusively by the backend.
// - Bearer token is passed in from the provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.

import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';

abstract class PlacementRepository {
  /// Fetch the currently active placement test metadata.
  Future<PlacementTestModel> getActivePlacementTest(String bearerToken);

  /// Fetch the ordered list of sections for the active placement test.
  Future<List<PlacementSectionModel>> getActiveSections(String bearerToken);

  /// Fetch student-safe questions for a given section.
  /// correct_answer is never included in the response.
  Future<List<PlacementQuestionModel>> getQuestionsForSection(
    String bearerToken, {
    required String sectionId,
  });

  /// Start a new placement attempt.
  /// student_id is resolved from the JWT on the backend — never sent by Flutter.
  Future<PlacementAttemptModel> startAttempt(
    String bearerToken, {
    required String placementTestId,
  });

  /// Submit a single answer during an active attempt.
  /// is_correct is never evaluated or returned at this stage.
  Future<PlacementAnswerModel> submitAnswer(
    String bearerToken, {
    required String attemptId,
    required PlacementSubmitAnswerPayload payload,
  });

  /// Signal the student has finished answering.
  /// Transitions attempt active → submitted. Scoring is server-side only.
  Future<PlacementAttemptModel> completeAttempt(
    String bearerToken, {
    required String attemptId,
  });

  /// Fetch the student-safe placement result (available after attempt completion).
  /// estimatedLevel and skillSummary are backend-computed; Flutter displays as-is.
  Future<PlacementResultModel> getResult(
    String bearerToken, {
    required String attemptId,
  });

  /// Fetch a listening_choice question's synthesized audio bytes.
  /// Returns an empty list when no listening_script is authored yet.
  Future<List<int>> getQuestionAudio(
    String bearerToken, {
    required String questionId,
  });

  /// Fetch the student's overall placement status ('none'/'active'/
  /// 'submitted'/'completed') without requiring a known attemptId.
  Future<PlacementLatestStatusModel> getLatestStatus(String bearerToken);
}
