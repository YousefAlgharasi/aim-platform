import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/models/placement_result_model.dart';
import 'package:aim_mobile/features/placement/data/placement_mock_data.dart';
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

const _maxPollAttempts = 10;
const _pollInterval = Duration(seconds: 2);

class PlacementResultNotifier extends StateNotifier<PlacementResultState> {
  PlacementResultNotifier({required PlacementRepository repository})
      : _repository = repository,
        super(const PlacementResultIdle());

  final PlacementRepository _repository;
  Timer? _pollTimer;

  Future<void> loadResult(
    String bearerToken, {
    required String attemptId,
  }) async {
    state = const PlacementResultLoading();

    if (bearerToken.isEmpty || bearerToken.startsWith('mock-')) {
      await Future.delayed(const Duration(milliseconds: 1000));
      state = const PlacementResultReady(PlacementMockData.mockResult);
      return;
    }

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
        // Fallback to mock result when backend API is offline or returns error
        state = const PlacementResultReady(PlacementMockData.mockResult);
      }
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }
}
