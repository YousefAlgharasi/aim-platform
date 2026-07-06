// PlacementMenuNotifier.
//
// Scope: Drawer "Placement Test" menu entry only.
//
// Responsibility:
//   Call GET /placement/attempts/latest and surface the student's overall
//   placement status so the drawer entry can route to the right place:
//   fresh start, resume, or a completed result + retake option.
//
// The backend is the sole authority on placement status. Flutter never
// infers "already taken" from any locally-cached value.
//
// Security rules:
// - Flutter never calculates placement scores, CEFR levels, mastery, or
//   weakness maps.
// - Bearer token passed in from the provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress
//   dashboard logic.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ── State ─────────────────────────────────────────────────────────────────────

sealed class PlacementMenuState {
  const PlacementMenuState();
}

final class PlacementMenuIdle extends PlacementMenuState {
  const PlacementMenuIdle();
}

final class PlacementMenuLoading extends PlacementMenuState {
  const PlacementMenuLoading();
}

/// Backend-resolved status, verbatim. [result] is only non-null when
/// [status] is 'completed'.
final class PlacementMenuReady extends PlacementMenuState {
  const PlacementMenuReady({
    required this.status,
    required this.attemptId,
    required this.result,
  });

  final String status;
  final String? attemptId;
  final PlacementResultModel? result;
}

final class PlacementMenuError extends PlacementMenuState {
  const PlacementMenuError({required this.message});

  final String message;
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class PlacementMenuNotifier extends StateNotifier<PlacementMenuState> {
  PlacementMenuNotifier({required PlacementRepository repository})
      : _repository = repository,
        super(const PlacementMenuIdle());

  final PlacementRepository _repository;

  Future<void> check(String bearerToken) async {
    state = const PlacementMenuLoading();
    try {
      final status = await _repository.getLatestStatus(bearerToken);
      state = PlacementMenuReady(
        status: status.status,
        attemptId: status.attemptId,
        result: status.result,
      );
    } catch (e) {
      state = PlacementMenuError(message: e.toString());
    }
  }

  void reset() => state = const PlacementMenuIdle();
}
