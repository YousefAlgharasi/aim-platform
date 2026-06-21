// Phase 18 — P18-068
// ai_safety_block_banner_test.dart — widget test for AiSafetyBlockBanner.
//
// Confirms the banner only ever shows the fixed, student-safe "limited"
// copy and never the raw reason_category taxonomy or any blocked
// message/response content.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/ai_teacher/ui/widgets/ai_safety_block_banner.dart';

void main() {
  testWidgets('renders the fixed safe-limited copy only', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: const Scaffold(body: AiSafetyBlockBanner()),
      ),
    );

    expect(find.text('AI Teacher is limited right now'), findsOneWidget);
    expect(
      find.textContaining(
        'Some responses in this conversation were held back',
      ),
      findsOneWidget,
    );

    for (final forbidden in [
      'reason_category',
      'mastery',
      'level',
      'weakness',
      'difficulty',
      'recommendation',
    ]) {
      expect(find.textContaining(forbidden), findsNothing);
    }
  });
}
