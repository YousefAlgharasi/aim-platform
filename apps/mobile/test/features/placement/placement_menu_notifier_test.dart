// PlacementMenuNotifier tests.
//
// Covers the drawer's "Placement Test" menu entry status check:
//   - none/active/submitted/completed states surfaced verbatim from backend
//   - error state on unexpected failure
//   - reset returns to idle

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_menu_notifier.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

class _FakePlacementRepository implements PlacementRepository {
  final PlacementLatestStatusModel? _status;
  final Exception? _error;

  const _FakePlacementRepository({
    PlacementLatestStatusModel? status,
    Exception? error,
  })  : _status = status,
        _error = error;

  @override
  Future<PlacementLatestStatusModel> getLatestStatus(
      String bearerToken) async {
    if (_error != null) throw _error;
    return _status!;
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
  Future<PlacementAttemptModel> completeAttempt(String t,
          {required String attemptId}) async =>
      throw UnimplementedError();

  @override
  Future<PlacementResultModel> getResult(String t,
          {required String attemptId}) async =>
      throw UnimplementedError();

  @override
  Future<List<int>> getQuestionAudio(String t,
          {required String questionId}) async =>
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

const _completedResult = PlacementResultModel(
  id: 'res-1',
  placementAttemptId: 'att-1',
  estimatedLevel: 'intermediate',
  skillMasteryMap: {},
  weaknesses: [],
  initialPathId: null,
  createdAt: '2026-06-01T00:00:00Z',
);

void main() {
  group('PlacementMenuNotifier', () {
    test('starts in idle state', () {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(
              status: PlacementLatestStatusModel(
                status: 'none',
                attemptId: null,
                result: null,
              ),
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      expect(container.read(placementMenuProvider), isA<PlacementMenuIdle>());
    });

    test('check → ready with status "none" when never taken', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(
              status: PlacementLatestStatusModel(
                status: 'none',
                attemptId: null,
                result: null,
              ),
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(placementMenuProvider.notifier).check('tok');

      final state = container.read(placementMenuProvider);
      expect(state, isA<PlacementMenuReady>());
      expect((state as PlacementMenuReady).status, 'none');
      expect(state.result, isNull);
    });

    test('check → ready with status "completed" and the real result',
        () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(
              status: PlacementLatestStatusModel(
                status: 'completed',
                attemptId: 'att-1',
                result: _completedResult,
              ),
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(placementMenuProvider.notifier).check('tok');

      final state = container.read(placementMenuProvider) as PlacementMenuReady;
      expect(state.status, 'completed');
      expect(state.result?.estimatedLevel, 'intermediate');
    });

    test('check → error on unexpected failure', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(error: Exception('Network timeout')),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(placementMenuProvider.notifier).check('tok');

      expect(container.read(placementMenuProvider), isA<PlacementMenuError>());
    });

    test('reset returns state to idle', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(
              status: PlacementLatestStatusModel(
                status: 'none',
                attemptId: null,
                result: null,
              ),
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(placementMenuProvider.notifier).check('tok');
      expect(container.read(placementMenuProvider), isA<PlacementMenuReady>());

      container.read(placementMenuProvider.notifier).reset();
      expect(container.read(placementMenuProvider), isA<PlacementMenuIdle>());
    });
  });
}
