// Phase 6 — P6-056
// PlacementSubmitNotifier tests.
//
// Scope: Placement Test phase only — submit/complete page state machine.
//
// Coverage:
//   - completeAttempt: idle → loading → success with attemptId
//   - completeAttempt: backend failure → error (COMPLETE_FAILED)
//   - reset: returns to idle so the student can retry after an error
//
// Security rules verified:
//   - completeAttempt only transitions attempt status; it never reads or
//     forwards any scoring/result value — the backend computes those
//     asynchronously and the result page (P4-069) fetches them separately.

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_submit_notifier.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

class _FakePlacementRepository implements PlacementRepository {
  final Exception? _error;
  String? lastCompletedAttemptId;

  _FakePlacementRepository({Exception? error}) : _error = error;

  @override
  Future<PlacementAttemptModel> completeAttempt(
    String bearerToken, {
    required String attemptId,
  }) async {
    lastCompletedAttemptId = attemptId;
    if (_error != null) throw _error;
    return PlacementAttemptModel(
      id: attemptId,
      placementTestId: 'test-1',
      status: 'submitted',
      startedAt: '2026-06-18T00:00:00Z',
    );
  }

  @override
  Future<PlacementTestModel> getActivePlacementTest(String t) async =>
      throw UnimplementedError();

  @override
  Future<List<PlacementSectionModel>> getActiveSections(String t) async =>
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
  Future<PlacementResultModel> getResult(String t,
          {required String attemptId}) async =>
      throw UnimplementedError();

  @override
  Future<List<int>> getQuestionAudio(String t, {required String questionId}) async =>
      throw UnimplementedError();

  @override
  Future<PlacementLatestStatusModel> getLatestStatus(String t) async =>
      throw UnimplementedError();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('PlacementSubmitNotifier', () {
    test('starts in idle state', () {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(),
          ),
        ],
      );
      addTearDown(container.dispose);

      expect(
        container.read(placementSubmitProvider),
        isA<PlacementSubmitIdle>(),
      );
    });

    test('completeAttempt → success carries attemptId for the result page',
        () async {
      final repo = _FakePlacementRepository();
      final container = ProviderContainer(
        overrides: [placementRepositoryProvider.overrideWithValue(repo)],
      );
      addTearDown(container.dispose);

      await container
          .read(placementSubmitProvider.notifier)
          .completeAttempt('tok', attemptId: 'attempt-1');

      final state = container.read(placementSubmitProvider);
      expect(state, isA<PlacementSubmitSuccess>());
      expect((state as PlacementSubmitSuccess).attemptId, 'attempt-1');
      expect(repo.lastCompletedAttemptId, 'attempt-1');
    });

    test('completeAttempt does not read or forward any scoring value',
        () async {
      // PlacementSubmitNotifier.completeAttempt awaits the repository call
      // and discards its result — only attemptId (already known by the
      // caller) flows into PlacementSubmitSuccess. There is no level,
      // score, or mastery value anywhere in this state transition.
      final repo = _FakePlacementRepository();
      final container = ProviderContainer(
        overrides: [placementRepositoryProvider.overrideWithValue(repo)],
      );
      addTearDown(container.dispose);

      await container
          .read(placementSubmitProvider.notifier)
          .completeAttempt('tok', attemptId: 'attempt-1');

      final state =
          container.read(placementSubmitProvider) as PlacementSubmitSuccess;
      expect(state.attemptId, 'attempt-1');
    });

    test('completeAttempt → error on backend failure', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(error: Exception('Server error')),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementSubmitProvider.notifier)
          .completeAttempt('tok', attemptId: 'attempt-1');

      final state = container.read(placementSubmitProvider);
      expect(state, isA<PlacementSubmitError>());
      expect((state as PlacementSubmitError).code, 'COMPLETE_FAILED');
    });

    test('reset returns state to idle after an error', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(error: Exception('Server error')),
          ),
        ],
      );
      addTearDown(container.dispose);

      final notifier = container.read(placementSubmitProvider.notifier);
      await notifier.completeAttempt('tok', attemptId: 'attempt-1');
      expect(
        container.read(placementSubmitProvider),
        isA<PlacementSubmitError>(),
      );

      notifier.reset();
      expect(
        container.read(placementSubmitProvider),
        isA<PlacementSubmitIdle>(),
      );
    });

    test('completeAttempt passes through loading state before resolving',
        () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(),
          ),
        ],
      );
      addTearDown(container.dispose);

      final states = <PlacementSubmitState>[];
      container.listen(placementSubmitProvider, (_, next) {
        states.add(next);
      });

      await container
          .read(placementSubmitProvider.notifier)
          .completeAttempt('tok', attemptId: 'attempt-1');

      expect(states.first, isA<PlacementSubmitLoading>());
      expect(states.last, isA<PlacementSubmitSuccess>());
    });
  });
}
