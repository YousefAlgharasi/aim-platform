// The Improve page's six group tiles and the Learn / Wait / Retry steps must
// fit on every phone width, in English and Arabic, light and dark, and with
// large text: no overflow, equal tile sizes, and the steps visible.

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

const _skills = {
  'en.a2.gra.comparatives': 'grammar',
  'en.a1.voc.family': 'vocabulary',
  'en.a1.read.simple_sentences': 'reading',
  'en.a1.lis.classroom_commands': 'listening',
  'en.a2.write.simple_messages': 'writing',
  'en.a1.pho.basic_blends': 'speaking',
};

AimWeaknessRecordModel _weak(String skill) => AimWeaknessRecordModel(
      weaknessId: 'w-$skill',
      skillId: skill,
      severity: 'critical',
      status: 'open',
      triggerAttemptIds: const [],
      detectedAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
    );

AimSkillStateModel _state(String skill) => AimSkillStateModel(
      skillId: skill,
      masteryScore: 0.2,
      masteryConfidence: 0.5,
      masteryTrend: 'stable',
      lastAttemptId: 'a',
      lastEvaluatedAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
    );

Widget _app({required ThemeData theme, required Locale locale, required double textScale}) {
  final data = AimResultsData(
    skillStates: [for (final k in _skills.keys) _state(k)],
    weaknessRecords: [for (final k in _skills.keys) _weak(k)],
    recommendations: const [],
    reviewSchedules: const [],
  );
  var i = 0;
  final recovery = [
    for (final e in _skills.entries)
      RecoverySkill(
        skillKey: e.key,
        title: e.key,
        group: e.value,
        openMistakes: 2,
        // The first skill is locked for 2 more days, the rest are ready.
        unlocked: i++ != 0,
        retryAvailableAt: i == 1 ? DateTime.now().add(const Duration(days: 2)) : null,
      ),
  ];
  return ProviderScope(
    overrides: [
      aimResultsProvider.overrideWith((ref) => _Stub(AppAsyncState.success(data))),
      mistakesProvider.overrideWith((ref, skill) async => const MistakeList(total: 0, items: [])),
      skillTitlesProvider.overrideWith((ref) async => const <String, String>{}),
      recoveryProvider.overrideWith((ref) async => recovery),
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

void main() {
  final groupLabels = {
    const Locale('en'): ['Grammar', 'Vocabulary', 'Reading', 'Listening', 'Writing', 'Speaking'],
    const Locale('ar'): ['القواعد', 'المفردات', 'القراءة', 'الاستماع', 'الكتابة', 'المحادثة'],
  };
  const sizes = [Size(320, 760), Size(360, 800), Size(412, 900)];

  for (final size in sizes) {
    for (final dark in [false, true]) {
      for (final loc in groupLabels.keys) {
        for (final scale in size.width <= 320 ? [1.0] : [1.0, 1.3]) {
          testWidgets(
            'groups: ${size.width.toInt()}px ${dark ? 'dark' : 'light'} ${loc.languageCode} x$scale',
            (tester) async {
              tester.view.physicalSize = size;
              tester.view.devicePixelRatio = 1;
              addTearDown(tester.view.reset);

              await tester.pumpWidget(_app(theme: dark ? AppTheme.dark : AppTheme.light, locale: loc, textScale: scale));
              await tester.pumpAndSettle();

              // Six group tiles, all the same size.
              final tiles = <Size>[];
              for (final label in groupLabels[loc]!) {
                final finder = find.text(label, skipOffstage: false);
                expect(finder, findsWidgets, reason: 'group "$label" is shown');
                final tile = find.ancestor(of: finder.first, matching: find.byType(Material));
                tiles.add(tester.getSize(tile.first));
              }
              for (final s in tiles) {
                expect(s, tiles.first, reason: 'all six group tiles are the same size');
              }
              expect(tester.takeException(), isNull);
            },
          );
        }
      }
    }
  }

  for (final loc in groupLabels.keys) {
    for (final size in const [Size(320, 2400), Size(412, 2400)]) {
      testWidgets('open skill card: steps and countdown, ${size.width.toInt()}px ${loc.languageCode}', (tester) async {
        tester.view.physicalSize = size;
        tester.view.devicePixelRatio = 1;
        addTearDown(tester.view.reset);

        await tester.pumpWidget(_app(theme: AppTheme.light, locale: loc, textScale: 1.0));
        await tester.pumpAndSettle();

        // The first skill (grammar) is locked for 2 more days.
        final card = find.text('Comparatives').last;
        await tester.tap(card);
        await tester.pumpAndSettle();

        final en = loc.languageCode == 'en';
        expect(find.textContaining(en ? 'Retry opens in 2 days' : 'بعد 2 أيام', skipOffstage: false), findsOneWidget);
        expect(find.text(en ? '2 · Wait' : '2 · انتظر', skipOffstage: false), findsOneWidget);
        expect(tester.takeException(), isNull);

        // A ready skill offers the retry button instead.
        final ready = find.text('Family');
        await tester.tap(ready);
        await tester.pumpAndSettle();
        expect(find.text(en ? 'Retry now' : 'أعد المحاولة الآن', skipOffstage: false), findsOneWidget);
        expect(tester.takeException(), isNull);
      });
    }
  }
}
