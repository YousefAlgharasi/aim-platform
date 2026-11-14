// Grammar / Listening / Reading practice: the skill picker must fit every phone
// width in English and Arabic, light and dark, and show the recommended skill.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/learner_tools/data/learner_tools_api.dart';
import 'package:aim_mobile/features/practice_hub/ui/skill_practice_page.dart';

class _FakeApi extends Fake implements LearnerToolsApi {
  _FakeApi(this.skills);
  final List<PracticeSkill> skills;
  String? askedMode;

  @override
  Future<List<PracticeSkill>> practiceSkills(String mode) async {
    askedMode = mode;
    return skills;
  }
}

const _skills = [
  PracticeSkill(skillKey: 'en.a2.gra.comparatives', title: 'Comparatives', recommended: true, masteryScore: 0.2),
  PracticeSkill(skillKey: 'en.a1.gra.to_be_negative', title: 'To Be: Negative', recommended: false, masteryScore: 0.65),
  PracticeSkill(skillKey: 'en.a1.gra.some_any', title: 'Some / Any', recommended: false),
];

Widget _app(_FakeApi api, {required String mode, required Locale locale, required ThemeData theme, double scale = 1}) {
  return ProviderScope(
    overrides: [learnerToolsApiProvider.overrideWithValue(api)],
    child: MaterialApp(
      theme: theme,
      locale: locale,
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(textScaler: TextScaler.linear(scale)),
        child: child!,
      ),
      home: SkillPracticePage(mode: mode),
    ),
  );
}

void main() {
  group('PracticeSkill', () {
    test('reads the server fields', () {
      final s = PracticeSkill.fromJson({'skillKey': 'k', 'title': 'T', 'recommended': true, 'masteryScore': 0.4});
      expect((s.skillKey, s.title, s.recommended, s.masteryScore), ('k', 'T', true, 0.4));
      expect(PracticeSkill.fromJson({}).recommended, isFalse);
    });
  });

  for (final mode in ['grammar', 'listening', 'reading']) {
    testWidgets('asks the server for the $mode skills', (tester) async {
      final api = _FakeApi(_skills);
      await tester.pumpWidget(_app(api, mode: mode, locale: const Locale('en'), theme: AppTheme.light));
      await tester.pumpAndSettle();
      expect(api.askedMode, mode);
      expect(find.text('Recommended for you'), findsOneWidget);
      expect(find.text('Start practice'), findsOneWidget);
    });
  }

  testWidgets('an unknown mode falls back to grammar', (tester) async {
    final api = _FakeApi(_skills);
    await tester.pumpWidget(_app(api, mode: 'speaking', locale: const Locale('en'), theme: AppTheme.light));
    await tester.pumpAndSettle();
    expect(api.askedMode, 'grammar');
  });

  testWidgets('shows a friendly message when nothing is available', (tester) async {
    await tester.pumpWidget(_app(_FakeApi(const []), mode: 'listening', locale: const Locale('en'), theme: AppTheme.light));
    await tester.pumpAndSettle();
    expect(find.text('No practice is available for this skill area yet'), findsOneWidget);
  });

  for (final size in const [Size(320, 760), Size(360, 800), Size(412, 900)]) {
    for (final dark in [false, true]) {
      for (final loc in const [Locale('en'), Locale('ar')]) {
        for (final scale in size.width <= 320 ? [1.0] : [1.0, 1.3]) {
          testWidgets('picker fits: ${size.width.toInt()}px ${dark ? 'dark' : 'light'} ${loc.languageCode} x$scale', (tester) async {
            tester.view.physicalSize = size;
            tester.view.devicePixelRatio = 1;
            addTearDown(tester.view.reset);
            await tester.pumpWidget(_app(_FakeApi(_skills), mode: 'grammar', locale: loc, theme: dark ? AppTheme.dark : AppTheme.light, scale: scale));
            await tester.pumpAndSettle();
            expect(find.text('Comparatives'), findsWidgets);
            expect(find.text('Some / Any', skipOffstage: false), findsOneWidget);
            expect(tester.takeException(), isNull);
          });
        }
      }
    }
  }
}
