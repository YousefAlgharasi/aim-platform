import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_start_notifier.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

const _testModel = PlacementTestModel(
  id: 'test-1',
  title: 'English Placement Test',
  status: 'active',
  totalSections: 3,
  estimatedMinutes: 20,
);

const _attemptModel = PlacementAttemptModel(
  id: 'attempt-1',
  placementTestId: 'test-1',
  status: 'active',
  startedAt: '2026-06-18T00:00:00Z',
);

class _FakePlacementRepository implements PlacementRepository {
  final bool _shouldFail;
  const _FakePlacementRepository({bool shouldFail = false})
      : _shouldFail = shouldFail;

  @override
  Future<PlacementTestModel> getActivePlacementTest(String token) async {
    if (_shouldFail) throw Exception('Server error');
    return _testModel;
  }

  @override
  Future<PlacementAttemptModel> startAttempt(String token,
      {String? placementTestId}) async {
    if (_shouldFail) throw Exception('Start failed');
    return _attemptModel;
  }

  @override
  Future<List<PlacementSectionModel>> getActiveSections(String t) async {
    if (_shouldFail) throw Exception('Server error');
    return const [
      PlacementSectionModel(
        id: 'sec-1',
        title: 'Vocabulary',
        skillCode: 'vocabulary',
        orderIndex: 1,
        totalQuestions: 10,
      ),
    ];
  }

  @override
  Future<List<PlacementQuestionModel>> getQuestionsForSection(String t,
          {required String sectionId}) async =>
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
  group('PlacementStartNotifier integration', () {
    test('loadActivePlacementTest → PlacementStartReady with test data',
        () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementStartProvider.notifier)
          .loadActivePlacementTest('tok');

      final state = container.read(placementStartProvider);
      expect(state, isA<PlacementStartReady>());
      expect((state as PlacementStartReady).test.id, 'test-1');
      expect(state.test.totalSections, 3);
    });

    test('startAttempt → PlacementStarted with attempt and test', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(),
          ),
        ],
      );
      addTearDown(container.dispose);

      // Load first so we have a test in state.
      await container
          .read(placementStartProvider.notifier)
          .loadActivePlacementTest('tok');
      await container
          .read(placementStartProvider.notifier)
          .startAttempt('tok');

      final state = container.read(placementStartProvider);
      expect(state, isA<PlacementStarted>());
      final started = state as PlacementStarted;
      expect(started.attempt.id, 'attempt-1');
      expect(started.attempt.status, 'active');
      expect(started.test.id, 'test-1');
    });

    test('startAttempt does nothing when not in ready state', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(),
          ),
        ],
      );
      addTearDown(container.dispose);

      // State is idle — startAttempt should no-op.
      await container
          .read(placementStartProvider.notifier)
          .startAttempt('tok');

      expect(
          container.read(placementStartProvider), isA<PlacementStartIdle>());
    });

    test('loadActivePlacementTest sets error state on failure', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(shouldFail: true),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementStartProvider.notifier)
          .loadActivePlacementTest('tok');

      expect(
          container.read(placementStartProvider), isA<PlacementStartError>());
    });

    test('student_id is never exposed by Flutter (security check)', () async {
      // PlacementAttemptModel has no studentId field at all — even if the
      // backend response includes student_id, Flutter cannot read, store,
      // or forward it. The notifier calls repository.startAttempt(token)
      // only — no student_id is constructed or passed by this layer.
      final attempt = PlacementAttemptModel.fromJson({
        'id': 'a1',
        'placement_test_id': 't1',
        'status': 'active',
        'started_at': '2026-01-01T00:00:00Z',
        // Even if the backend were to include this, Flutter has no field
        // to receive it into.
        'student_id': 'backend-resolved',
      });

      expect(attempt.toJson().containsKey('student_id'), isFalse);
      expect(attempt.toJson().containsKey('studentId'), isFalse);
    });
  });
}
