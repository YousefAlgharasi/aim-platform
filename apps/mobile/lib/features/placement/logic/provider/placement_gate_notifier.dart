// P4-052: PlacementGateNotifier.
//
// Scope: First-login placement gate only.
//
// Responsibility:
//   Calls GET /placement/decision to determine whether the student has
//   never taken a placement test and has no learning progress yet (and so
//   should be offered "Take the placement test" vs "Start from scratch"),
//   and POST /placement/decision to persist their one-time choice.
//
// Security rules:
// - The backend is the sole authority on whether the gate should show —
//   Flutter never decides this from local state alone.
// - Bearer token is passed in from the page; never stored here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

sealed class PlacementGateState {
  const PlacementGateState();
}

final class PlacementGateIdle extends PlacementGateState {
  const PlacementGateIdle();
}

final class PlacementGateChecking extends PlacementGateState {
  const PlacementGateChecking();
}

/// Backend confirmed the gate should be shown.
final class PlacementGateShouldShow extends PlacementGateState {
  const PlacementGateShouldShow();
}

/// Backend confirmed the gate should not be shown (already decided, or
/// placement/progress already exists).
final class PlacementGateHidden extends PlacementGateState {
  const PlacementGateHidden();
}

/// The student just made a choice — carries which one, for navigation.
final class PlacementGateDecided extends PlacementGateState {
  const PlacementGateDecided({required this.decision});
  final String decision;
}

final class PlacementGateError extends PlacementGateState {
  const PlacementGateError({required this.message});
  final String message;
}

class PlacementGateNotifier extends StateNotifier<PlacementGateState> {
  PlacementGateNotifier({required PlacementRepository repository})
      : _repository = repository,
        super(const PlacementGateIdle());

  final PlacementRepository _repository;

  Future<void> check(String bearerToken) async {
    state = const PlacementGateChecking();
    try {
      final result = await _repository.getPlacementDecision(bearerToken);
      state = result.shouldShowGate
          ? const PlacementGateShouldShow()
          : const PlacementGateHidden();
    } catch (e) {
      // Do not block the student on a transient error — treat as hidden.
      state = PlacementGateError(message: e.toString());
    }
  }

  Future<void> choose(String bearerToken, String decision) async {
    try {
      final result = await _repository.setPlacementDecision(
        bearerToken,
        decision: decision,
      );
      state = PlacementGateDecided(decision: result.decision ?? decision);
    } catch (e) {
      state = PlacementGateError(message: e.toString());
    }
  }
}
