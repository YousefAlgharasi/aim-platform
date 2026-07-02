// Phase 4 — P4-065
// PlacementStartNotifier.
//
// Scope: Placement Test phase only — start page only.
//
// Responsibilities:
//   1. Load the active placement test via GET /placement/active.
//   2. Load its ordered sections via GET /placement/active/sections (for the
//      "SECTIONS" preview list on the start screen — same endpoint the
//      section page already uses; no new endpoint introduced).
//   3. Start a new attempt via POST /placement/attempts when student taps "Start".
//
// Security rules:
// - Flutter never calculates placement scores, CEFR levels, mastery, or weakness maps.
// - student_id is resolved from the JWT on the backend — never sent here.
// - Bearer token is read from the page via authFlowProvider and passed per-call; never stored.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/models/placement_attempt_model.dart';
import 'package:aim_mobile/features/placement/data/models/placement_section_model.dart';
import 'package:aim_mobile/features/placement/data/models/placement_test_model.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

sealed class PlacementStartState {
  const PlacementStartState();
}

/// Initial — nothing loaded yet.
final class PlacementStartIdle extends PlacementStartState {
  const PlacementStartIdle();
}

/// Loading the active test or starting an attempt.
final class PlacementStartLoading extends PlacementStartState {
  const PlacementStartLoading();
}

/// Active test loaded — ready for the student to start.
final class PlacementStartReady extends PlacementStartState {
  const PlacementStartReady(this.test, this.sections);
  final PlacementTestModel test;

  /// Ordered sections for the "SECTIONS" preview list.
  final List<PlacementSectionModel> sections;
}

/// Attempt started — carries the new attempt for navigation.
final class PlacementStarted extends PlacementStartState {
  const PlacementStarted({required this.attempt, required this.test});
  final PlacementAttemptModel attempt;
  final PlacementTestModel test;
}

/// An error occurred loading the test or starting the attempt.
final class PlacementStartError extends PlacementStartState {
  const PlacementStartError({required this.message, this.code});
  final String message;
  final String? code;
}

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------

class PlacementStartNotifier extends StateNotifier<PlacementStartState> {
  PlacementStartNotifier({required PlacementRepository repository})
      : _repository = repository,
        super(const PlacementStartIdle());

  final PlacementRepository _repository;

  /// Load the currently active placement test and its section list.
  Future<void> loadActivePlacementTest(String bearerToken) async {
    state = const PlacementStartLoading();
    try {
      final results = await Future.wait([
        _repository.getActivePlacementTest(bearerToken),
        _repository.getActiveSections(bearerToken),
      ]);
      final test = results[0] as PlacementTestModel;
      final sections = results[1] as List<PlacementSectionModel>;
      state = PlacementStartReady(test, sections);
    } catch (e) {
      state = PlacementStartError(
        message: e is Exception ? e.toString() : 'Failed to load placement test',
        code: 'PLACEMENT_LOAD_FAILED',
      );
    }
  }

  /// Start a new placement attempt.
  /// Only callable when state is [PlacementStartReady].
  Future<void> startAttempt(String bearerToken) async {
    final current = state;
    if (current is! PlacementStartReady) return;
    final test = current.test;

    state = const PlacementStartLoading();
    try {
      final attempt = await _repository.startAttempt(
        bearerToken,
        placementTestId: test.id,
      );
      state = PlacementStarted(attempt: attempt, test: test);
    } catch (e) {
      state = PlacementStartError(
        message: e is Exception ? e.toString() : 'Failed to start placement',
        code: 'PLACEMENT_START_FAILED',
      );
    }
  }

  void resetToIdle() => state = const PlacementStartIdle();
}
