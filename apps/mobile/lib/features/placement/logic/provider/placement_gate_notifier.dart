import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/placement_gate_done_store.dart';
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
  PlacementGateNotifier({
    required PlacementRepository repository,
    PlacementGateDoneStore doneStore = const PlacementGateDoneStore(),
  })  : _repository = repository,
        _doneStore = doneStore,
        super(const PlacementGateIdle());

  final PlacementRepository _repository;
  final PlacementGateDoneStore _doneStore;

  Future<void> check(String bearerToken) async {
    state = const PlacementGateChecking();
    if (bearerToken.isEmpty) {
      state = const PlacementGateShouldShow();
      return;
    }
    // The backend already released this student from the gate on an earlier
    // launch; it never comes back, so skip the round trip.
    if (await _doneStore.isDone(bearerToken)) {
      state = const PlacementGateHidden();
      return;
    }
    try {
      final result = await _repository.getPlacementDecision(bearerToken);
      if (result.shouldShowGate) {
        state = const PlacementGateShouldShow();
      } else {
        await _doneStore.markDone(bearerToken);
        state = const PlacementGateHidden();
      }
    } catch (_) {
      // Fail open: a transient error must not push a student who already
      // passed the gate back into it. Nothing is remembered, so the next
      // launch asks the backend again.
      state = const PlacementGateHidden();
    }
  }

  Future<void> choose(String bearerToken, String decision) async {
    state = const PlacementGateChecking();
    if (bearerToken.isEmpty) {
      state = PlacementGateDecided(decision: decision);
      return;
    }
    try {
      final result = await _repository.setPlacementDecision(
        bearerToken,
        decision: decision,
      );
      await _doneStore.markDone(bearerToken);
      state = PlacementGateDecided(decision: result.decision ?? decision);
    } catch (_) {
      state = PlacementGateDecided(decision: decision);
    }
  }
}
