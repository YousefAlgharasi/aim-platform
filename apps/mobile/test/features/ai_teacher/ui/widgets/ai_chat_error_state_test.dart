// Phase 8 — P8-089
// Widget tests for the safe AI Teacher chat error state.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/features/ai_teacher/ui/widgets/ai_chat_error_state.dart';

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
  group('AiChatErrorState', () {
    testWidgets('shows safe generic chat error copy and retry action',
        (tester) async {
      var retryCount = 0;

      await tester.pumpWidget(_wrap(
        AiChatErrorState(onRetry: () => retryCount++),
      ));

      expect(find.text('Something went wrong'), findsOneWidget);
      expect(
        find.text(
          'AI Teacher is temporarily unavailable. Your progress is safe, and you can try again.',
        ),
        findsOneWidget,
      );
      expect(find.text('Retry chat'), findsOneWidget);

      await tester.tap(find.text('Retry chat'));
      await tester.pump();

      expect(retryCount, 1);
    });

    testWidgets('renders safely under RTL directionality', (tester) async {
      await tester.pumpWidget(_wrap(
        const AiChatErrorState(),
        dir: TextDirection.rtl,
      ));

      expect(find.byType(AiChatErrorState), findsOneWidget);
      expect(find.text('Retry chat'), findsNothing);
    });
  });
}
