// Phase 8 — P8-088
// ai_typing_indicator_test.dart — widget tests for AiTypingIndicator.
//
// Covers:
//   1. Renders with the expected semantics label and aligns to the leading
//      edge, like an ai_teacher message bubble.
//   2. Renders without error under RTL directionality.
//   3. Animates without throwing across several frames.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/features/ai_teacher/ui/widgets/ai_typing_indicator.dart';

void main() {
  testWidgets('renders with the AI Teacher typing semantics label',
      (tester) async {
    await tester.pumpAimWidget(const AiTypingIndicator());
    await tester.pump(const Duration(milliseconds: 100));

    expect(
      find.bySemanticsLabel('AI Teacher is typing'),
      findsOneWidget,
    );

    final row = tester.widget<Row>(find.byType(Row).first);
    expect(row.mainAxisAlignment, MainAxisAlignment.start);
  });

  testWidgets('renders without error under RTL directionality',
      (tester) async {
    await tester.pumpAimWidget(
      const AiTypingIndicator(),
      textDirection: TextDirection.rtl,
    );
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.byType(AiTypingIndicator), findsOneWidget);
  });

  testWidgets('animates across several frames without throwing',
      (tester) async {
    await tester.pumpAimWidget(const AiTypingIndicator());

    for (var i = 0; i < 5; i++) {
      await tester.pump(const Duration(milliseconds: 200));
    }

    expect(find.byType(AiTypingIndicator), findsOneWidget);
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
