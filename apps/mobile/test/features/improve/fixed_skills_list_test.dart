import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_weakness_record_model.dart';
import 'package:aim_mobile/features/improve/ui/improve_page.dart';

AimWeaknessRecordModel _rec(String id, String skill, String resolvedAt) =>
    AimWeaknessRecordModel(
      weaknessId: id,
      skillId: skill,
      severity: 'developing',
      status: 'resolved',
      triggerAttemptIds: const [],
      detectedAt: '2026-01-01T00:00:00Z',
      updatedAt: resolvedAt,
      resolvedAt: resolvedAt,
    );

const _titles = {
  'en.a1.voc.days': 'Days, Months & Seasons',
  'en.a1.voc.colors': 'Colors & Shapes',
  'en.a1.gra.some_any': 'Some / Any',
};

Widget _app(Widget child, {Locale locale = const Locale('en')}) => MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
      home: Scaffold(body: SingleChildScrollView(child: child)),
    );

void main() {
  test('records for the same skill collapse into one line, newest fixed first', () {
    final items = collapseFixedSkills([
      _rec('1', 'en.a1.voc.days', '2026-03-01T00:00:00Z'),
      _rec('2', 'en.a1.voc.days', '2026-03-05T00:00:00Z'),
      _rec('3', 'en.a1.voc.colors', '2026-03-10T00:00:00Z'),
      _rec('4', 'en.a1.gra.some_any', '2026-02-01T00:00:00Z'),
    ], _titles);

    expect(items.map((i) => i.name).toList(),
        ['Colors & Shapes', 'Days, Months & Seasons', 'Some / Any']);
    expect(items.map((i) => i.count).toList(), [1, 2, 1]);
  });

  testWidgets('shows a few rows, then Show all expands the rest', (tester) async {
    final items = [
      for (var i = 0; i < 8; i++) FixedSkillItem(name: 'Skill $i', count: i == 0 ? 3 : 1),
    ];
    await tester.pumpWidget(_app(FixedSkillsList(items: items)));

    expect(find.text('Skill 0'), findsOneWidget);
    expect(find.text('×3'), findsOneWidget);
    expect(find.text('Skill 4'), findsOneWidget);
    expect(find.text('Skill 5'), findsNothing);
    expect(find.text('Show all (8)'), findsOneWidget);

    await tester.tap(find.text('Show all (8)'));
    await tester.pump();
    expect(find.text('Skill 7'), findsOneWidget);
    expect(find.text('Show less'), findsOneWidget);
  });

  testWidgets('Arabic: RTL, long names wrap without overflow on a narrow phone',
      (tester) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    final items = [
      const FixedSkillItem(
          name: 'أيام الأسبوع والشهور والفصول وما يتعلق بها من مفردات أساسية', count: 2),
      for (var i = 0; i < 6; i++) FixedSkillItem(name: 'مهارة $i', count: 1),
    ];
    await tester.pumpWidget(_app(FixedSkillsList(items: items), locale: const Locale('ar')));

    expect(tester.takeException(), isNull);
    expect(find.text('عرض الكل (7)'), findsOneWidget);
    expect(Directionality.of(tester.element(find.text('مهارة 0'))), TextDirection.rtl);
  });
}
