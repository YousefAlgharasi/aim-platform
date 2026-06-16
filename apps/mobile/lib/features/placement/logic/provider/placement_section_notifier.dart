// Phase 4 — P4-066
// PlacementSectionNotifier.
//
// Scope: Placement Test phase only — section page only.
//
// Responsibility:
//   Load the ordered list of placement sections for the active test and
//   track which section the student is currently viewing.
//
// Security rules:
// - Flutter never calculates placement scores, CEFR levels, mastery, or
//   weakness maps. All scoring is backend-only.
// - Bearer token is read from authFlowProvider and passed per-call; never stored.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// - No secrets, service-role keys, database credentials, or privileged config here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/models/placement_section_model.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/// State for the placement section page.
sealed class PlacementSectionState {
  const PlacementSectionState();
}

/// Initial — sections not yet loaded.
final class PlacementSectionIdle extends PlacementSectionState {
  const PlacementSectionIdle();
}

/// Loading sections from the backend.
final class PlacementSectionLoading extends PlacementSectionState {
  const PlacementSectionLoading();
}

/// Sections loaded and current section resolved.
final class PlacementSectionReady extends PlacementSectionState {
  const PlacementSectionReady({
    required this.sections,
    required this.currentIndex,
    required this.attemptId,
  });

  /// Ordered list of all sections for the placement test.
  final List<PlacementSectionModel> sections;

  /// 0-based index of the current section being displayed.
  final int currentIndex;

  /// Active attempt ID — passed to the question page.
  final String attemptId;

  /// The section the student is currently viewing.
  PlacementSectionModel get currentSection => sections[currentIndex];

  /// True when all sections have been shown.
  bool get isLastSection => currentIndex >= sections.length - 1;

  /// Total number of sections.
  int get totalSections => sections.length;

  /// 1-based display number for the current section.
  int get displayIndex => currentIndex + 1;
}

/// An error occurred loading sections.
final class PlacementSectionError extends PlacementSectionState {
  const PlacementSectionError({required this.message, this.code});

  final String message;
  final String? code;
}

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------

class PlacementSectionNotifier extends StateNotifier<PlacementSectionState> {
  PlacementSectionNotifier({required PlacementRepository repository})
      : _repository = repository,
        super(const PlacementSectionIdle());

  final PlacementRepository _repository;

  /// Load all sections for the active placement test.
  /// [attemptId] is the active placement attempt created by the start page.
  Future<void> loadSections(
    String bearerToken, {
    required String attemptId,
  }) async {
    state = const PlacementSectionLoading();
    try {
      final sections = await _repository.getActiveSections(bearerToken);

      if (sections.isEmpty) {
        state = const PlacementSectionError(
          message: 'No sections found for this placement test.',
          code: 'NO_SECTIONS',
        );
        return;
      }

      state = PlacementSectionReady(
        sections: sections,
        currentIndex: 0,
        attemptId: attemptId,
      );
    } catch (e) {
      state = PlacementSectionError(
        message: e is Exception
            ? e.toString()
            : 'Failed to load placement sections',
        code: 'SECTIONS_LOAD_FAILED',
      );
    }
  }

  /// Advance to the next section.
  /// Called by the section page after the student has completed the current
  /// section's questions (signalled by the question page via navigation args).
  void advanceToNextSection() {
    final current = state;
    if (current is! PlacementSectionReady) return;
    if (current.isLastSection) return;

    state = PlacementSectionReady(
      sections: current.sections,
      currentIndex: current.currentIndex + 1,
      attemptId: current.attemptId,
    );
  }
}
