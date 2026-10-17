import 'package:aim_mobile/core/logging/app_logger.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
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
  Future<void> completeAttempt(
    String bearerToken, {
    required String attemptId,
  }) async {
    state = const PlacementSubmitLoading();

    if (bearerToken.isEmpty) {
      state = const PlacementSubmitError(
        message: 'No authorization token available.',
        code: 'NO_TOKEN',
      );
      return;
    }

    try {
      await _repository.completeAttempt(bearerToken, attemptId: attemptId);
      state = PlacementSubmitSuccess(attemptId: attemptId);
    } catch (e, st) {
      if (e is ApiClientException &&
          (e.code == 'ATTEMPT_ALREADY_SUBMITTED' || e.statusCode == 409)) {
        AppLogger.i('PlacementSubmitNotifier',
            'Attempt $attemptId already submitted/completed; advancing to result');
        state = PlacementSubmitSuccess(attemptId: attemptId);
        return;
      }

      // If completeAttempt failed (e.g. 500 or timeout), check if the result was already generated
      try {
        await _repository.getResult(bearerToken, attemptId: attemptId);
        AppLogger.i('PlacementSubmitNotifier',
            'Result already exists for attempt $attemptId; advancing to result');
        state = PlacementSubmitSuccess(attemptId: attemptId);
        return;
      } catch (_) {
        // Result not ready yet, continue to error
      }

      AppLogger.e('PlacementSubmitNotifier',
          'Failed to complete placement attempt $attemptId', e, st);
      state = PlacementSubmitError(
        message: e is Exception
            ? e.toString().replaceFirst('Exception: ', '')
            : 'Failed to complete placement attempt.',
        code: 'COMPLETE_FAILED',
      );
    }
  }

  /// Reset to idle so the student can retry after an error.
  void reset() => state = const PlacementSubmitIdle();
}
