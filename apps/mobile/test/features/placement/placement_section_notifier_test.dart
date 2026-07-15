// Phase 6 — P6-056
// PlacementSectionNotifier tests.
//
// Scope: Placement Test phase only — section page state machine.
//
// Coverage:
//   - loadSections: idle → loading → ready with sections + attemptId
//   - loadSections: empty backend list → error (NO_SECTIONS)
//   - loadSections: backend failure → error (SECTIONS_LOAD_FAILED)
//   - advanceToNextSection: increments index until last section
//   - advanceToNextSection: no-ops when not in ready state
//   - currentSection / isLastSection / displayIndex derived getters

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_section_notifier.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

const _sections = [
  PlacementSectionModel(
    id: 'sec-1',
    title: 'Grammar',
    skillCode: 'grammar',
    orderIndex: 1,
    totalQuestions: 5,
  ),
  PlacementSectionModel(
    id: 'sec-2',
    title: 'Vocabulary',
    skillCode: 'vocabulary',
    orderIndex: 2,
    totalQuestions: 5,
  ),
];

class _FakePlacementRepository implements PlacementRepository {
  final List<PlacementSectionModel>? _sections;
  final Exception? _error;

  const _FakePlacementRepository({
    List<PlacementSectionModel>? sections,
    Exception? error,
  })  : _sections = sections,
        _error = error;

  @override
  Future<List<PlacementSectionModel>> getActiveSections(
      String bearerToken) async {
    if (_error != null) throw _error;
    return _sections ?? const [];
  }

  @override
  Future<PlacementTestModel> getActivePlacementTest(String t) async =>
      throw UnimplementedError();

  @override
  Future<List<PlacementQuestionModel>> getQuestionsForSection(String t,
          {required String sectionId}) async =>
      throw UnimplementedError();

  @override
  Future<PlacementAttemptModel> startAttempt(String t,
          {required String placementTestId}) async =>
      throw UnimplementedError();

  @override
  Future<PlacementAnswerModel> submitAnswer(String t,
          {required String attemptId,
          required PlacementSubmitAnswerPayload payload}) async =>
      throw UnimplementedError();

  @override
  Future<PlacementAttemptModel> completeAttempt(String t,
          {required String attemptId}) async =>
      throw UnimplementedError();

  @override
  Future<PlacementResultModel> getResult(String t,
          {required String attemptId}) async =>
      throw UnimplementedError();

  @override
  Future<List<int>> getQuestionAudio(String t, {required String questionId}) async =>
      throw UnimplementedError();

  @override
  Future<PlacementLatestStatusModel> getLatestStatus(String t) async =>
      throw UnimplementedError();

  @override
  Future<PlacementSpeakingAnswerModel> submitSpeakingAnswer(
    String bearerToken, {
    required String attemptId,
    required String questionId,
    required List<int> audioBytes,
    required String mimeType,
  }) async =>
      throw UnimplementedError();

  @override
  Future<PlacementDecisionModel> getPlacementDecision(String bearerToken) async =>
      throw UnimplementedError();

  @override
  Future<PlacementDecisionModel> setPlacementDecision(
    String bearerToken, {
    required String decision,
  }) async =>
      throw UnimplementedError();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('PlacementSectionNotifier', () {
    test('starts in idle state', () {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(sections: _sections),
          ),
        ],
      );
      addTearDown(container.dispose);

      expect(
        container.read(placementSectionProvider),
        isA<PlacementSectionIdle>(),
      );
    });

    test('loadSections → ready with sections and attemptId', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(sections: _sections),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementSectionProvider.notifier)
          .loadSections('tok', attemptId: 'attempt-1');

      final state = container.read(placementSectionProvider);
      expect(state, isA<PlacementSectionReady>());
      final ready = state as PlacementSectionReady;
      expect(ready.sections.length, 2);
      expect(ready.attemptId, 'attempt-1');
      expect(ready.currentIndex, 0);
      expect(ready.currentSection.id, 'sec-1');
      expect(ready.isLastSection, isFalse);
      expect(ready.displayIndex, 1);
      expect(ready.totalSections, 2);
    });

    test('loadSections → error when backend returns no sections', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(sections: []),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementSectionProvider.notifier)
          .loadSections('tok', attemptId: 'attempt-1');

      final state = container.read(placementSectionProvider);
      expect(state, isA<PlacementSectionError>());
      expect((state as PlacementSectionError).code, 'NO_SECTIONS');
    });

    test('loadSections → error on backend failure', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(error: Exception('Network down')),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementSectionProvider.notifier)
          .loadSections('tok', attemptId: 'attempt-1');

      final state = container.read(placementSectionProvider);
      expect(state, isA<PlacementSectionError>());
      expect((state as PlacementSectionError).code, 'SECTIONS_LOAD_FAILED');
    });

    test('advanceToNextSection moves to second section', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(sections: _sections),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementSectionProvider.notifier)
          .loadSections('tok', attemptId: 'attempt-1');
      container.read(placementSectionProvider.notifier).advanceToNextSection();

      final state =
          container.read(placementSectionProvider) as PlacementSectionReady;
      expect(state.currentIndex, 1);
      expect(state.currentSection.id, 'sec-2');
      expect(state.isLastSection, isTrue);
      expect(state.displayIndex, 2);
    });

    test('advanceToNextSection is a no-op past the last section', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(sections: _sections),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementSectionProvider.notifier)
          .loadSections('tok', attemptId: 'attempt-1');
      final notifier = container.read(placementSectionProvider.notifier);
      notifier.advanceToNextSection();
      notifier.advanceToNextSection(); // already last — should no-op

      final state =
          container.read(placementSectionProvider) as PlacementSectionReady;
      expect(state.currentIndex, 1);
    });

    test('advanceToNextSection is a no-op when not in ready state', () {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(sections: _sections),
          ),
        ],
      );
      addTearDown(container.dispose);

      container.read(placementSectionProvider.notifier).advanceToNextSection();

      expect(
        container.read(placementSectionProvider),
        isA<PlacementSectionIdle>(),
      );
    });
  });
}
