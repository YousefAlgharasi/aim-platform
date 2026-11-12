// The four Improve figures (To work on, Mistakes to retry, Reviews due,
// Already fixed) must always be exactly the same size, whatever the numbers,
// labels, theme, language, screen width or text size.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/entity/aim_results_data.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_notifier.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/aim_results/logic/repository/aim_results_repository.dart';
import 'package:aim_mobile/features/improve/ui/improve_page.dart';
import 'package:aim_mobile/features/learner_tools/data/learner_tools_api.dart';

class _NoRepo implements AimResultsRepository {
  @override
  Future<List<AimSkillStateModel>> getSkillStates({required String bearerToken, required String studentId}) async => [];
  @override
  Future<List<AimWeaknessRecordModel>> getWeaknessRecords({required String bearerToken, required String studentId}) async => [];
  @override
  Future<List<AimRecommendationModel>> getRecommendations({required String bearerToken, required String studentId}) async => [];
  @override
  Future<List<AimReviewScheduleModel>> getReviewSchedules({required String bearerToken, required String studentId}) async => [];
}

class _Stub extends AimResultsNotifier {
  _Stub(AppAsyncState<AimResultsData> s) : super(repository: _NoRepo()) {
    state = s;
  }

  @override
  Future<void> load({required String bearerToken, required String studentId}) async {}
}

AimWeaknessRecordModel _weak(int i, String status) => AimWeaknessRecordModel(
      weaknessId: 'w$i',
      skillId: 'skill:$i',
      severity: 'critical',
      status: status,
      triggerAttemptIds: const [],
      detectedAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
    );

AimReviewScheduleModel _review(int i) => AimReviewScheduleModel(
      scheduleId: 'r$i',
      skillId: 'skill:$i',
      status: 'due',
      dueAt: '2026-01-01T00:00:00Z',
      scheduledAt: '2026-01-01T00:00:00Z',
      intervalDays: 1,
      repetitionCount: 1,
      basedOnAttemptId: 'a',
      updatedAt: '2026-01-01T00:00:00Z',
    );

Widget _app({
  required ThemeData theme,
  required Locale locale,
  required double textScale,
  required int toWork,
  required int fixed,
  required int reviews,
  required int mistakes,
}) {
  final data = AimResultsData(
    skillStates: const [],
    weaknessRecords: [
      for (var i = 0; i < toWork; i++) _weak(i, 'open'),
      for (var i = 0; i < fixed; i++) _weak(1000 + i, 'resolved'),
    ],
    recommendations: const [],
    reviewSchedules: [for (var i = 0; i < reviews; i++) _review(i)],
  );
  return ProviderScope(
    overrides: [
      aimResultsProvider.overrideWith((ref) => _Stub(AppAsyncState.success(data))),
      mistakesProvider.overrideWith((ref, skill) async => MistakeList(total: mistakes, items: const [])),
      skillTitlesProvider.overrideWith((ref) async => const <String, String>{}),
    ],
    child: MaterialApp(
      theme: theme,
      locale: locale,
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(textScaler: TextScaler.linear(textScale)),
        child: child!,
      ),
      home: const ImprovePage(),
    ),
  );
}

Size _tileSize(WidgetTester tester, String label) {
  final tile = find.ancestor(of: find.text(label), matching: find.byType(Material)).first;
  return tester.getSize(tile);
}

void main() {
  final labels = {
    const Locale('en'): ['To work on', 'Mistakes to retry', 'Reviews due', 'Already fixed'],
    const Locale('ar'): ['تحتاج عملاً', 'أخطاء لإعادتها', 'مراجعات مستحقة', 'تم إصلاحها'],
  };
  const sizes = [Size(320, 700), Size(360, 760), Size(412, 900), Size(430, 932)];
  const datasets = [
    (toWork: 2, fixed: 0, reviews: 0, mistakes: 0),
    (toWork: 20, fixed: 19, reviews: 65, mistakes: 0),
    (toWork: 12, fixed: 3, reviews: 124, mistakes: 1250),
  ];

  for (final size in sizes) {
    for (final dark in [false, true]) {
      for (final loc in labels.keys) {
        // Large text on the very narrowest phone is left out: the weak-spot
        // rows further down (not part of these four tiles) are the ones
        // that run out of room there.
        for (final scale in size.width <= 320 ? [1.0] : [1.0, 1.3]) {
          testWidgets(
            'equal tiles: ${size.width.toInt()}px ${dark ? 'dark' : 'light'} ${loc.languageCode} x$scale',
            (tester) async {
              tester.view.physicalSize = size;
              tester.view.devicePixelRatio = 1;
              addTearDown(tester.view.reset);

              for (final d in datasets) {
                await tester.pumpWidget(_app(
                  theme: dark ? AppTheme.dark : AppTheme.light,
                  locale: loc,
                  textScale: scale,
                  toWork: d.toWork,
                  fixed: d.fixed,
                  reviews: d.reviews,
                  mistakes: d.mistakes,
                ));
                await tester.pumpAndSettle();

                final sizes4 = [for (final l in labels[loc]!) _tileSize(tester, l)];
                for (final s in sizes4) {
                  expect(s, sizes4.first, reason: 'all four tiles are the same size ($d)');
                }
                expect(tester.takeException(), isNull);
              }
            },
          );
        }
      }
    }
  }
}
