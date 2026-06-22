import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_required_notifier.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

class _FakePlacementRepository implements PlacementRepository {
  final PlacementTestModel? _activeTest;
  final Exception? _error;

  const _FakePlacementRepository({
    PlacementTestModel? activeTest,
    Exception? error,
  })  : _activeTest = activeTest,
        _error = error;

  @override
  Future<PlacementTestModel> getActivePlacementTest(
      String bearerToken) async {
    if (_error != null) throw _error;
    return _activeTest!;
  }

  @override
  Future<List<PlacementSectionModel>> getActiveSections(
          String bearerToken) async =>
      throw UnimplementedError();

  @override
  Future<List<PlacementQuestionModel>> getQuestionsForSection(
    String bearerToken, {
    required String sectionId,
  }) async =>
      throw UnimplementedError();

  @override
  Future<PlacementAttemptModel> startAttempt(
    String bearerToken, {
    required String placementTestId,
  }) async =>
      throw UnimplementedError();

  @override
  Future<PlacementAnswerModel> submitAnswer(
    String bearerToken, {
    required String attemptId,
    required PlacementSubmitAnswerPayload payload,
  }) async =>
      throw UnimplementedError();

  @override
  Future<PlacementAttemptModel> completeAttempt(
    String bearerToken, {
    required String attemptId,
  }) async =>
      throw UnimplementedError();

  @override
  Future<PlacementResultModel> getResult(
    String bearerToken, {
    required String attemptId,
  }) async =>
      throw UnimplementedError();
}

const _activeTestModel = PlacementTestModel(
  id: 'test-uuid-1',
  title: 'English Placement',
  status: 'active',
  totalSections: 3,
  estimatedMinutes: 20,
);

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('PlacementRequiredNotifier', () {
    test('starts in idle state', () {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(activeTest: _activeTestModel),
          ),
        ],
      );
      addTearDown(container.dispose);

      expect(
        container.read(placementRequiredProvider),
        isA<PlacementRequiredIdle>(),
      );
    });

    test('check transitions to Yes when backend returns active test', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(activeTest: _activeTestModel),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementRequiredProvider.notifier)
          .check('bearer-tok');

      final state = container.read(placementRequiredProvider);
      expect(state, isA<PlacementRequiredYes>());
      expect((state as PlacementRequiredYes).testId, 'test-uuid-1');
    });

    test('check transitions to No when backend returns 404', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(
              error: ApiClientException(
                code: 'NOT_FOUND',
                message: 'No active placement test (404)',
                statusCode: 404,
              ),
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementRequiredProvider.notifier)
          .check('bearer-tok');

      expect(
        container.read(placementRequiredProvider),
        isA<PlacementRequiredNo>(),
      );
    });

    test('check transitions to Error on unexpected failure', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(error: Exception('Network timeout')),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementRequiredProvider.notifier)
          .check('bearer-tok');

      expect(
        container.read(placementRequiredProvider),
        isA<PlacementRequiredError>(),
      );
    });

    test('reset returns state to idle', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(activeTest: _activeTestModel),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(placementRequiredProvider.notifier)
          .check('bearer-tok');
      expect(
        container.read(placementRequiredProvider),
        isA<PlacementRequiredYes>(),
      );

      container.read(placementRequiredProvider.notifier).reset();
      expect(
        container.read(placementRequiredProvider),
        isA<PlacementRequiredIdle>(),
      );
    });

    test('check passes through checking state before resolving', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            const _FakePlacementRepository(activeTest: _activeTestModel),
          ),
        ],
      );
      addTearDown(container.dispose);

      final states = <PlacementRequiredState>[];
      container.listen(placementRequiredProvider, (_, next) {
        states.add(next);
      });

      await container
          .read(placementRequiredProvider.notifier)
          .check('bearer-tok');

      expect(states.first, isA<PlacementRequiredChecking>());
      expect(states.last, isA<PlacementRequiredYes>());
    });
  });
}
