// Phase 8 — P8-095
// ai_suggested_prompts_row_test.dart — widget tests for AiSuggestedPromptsRow.
//
// Covers:
//   1. Renders every prompt as a chip and invokes onSelect with its text.
//   2. Disabled state prevents selection.
//   3. Renders without error under RTL directionality.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/features/ai_teacher/ui/widgets/ai_suggested_prompts_row.dart';

void main() {
  testWidgets('renders prompts and invokes onSelect with the tapped prompt',
      (tester) async {
    String? selected;

    await tester.pumpAimWidget(
      AiSuggestedPromptsRow(
        prompts: const ['Prompt one', 'Prompt two'],
        onSelect: (prompt) => selected = prompt,
      ),
    );

    expect(find.text('Prompt one'), findsOneWidget);
    expect(find.text('Prompt two'), findsOneWidget);

    await tester.tap(find.text('Prompt one'));
    expect(selected, 'Prompt one');
  });

  testWidgets('disabled state prevents selection', (tester) async {
    var taps = 0;

    await tester.pumpAimWidget(
      AiSuggestedPromptsRow(
        prompts: const ['Prompt one'],
        disabled: true,
        onSelect: (_) => taps += 1,
      ),
    );

    await tester.tap(find.text('Prompt one'));
    expect(taps, 0);
  });

  testWidgets('renders without error under RTL directionality',
      (tester) async {
    await tester.pumpAimWidget(
      AiSuggestedPromptsRow(
        prompts: const ['Prompt one'],
        onSelect: (_) {},
      ),
      textDirection: TextDirection.rtl,
    );

    expect(find.byType(AiSuggestedPromptsRow), findsOneWidget);
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
        home: Directionality(
          textDirection: textDirection,
          child: Scaffold(body: Center(child: child)),
        ),
      ),
    );
  }
}
