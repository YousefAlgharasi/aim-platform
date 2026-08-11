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
    if (bearerToken.isEmpty) {
      state = const PlacementGateShouldShow();
      return;
    }
    try {
      final result = await _repository.getPlacementDecision(bearerToken);
      state = result.shouldShowGate
          ? const PlacementGateShouldShow()
          : const PlacementGateHidden();
    } catch (e) {
      // Do not block the student on a transient error — treat as should show
      state = const PlacementGateShouldShow();
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
      state = PlacementGateDecided(decision: result.decision ?? decision);
    } catch (_) {
      state = PlacementGateDecided(decision: decision);
    }
  }
}
