// Phase 6 — P6-046
// PlacementRequiredNotifier.
//
// Scope: Placement Required State — app-level gate only.
//
// Responsibility:
//   Call GET /placement/active and surface whether the student has an
//   outstanding placement test to complete before accessing regular content.
//
// The backend decides whether a placement test is active and whether this
// student must complete it.  Flutter reads the response and routes accordingly.
// Flutter must NEVER decide locally whether a student requires placement.
//
// Security rules:
// - Flutter never calculates placement scores, CEFR levels, mastery, or
//   weakness maps.
// - Bearer token passed in from the provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress
//   dashboard logic.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ── State ─────────────────────────────────────────────────────────────────────

/// Sealed state for the placement-required check.
sealed class PlacementRequiredState {
  const PlacementRequiredState();
}

/// Check has not started yet.
final class PlacementRequiredIdle extends PlacementRequiredState {
  const PlacementRequiredIdle();
}

/// Check is in progress (network call running).
final class PlacementRequiredChecking extends PlacementRequiredState {
  const PlacementRequiredChecking();
}

/// Backend confirmed an active placement test exists for this student.
/// Student must complete placement before accessing regular content.
final class PlacementRequiredYes extends PlacementRequiredState {
  const PlacementRequiredYes({required this.testId});

  /// The active test ID returned by the backend.
  final String testId;
}

/// Backend indicated no active placement test (student has already
/// completed placement or is not subject to it).
final class PlacementRequiredNo extends PlacementRequiredState {
  const PlacementRequiredNo();
}

/// Network or parsing error during the check.  Callers should not
/// gate access based on errors — fall through to normal content.
final class PlacementRequiredError extends PlacementRequiredState {
  const PlacementRequiredError({required this.message});

  final String message;
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class PlacementRequiredNotifier
    extends StateNotifier<PlacementRequiredState> {
  PlacementRequiredNotifier({required PlacementRepository repository})
      : _repository = repository,
        super(const PlacementRequiredIdle());

  final PlacementRepository _repository;

  /// Calls GET /placement/active with [bearerToken].
  ///
  /// - 200 with a valid test → [PlacementRequiredYes]
  /// - 404 / empty body → [PlacementRequiredNo] (no active test)
  /// - Any error → [PlacementRequiredError] (fall through; do not block)
  ///
  /// The backend determines whether a student must take placement.
  /// Flutter must never decide this locally.
  Future<void> check(String bearerToken) async {
    state = const PlacementRequiredChecking();
    try {
      final test = await _repository.getActivePlacementTest(bearerToken);
      // A returned test ID means the backend has an active test for this student.
      state = PlacementRequiredYes(testId: test.id);
    } catch (e) {
      final message = e.toString();
      // 404 / "no active test" codes indicate placement is not required.
      if (_isNotFound(message)) {
        state = const PlacementRequiredNo();
      } else {
        // Unexpected error — do not block the student.
        state = PlacementRequiredError(message: message);
      }
    }
  }

  /// Resets to idle (e.g. after placement is completed).
  void reset() => state = const PlacementRequiredIdle();

  static bool _isNotFound(String message) {
    final lower = message.toLowerCase();
    return lower.contains('404') ||
        lower.contains('not_found') ||
        lower.contains('no active') ||
        lower.contains('no_active_placement');
  }
}
