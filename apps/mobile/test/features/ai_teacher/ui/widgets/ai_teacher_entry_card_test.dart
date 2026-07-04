import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/features/ai_teacher/ui/widgets/ai_teacher_entry_card.dart';

void main() {
  testWidgets('AiTeacherEntryCard renders title and invokes onTap',
      (tester) async {
    var taps = 0;

    await tester.pumpAimWidget(
      AiTeacherEntryCard(onTap: () => taps += 1),
    );

    expect(find.text('AI Teacher'), findsOneWidget);
    expect(find.byIcon(Icons.auto_awesome_rounded), findsOneWidget);

    await tester.tap(find.byType(AiTeacherEntryCard));
    expect(taps, 1);
  });

  testWidgets('AiTeacherEntryCard remains tappable under RTL',
      (tester) async {
    var taps = 0;

    await tester.pumpAimWidget(
      AiTeacherEntryCard(onTap: () => taps += 1),
      textDirection: TextDirection.rtl,
    );

    expect(find.text('AI Teacher'), findsOneWidget);

    await tester.tap(find.byType(AiTeacherEntryCard));
    expect(taps, 1);
  });
}

extension on WidgetTester {
  Future<void> pumpAimWidget(
    Widget child, {
    TextDirection textDirection = TextDirection.ltr,
  }) {
    return pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: Directionality(
          textDirection: textDirection,
          child: Scaffold(body: Center(child: child)),
        ),
      ),
    );
  }
}
