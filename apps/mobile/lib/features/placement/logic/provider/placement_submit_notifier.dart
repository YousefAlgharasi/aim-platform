// Phase 4 — P4-068
// PlacementSubmitNotifier.
//
// Scope: Placement Test phase only — submit/complete flow only.
//
// Responsibility:
//   Manage the state for the placement submit page:
//   1. Show a confirmation screen after all sections are answered.
//   2. Call POST /placement/attempts/:id/complete to transition the attempt
//      active → submitted on the backend.
//   3. Navigate to the result page (P4-069) once the backend confirms.
//
// Security rules:
// - Flutter NEVER calculates placement score, CEFR level, mastery, or weakness map.
// - The complete endpoint transitions status only; scoring is backend-only (P4-045/046).
// - student_id is JWT-resolved server-side — never sent by Flutter.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// - No secrets, service-role keys, database credentials, or privileged config here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

sealed class PlacementSubmitState {
  const PlacementSubmitState();
}

/// Waiting for the student to confirm submission.
final class PlacementSubmitIdle extends PlacementSubmitState {
  const PlacementSubmitIdle();
}

/// Calling POST /placement/attempts/:id/complete.
final class PlacementSubmitLoading extends PlacementSubmitState {
  const PlacementSubmitLoading();
}

/// Backend confirmed the attempt is submitted — carry attemptId for result page.
final class PlacementSubmitSuccess extends PlacementSubmitState {
  const PlacementSubmitSuccess({required this.attemptId});
  final String attemptId;
}

/// An error occurred calling complete.
final class PlacementSubmitError extends PlacementSubmitState {
  const PlacementSubmitError({required this.message, this.code});
  final String message;
  final String? code;
}

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------

class PlacementSubmitNotifier extends StateNotifier<PlacementSubmitState> {
  PlacementSubmitNotifier({required PlacementRepository repository})
      : _repository = repository,
        super(const PlacementSubmitIdle());

  final PlacementRepository _repository;

  /// Call POST /placement/attempts/:id/complete.
  ///
  /// Transitions the attempt: active → submitted on the backend.
  /// Scoring and result generation are fully server-side (P4-045/046).
  /// Flutter receives no scoring data — only the submission confirmation.
  Future<void> completeAttempt(
    String bearerToken, {
    required String attemptId,
  }) async {
    state = const PlacementSubmitLoading();
    try {
      await _repository.completeAttempt(bearerToken, attemptId: attemptId);
      state = PlacementSubmitSuccess(attemptId: attemptId);
    } catch (e) {
      state = PlacementSubmitError(
        message: e is Exception
            ? e.toString()
            : 'Failed to submit placement test. Please try again.',
        code: 'COMPLETE_FAILED',
      );
    }
  }

  /// Reset to idle so the student can retry after an error.
  void reset() => state = const PlacementSubmitIdle();
}
