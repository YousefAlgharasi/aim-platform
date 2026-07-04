// Phase 8 — P8-090
// Widget tests for the AI Teacher lesson context header.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/features/ai_teacher/ui/widgets/ai_lesson_context_header.dart';

Widget _wrap(Widget child, {TextDirection dir = TextDirection.ltr}) {
  return MaterialApp(
    theme: AppTheme.light,
    localizationsDelegates: AppLocale.delegates,
    supportedLocales: AppLocale.supportedLocales,
    home: Directionality(
      textDirection: dir,
      child: Scaffold(body: child),
    ),
  );
}

void main() {
  group('AiLessonContextHeader', () {
    testWidgets('renders lesson title and safe context label', (tester) async {
      await tester.pumpWidget(_wrap(
        const AiLessonContextHeader(
          lessonTitle: 'Past tense verbs',
          contextLabel: 'Grammar practice',
        ),
      ));

      expect(find.text('Current lesson'), findsOneWidget);
      expect(find.text('Past tense verbs'), findsOneWidget);
      expect(find.text('Grammar practice'), findsOneWidget);
    });

    testWidgets('omits blank context label', (tester) async {
      await tester.pumpWidget(_wrap(
        const AiLessonContextHeader(
          lessonTitle: 'Reading strategies',
          contextLabel: '   ',
        ),
      ));

      expect(find.text('Reading strategies'), findsOneWidget);
      expect(find.text('   '), findsNothing);
    });

    testWidgets('renders under RTL directionality', (tester) async {
      await tester.pumpWidget(_wrap(
        const AiLessonContextHeader(
          lessonTitle: 'مهارة القراءة',
          contextLabel: 'درس اليوم',
        ),
        dir: TextDirection.rtl,
      ));

      expect(find.text('مهارة القراءة'), findsOneWidget);
      expect(find.text('درس اليوم'), findsOneWidget);
    });
  });
}
