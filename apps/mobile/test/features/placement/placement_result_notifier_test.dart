// Phase 6 — P6-056
// PlacementResultNotifier tests.
//
// Scope: Placement Test phase only — result page state machine.
//
// Coverage:
//   - loadResult: idle → loading → ready with the backend result, verbatim
//   - loadResult: backend "not ready yet" response → Pending(attempt: 1)
//     (the retry timer itself is not exercised here — see note below)
//   - loadResult: non-retryable backend failure → immediate error
//   - dispose: cancels any in-flight poll timer cleanly (no crash)
//
// Note on polling: PlacementResultNotifier schedules a real Timer for
// retries when the backend reports the attempt is still being scored.
// This suite intentionally does not wait out that 2-second interval (which
// would make this suite slow and flaky); it asserts the synchronous Pending
// state transition that happens immediately, then disposes the container so
// PlacementResultNotifier.dispose() cancels the pending timer deterministically.
//
// Security rules verified:
//   - estimatedLevel, signal, and weakness order are taken from the backend
//     response exactly as returned — this notifier performs no calculation,
//     no mapping, and no local scoring of any kind.

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_result_notifier.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

final _resultModel = PlacementResultModel.fromJson({
  'id': 'result-1',
  'placement_attempt_id': 'attempt-1',
  'estimated_level': 'intermediate',
  'skill_mastery_map': {
    'grammar': {
      'total_questions': 10,
      'correct_answers': 7,
      'mastery_score': 0.7,
      'signal': 'developing',
    },
  },
  'weakness_map': {
    'weaknesses': [
      {'skill_code': 'grammar', 'mastery_score': 0.7, 'priority': 1},
    ],
  },
  'initial_path_id': 'path-1',
  'created_at': '2026-06-18T00:00:00Z',
});

class _FakePlacementRepository implements PlacementRepository {
  final PlacementResultModel? _result;
  final Exception? _error;

  _FakePlacementRepository({PlacementResultModel? result, Exception? error})
      : _result = result,
        _error = error;

  @override
  Future<PlacementResultModel> getResult(
    String bearerToken, {
    required String attemptId,
  }) async {
    if (_error != null) throw _error;
    return _result!;
  }

  @override
  Future<PlacementTestModel> getActivePlacementTest(String t) async =>
      throw UnimplementedError();

  @override
  Future<List<int>> getQuestionAudio(String t, {required String questionId}) async =>
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
  Future<PlacementAttemptModel> completeAttempt(String t,
          {required String attemptId}) async =>
      throw UnimplementedError();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('PlacementResultNotifier', () {
    test('starts in idle state', () {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(result: _resultModel),
          ),
        ],
      );
      addTearDown(container.dispose);

      expect(
        container.read(placementResultProvider),
        isA<PlacementResultIdle>(),
      );
    });

    test('loadResult → ready with the backend result, verbatim', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(result: _resultModel),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementResultProvider.notifier)
          .loadResult('tok', attemptId: 'attempt-1');

      final state = container.read(placementResultProvider);
      expect(state, isA<PlacementResultReady>());
      final result = (state as PlacementResultReady).result;

      // Backend authority — Flutter forwards these fields exactly as-is.
      expect(result.estimatedLevel, 'intermediate');
      expect(result.skillMasteryMap['grammar']!.signal, 'developing');
      expect(result.weaknesses.single.skillCode, 'grammar');
      expect(result.weaknesses.single.priority, 1);
      expect(result.initialPathId, 'path-1');
    });

    test('loadResult → Pending(attempt: 1) when backend is still scoring',
        () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(
              error: Exception('RESULT_NOT_FOUND — attempt still processing'),
            ),
          ),
        ],
      );
      // Dispose immediately after assertions so the notifier cancels its
      // scheduled retry timer deterministically — see file header note.
      addTearDown(container.dispose);

      await container
          .read(placementResultProvider.notifier)
          .loadResult('tok', attemptId: 'attempt-1');

      final state = container.read(placementResultProvider);
      expect(state, isA<PlacementResultPending>());
      expect((state as PlacementResultPending).attempt, 1);
    });

    test('loadResult → immediate error for a non-retryable failure',
        () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(
              error: Exception('Unexpected server error'),
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementResultProvider.notifier)
          .loadResult('tok', attemptId: 'attempt-1');

      final state = container.read(placementResultProvider);
      expect(state, isA<PlacementResultError>());
      expect((state as PlacementResultError).code, 'RESULT_LOAD_FAILED');
    });

    test('loadResult passes through loading state before resolving',
        () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(result: _resultModel),
          ),
        ],
      );
      addTearDown(container.dispose);

      final states = <PlacementResultState>[];
      container.listen(placementResultProvider, (_, next) {
        states.add(next);
      });

      await container
          .read(placementResultProvider.notifier)
          .loadResult('tok', attemptId: 'attempt-1');

      expect(states.first, isA<PlacementResultLoading>());
      expect(states.last, isA<PlacementResultReady>());
    });

    test('disposing the container cancels any pending retry timer', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(
              error: Exception('409 — attempt not completed yet'),
            ),
          ),
        ],
      );

      await container
          .read(placementResultProvider.notifier)
          .loadResult('tok', attemptId: 'attempt-1');

      expect(
        container.read(placementResultProvider),
        isA<PlacementResultPending>(),
      );

      // Should not throw even with a poll timer scheduled.
      expect(container.dispose, returnsNormally);
    });
  });
}
