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


double _top(WidgetTester tester, Finder f) => tester.getTopLeft(f.first).dy;

void main() {
  testWidgets('sections follow one clear order, each with the same header',
      (tester) async {
    tester.view.physicalSize = const Size(412, 4000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(_app(
      theme: AppTheme.dark,
      locale: const Locale('en'),
      textScale: 1.0,
      toWork: 4,
      fixed: 3,
      reviews: 2,
      mistakes: 5,
    ));
    await tester.pumpAndSettle();

    // Hero, fix session, then the sections in order (the Reviews due block
    // only shows when the backend has due reviews).
    final order = [
      find.text('Start with this'),
      find.text('5-minute fix session'),
      find.text('Overview'),
      find.text('Skills'),
      find.text('Weak spots'),
      find.text('Already fixed').last,
    ];
    final tops = [for (final f in order) _top(tester, f)];
    for (var i = 1; i < tops.length; i++) {
      expect(tops[i], greaterThan(tops[i - 1]), reason: 'block $i comes after block ${i - 1}');
    }
    expect(tester.takeException(), isNull);
  });

  testWidgets('picking a skill filters the weak spots and offers a way back',
      (tester) async {
    tester.view.physicalSize = const Size(412, 4000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(_app(
      theme: AppTheme.light,
      locale: const Locale('ar'),
      textScale: 1.0,
      toWork: 4,
      fixed: 0,
      reviews: 0,
      mistakes: 0,
    ));
    await tester.pumpAndSettle();

    expect(find.text('كل المهارات'), findsNothing);
    await tester.tap(find.text('المفردات'));
    await tester.pumpAndSettle();
    expect(find.text('كل المهارات'), findsOneWidget);

    await tester.tap(find.text('كل المهارات'));
    await tester.pumpAndSettle();
    expect(find.text('كل المهارات'), findsNothing);
    expect(tester.takeException(), isNull);
  });
}
