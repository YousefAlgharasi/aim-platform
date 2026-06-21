import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';
import 'package:aim_mobile/features/home/logic/entity/home_data.dart';
import 'package:aim_mobile/features/home/logic/provider/home_provider.dart';
import 'package:aim_mobile/features/home/logic/repository/home_repository.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

class _FakeHomeRepository implements HomeRepository {
  final bool shouldFail;
  final bool returnEmpty;

  const _FakeHomeRepository({
    this.shouldFail = false,
    this.returnEmpty = false,
  });

  static const _skillStates = [
    HomeSkillStateModel(
      topic: 'grammar',
      band: 'Proficient',
      masteryLevel: 'intermediate',
    ),
  ];

  static const _weaknesses = [
    HomeWeaknessRecordModel(
      topic: 'reading',
      severity: 'high',
      lastUpdated: '2026-06-18T00:00:00Z',
    ),
  ];

  static const _schedules = [
    HomeReviewScheduleModel(
      topic: 'vocabulary',
      dueAt: '2026-06-19T08:00:00Z',
      priority: 'medium',
    ),
  ];

  static const _recommendations = [
    HomeRecommendationModel(
      topic: 'grammar',
      action: 'practice',
      reason: 'Two missed sessions',
    ),
  ];

  @override
  Future<List<HomeSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) async {
    if (shouldFail) throw const AppException(code: 'SERVER_ERROR', message: 'Error');
    return returnEmpty ? [] : _skillStates;
  }

  @override
  Future<List<HomeWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) async {
    if (shouldFail) throw const AppException(code: 'SERVER_ERROR', message: 'Error');
    return returnEmpty ? [] : _weaknesses;
  }

  @override
  Future<List<HomeReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  }) async {
    if (shouldFail) throw const AppException(code: 'SERVER_ERROR', message: 'Error');
    return returnEmpty ? [] : _schedules;
  }

  @override
  Future<List<HomeRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) async {
    if (shouldFail) throw const AppException(code: 'SERVER_ERROR', message: 'Error');
    return returnEmpty ? [] : _recommendations;
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  ProviderContainer makeContainer({
    bool shouldFail = false,
    bool returnEmpty = false,
  }) =>
      ProviderContainer(
        overrides: [
          homeRepositoryProvider.overrideWithValue(
            _FakeHomeRepository(
              shouldFail: shouldFail,
              returnEmpty: returnEmpty,
            ),
          ),
        ],
      );

  group('HomeNotifier', () {
    test('starts in idle state', () {
      final c = makeContainer();
      addTearDown(c.dispose);
      expect(c.read(homeProvider), isA<AppAsyncIdle<HomeData>>());
    });

    test('load transitions to success with all four data sets', () async {
      final c = makeContainer();
      addTearDown(c.dispose);

      await c.read(homeProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );

      final state = c.read(homeProvider);
      expect(state, isA<AppAsyncSuccess<HomeData>>());
      final data = (state as AppAsyncSuccess<HomeData>).data;
      expect(data.skillStates.length, 1);
      expect(data.skillStates.first.band, 'Proficient');
      expect(data.weaknessRecords.first.severity, 'high');
      expect(data.reviewSchedules.first.priority, 'medium');
      expect(data.recommendations.first.action, 'practice');
    });

    test('load → failure on repository error', () async {
      final c = makeContainer(shouldFail: true);
      addTearDown(c.dispose);

      await c.read(homeProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );

      final state = c.read(homeProvider);
      expect(state, isA<AppAsyncFailure<HomeData>>());
      expect((state as AppAsyncFailure<HomeData>).code, 'SERVER_ERROR');
    });

    test('load emits loading state before resolving', () async {
      final c = makeContainer();
      addTearDown(c.dispose);

      final emitted = <AppAsyncState<HomeData>>[];
      c.listen(homeProvider, (_, next) => emitted.add(next));

      await c.read(homeProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );

      expect(emitted.first, isA<AppAsyncLoading<HomeData>>());
      expect(emitted.last, isA<AppAsyncSuccess<HomeData>>());
    });

    test('empty lists from backend produce HomeData.isEmpty == true', () async {
      final c = makeContainer(returnEmpty: true);
      addTearDown(c.dispose);

      await c.read(homeProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );

      final state = c.read(homeProvider);
      final data = (state as AppAsyncSuccess<HomeData>).data;
      expect(data.isEmpty, isTrue);
    });

    test('clear resets state to idle', () async {
      final c = makeContainer();
      addTearDown(c.dispose);

      await c.read(homeProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );
      expect(c.read(homeProvider), isA<AppAsyncSuccess>());

      c.read(homeProvider.notifier).clear();
      expect(c.read(homeProvider), isA<AppAsyncIdle>());
    });

    test('refresh reloads data', () async {
      final c = makeContainer();
      addTearDown(c.dispose);

      await c.read(homeProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );
      await c.read(homeProvider.notifier).refresh(
            bearerToken: 'tok',
            studentId: 'student-1',
          );

      expect(c.read(homeProvider), isA<AppAsyncSuccess<HomeData>>());
    });

    test('AIM values are never recomputed — stored verbatim from repository',
        () async {
      final c = makeContainer();
      addTearDown(c.dispose);

      await c.read(homeProvider.notifier).load(
            bearerToken: 'tok',
            studentId: 'student-1',
          );

      final data =
          (c.read(homeProvider) as AppAsyncSuccess<HomeData>).data;

      // These backend-authoritative values must reach HomeData unchanged.
      expect(data.skillStates.first.masteryLevel, 'intermediate');
      expect(data.recommendations.first.reason, 'Two missed sessions');
    });
  });
}
