// Phase 6 — P6-068
// learning_path_notifier_test.dart — unit tests for LearningPathNotifier.
//
// Covers:
//   1. Starts in idle state.
//   2. load → success with all three data sets.
//   3. load → failure on AppException.
//   4. load emits loading before success.
//   5. Empty lists produce LearningPathData.isEmpty == true.
//   6. clear resets to idle.
//   7. refresh reloads data.
//   8. AIM values are stored verbatim (not recomputed by Flutter).

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';
import 'package:aim_mobile/features/learning_path/logic/entity/learning_path_data.dart';
import 'package:aim_mobile/features/learning_path/logic/provider/learning_path_provider.dart';
import 'package:aim_mobile/features/learning_path/logic/repository/learning_path_repository.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

class _FakeLearningPathRepository implements LearningPathRepository {
  final bool shouldFail;
  final bool returnEmpty;

  const _FakeLearningPathRepository({
    this.shouldFail = false,
    this.returnEmpty = false,
  });

  static const _skillStates = [
    LearningPathSkillStateModel(
      topic: 'Grammar',
      band: 'Developing',
      masteryLevel: 'beginner',
      coveragePercent: 35.0,
    ),
  ];

  static const _weaknesses = [
    LearningPathWeaknessRecordModel(
      topic: 'Reading Comprehension',
      severity: 'high',
      recommendedFocus: 'Inference skills',
    ),
  ];

  static const _recommendations = [
    LearningPathRecommendationModel(
      topic: 'Grammar',
      action: 'Complete subject-verb agreement exercises',
      reason: 'Backend-identified recurring error pattern.',
    ),
  ];

  @override
  Future<List<LearningPathSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) async {
    if (shouldFail) {
      throw const AppException(code: 'SERVER_ERROR', message: 'Server error');
    }
    return returnEmpty ? [] : _skillStates;
  }

  @override
  Future<List<LearningPathWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) async {
    if (shouldFail) {
      throw const AppException(code: 'SERVER_ERROR', message: 'Server error');
    }
    return returnEmpty ? [] : _weaknesses;
  }

  @override
  Future<List<LearningPathRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) async {
    if (shouldFail) {
      throw const AppException(code: 'SERVER_ERROR', message: 'Server error');
    }
    return returnEmpty ? [] : _recommendations;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

ProviderContainer _makeContainer({
  bool shouldFail = false,
  bool returnEmpty = false,
}) =>
    ProviderContainer(
      overrides: [
        learningPathRepositoryProvider.overrideWithValue(
          _FakeLearningPathRepository(
            shouldFail: shouldFail,
            returnEmpty: returnEmpty,
          ),
        ),
      ],
    );

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('LearningPathNotifier', () {
    test('starts in idle state', () {
      final c = _makeContainer();
      addTearDown(c.dispose);
      expect(c.read(learningPathProvider), isA<AppAsyncIdle<LearningPathData>>());
    });

    test('load transitions to success with all three data sets', () async {
      final c = _makeContainer();
      addTearDown(c.dispose);

      await c.read(learningPathProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );

      final state = c.read(learningPathProvider);
      expect(state, isA<AppAsyncSuccess<LearningPathData>>());
      final data = (state as AppAsyncSuccess<LearningPathData>).data;
      expect(data.skillStates.length, 1);
      expect(data.weaknessRecords.length, 1);
      expect(data.recommendations.length, 1);
    });

    test('load → failure on AppException', () async {
      final c = _makeContainer(shouldFail: true);
      addTearDown(c.dispose);

      await c.read(learningPathProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );

      final state = c.read(learningPathProvider);
      expect(state, isA<AppAsyncFailure<LearningPathData>>());
      expect((state as AppAsyncFailure<LearningPathData>).code, 'SERVER_ERROR');
    });

    test('load emits loading state before resolving', () async {
      final c = _makeContainer();
      addTearDown(c.dispose);

      final emitted = <AppAsyncState<LearningPathData>>[];
      c.listen(learningPathProvider, (_, next) => emitted.add(next));

      await c.read(learningPathProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );

      expect(emitted.first, isA<AppAsyncLoading<LearningPathData>>());
      expect(emitted.last, isA<AppAsyncSuccess<LearningPathData>>());
    });

    test('empty lists produce LearningPathData.isEmpty == true', () async {
      final c = _makeContainer(returnEmpty: true);
      addTearDown(c.dispose);

      await c.read(learningPathProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );

      final state = c.read(learningPathProvider);
      final data = (state as AppAsyncSuccess<LearningPathData>).data;
      expect(data.isEmpty, isTrue);
    });

    test('clear resets state to idle', () async {
      final c = _makeContainer();
      addTearDown(c.dispose);

      await c.read(learningPathProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );
      expect(c.read(learningPathProvider), isA<AppAsyncSuccess>());

      c.read(learningPathProvider.notifier).clear();
      expect(c.read(learningPathProvider), isA<AppAsyncIdle>());
    });

    test('refresh reloads data successfully', () async {
      final c = _makeContainer();
      addTearDown(c.dispose);

      await c.read(learningPathProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );
      await c.read(learningPathProvider.notifier).refresh(
            bearerToken: 'tok',
            studentId: 'student-1',
          );

      expect(c.read(learningPathProvider), isA<AppAsyncSuccess<LearningPathData>>());
    });

    test('AIM values are stored verbatim — not recomputed by Flutter', () async {
      final c = _makeContainer();
      addTearDown(c.dispose);

      await c.read(learningPathProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );

      final data =
          (c.read(learningPathProvider) as AppAsyncSuccess<LearningPathData>)
              .data;

      // Backend-authoritative values must reach LearningPathData unchanged.
      expect(data.skillStates.first.band, 'Developing');
      expect(data.skillStates.first.masteryLevel, 'beginner');
      expect(data.skillStates.first.coveragePercent, 35.0);
      expect(data.weaknessRecords.first.severity, 'high');
      expect(data.weaknessRecords.first.recommendedFocus, 'Inference skills');
      expect(data.recommendations.first.action,
          'Complete subject-verb agreement exercises');
      expect(data.recommendations.first.reason,
          'Backend-identified recurring error pattern.');
    });
  });
}
