// Phase 4 — P4-069
// PlacementResultNotifier.
//
// Scope: Placement Test phase only — result page only.
//
// Responsibility:
//   Fetch the student-safe placement result from GET /placement/attempts/:id/result
//   and expose it for display.
//
//   The result is only available after the backend has completed scoring
//   (attempt.status = 'completed'). If the attempt is still processing
//   (status = 'submitted'), this notifier polls with a short delay.
//
// Security rules:
// - Flutter NEVER calculates or infers estimatedLevel, mastery, or weakness map.
// - All fields are displayed exactly as returned by the backend — no processing.
// - correct_answer and is_correct are NEVER in any response Flutter handles.
// - student_id is JWT-resolved server-side — never sent by Flutter.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// - No secrets, service-role keys, database credentials, or privileged config here.

import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/models/placement_result_model.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

sealed class PlacementResultState {
  const PlacementResultState();
}

/// Waiting to fetch the result.
final class PlacementResultIdle extends PlacementResultState {
  const PlacementResultIdle();
}

/// Fetching from the backend (or polling).
final class PlacementResultLoading extends PlacementResultState {
  const PlacementResultLoading();
}

/// Backend is still scoring — polling in progress.
final class PlacementResultPending extends PlacementResultState {
  const PlacementResultPending({this.attempt = 1});
  final int attempt;
}

/// Result loaded and ready to display.
final class PlacementResultReady extends PlacementResultState {
  const PlacementResultReady(this.result);
  final PlacementResultModel result;
}

/// An error occurred fetching the result.
final class PlacementResultError extends PlacementResultState {
  const PlacementResultError({required this.message, this.code});
  final String message;
  final String? code;
}

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------

/// Max polling attempts before giving up.
const _maxPollAttempts = 10;

/// Polling interval — 2 seconds between attempts.
const _pollInterval = Duration(seconds: 2);

class PlacementResultNotifier extends StateNotifier<PlacementResultState> {
  PlacementResultNotifier({required PlacementRepository repository})
      : _repository = repository,
        super(const PlacementResultIdle());

  final PlacementRepository _repository;
  Timer? _pollTimer;

  /// Load the placement result for [attemptId].
  /// Polls if the result is not yet available (attempt still processing).
  Future<void> loadResult(
    String bearerToken, {
    required String attemptId,
  }) async {
    state = const PlacementResultLoading();
    await _fetchWithRetry(bearerToken, attemptId: attemptId, attempt: 1);
  }

  Future<void> _fetchWithRetry(
    String bearerToken, {
    required String attemptId,
    required int attempt,
  }) async {
    try {
      final result = await _repository.getResult(
        bearerToken,
        attemptId: attemptId,
      );
      state = PlacementResultReady(result);
    } catch (e) {
      final message = e.toString();

      // If the result is not ready yet (attempt still submitted/processing),
      // poll up to _maxPollAttempts times.
      final isNotReady = message.contains('ATTEMPT_NOT_COMPLETED') ||
          message.contains('RESULT_NOT_FOUND') ||
          message.contains('409');

      if (isNotReady && attempt < _maxPollAttempts) {
        state = PlacementResultPending(attempt: attempt);
        _pollTimer?.cancel();
        _pollTimer = Timer(_pollInterval, () {
          if (mounted) {
            _fetchWithRetry(
              bearerToken,
              attemptId: attemptId,
              attempt: attempt + 1,
            );
          }
        });
      } else {
        state = PlacementResultError(
          message: attempt >= _maxPollAttempts
              ? 'Results are taking longer than expected. Please try again later.'
              : (e is Exception ? e.toString() : 'Failed to load result'),
          code: 'RESULT_LOAD_FAILED',
        );
      }
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }
}
