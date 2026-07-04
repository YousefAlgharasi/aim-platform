import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/features/voice_teacher/ui/widgets/voice_feedback_actions.dart';

void main() {
  Future<void> pumpFeedback(
    WidgetTester tester, {
    String messageId = 'msg-1',
    void Function(String, String, String?)? onFeedback,
    TextDirection dir = TextDirection.ltr,
  }) {
    return tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        locale: dir == TextDirection.rtl
            ? const Locale(AppLocale.arabic)
            : const Locale(AppLocale.english),
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: Directionality(
          textDirection: dir,
          child: Scaffold(
            body: VoiceFeedbackActions(
              messageId: messageId,
              onFeedback: onFeedback,
            ),
          ),
        ),
      ),
    );
  }

  testWidgets('shows helpful and not helpful buttons', (tester) async {
    await pumpFeedback(tester);

    expect(find.text('Helpful'), findsOneWidget);
    expect(find.text('Not helpful'), findsOneWidget);
  });

  testWidgets('shows Arabic labels in RTL', (tester) async {
    await pumpFeedback(tester, dir: TextDirection.rtl);

    expect(find.text('مفيد'), findsOneWidget);
    expect(find.text('غير مفيد'), findsOneWidget);
  });

  testWidgets('helpful tap fires callback and shows thanks', (tester) async {
    String? rating;
    await pumpFeedback(tester, onFeedback: (id, r, c) => rating = r);

    await tester.tap(find.text('Helpful'));
    await tester.pump();

    expect(rating, 'helpful');
    expect(find.text('Thanks!'), findsOneWidget);
  });

  testWidgets('not helpful tap shows comment field', (tester) async {
    await pumpFeedback(tester, onFeedback: (_, __, ___) {});

    await tester.tap(find.text('Not helpful'));
    await tester.pump();

    expect(find.byType(TextField), findsOneWidget);
    expect(find.byIcon(Icons.send), findsOneWidget);
  });

  testWidgets('submitting not_helpful fires callback with comment', (tester) async {
    String? rating;
    String? comment;
    await pumpFeedback(
      tester,
      onFeedback: (id, r, c) {
        rating = r;
        comment = c;
      },
    );

    await tester.tap(find.text('Not helpful'));
    await tester.pump();

    await tester.enterText(find.byType(TextField), 'Bad answer');
    await tester.tap(find.byIcon(Icons.send));
    await tester.pump();

    expect(rating, 'not_helpful');
    expect(comment, 'Bad answer');
  });
}
