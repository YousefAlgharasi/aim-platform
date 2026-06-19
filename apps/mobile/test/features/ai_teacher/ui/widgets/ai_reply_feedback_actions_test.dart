// Phase 8 — P8-095
// ai_reply_feedback_actions_test.dart — widget tests for
// AiReplyFeedbackActions.
//
// Covers:
//   1. Tapping helpful invokes onRate with the wire value "helpful".
//   2. Tapping not-helpful invokes onRate with the wire value "not_helpful".
//   3. A failed onRate reverts the selection so the student can retry.
//   4. Renders without error under RTL directionality.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/ai_teacher/ui/widgets/ai_reply_feedback_actions.dart';

void main() {
  testWidgets('tapping helpful invokes onRate with "helpful"',
      (tester) async {
    String? ratedMessageId;
    String? ratedValue;

    await tester.pumpAimWidget(
      AiReplyFeedbackActions(
        messageId: 'm1',
        onRate: (messageId, rating) async {
          ratedMessageId = messageId;
          ratedValue = rating;
        },
      ),
    );

    await tester.tap(
      find.bySemanticsLabel('Mark AI Teacher reply as helpful'),
    );
    await tester.pump();

    expect(ratedMessageId, 'm1');
    expect(ratedValue, 'helpful');
  });

  testWidgets('tapping not-helpful invokes onRate with "not_helpful"',
      (tester) async {
    String? ratedValue;

    await tester.pumpAimWidget(
      AiReplyFeedbackActions(
        messageId: 'm1',
        onRate: (_, rating) async => ratedValue = rating,
      ),
    );

    await tester.tap(
      find.bySemanticsLabel('Mark AI Teacher reply as not helpful'),
    );
    await tester.pump();

    expect(ratedValue, 'not_helpful');
  });

  testWidgets('a failed submission reverts the selection', (tester) async {
    await tester.pumpAimWidget(
      AiReplyFeedbackActions(
        messageId: 'm1',
        onRate: (_, __) async => throw Exception('network error'),
      ),
    );

    await tester.tap(
      find.bySemanticsLabel('Mark AI Teacher reply as helpful'),
    );
    await tester.pump();

    // Selection reverted: the outlined (unselected) icon is shown again,
    // not the filled (selected) icon, and the buttons are re-enabled.
    expect(find.byIcon(Icons.thumb_up_alt_outlined), findsOneWidget);
    expect(find.byIcon(Icons.thumb_up_alt_rounded), findsNothing);
  });

  testWidgets('renders without error under RTL directionality',
      (tester) async {
    await tester.pumpAimWidget(
      AiReplyFeedbackActions(
        messageId: 'm1',
        onRate: (_, __) async {},
      ),
      textDirection: TextDirection.rtl,
    );

    expect(find.byType(AiReplyFeedbackActions), findsOneWidget);
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
