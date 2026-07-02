// Phase 8 — P8-086
// ai_chat_message_bubble_test.dart — widget tests for AiChatMessageBubble.
//
// Covers:
//   1. Student message renders text and aligns to the trailing edge, with
//      no leading/trailing avatar (design screen 33: plain gradient bubble).
//   2. AI Teacher message renders text, its leading avatar, and aligns to
//      the leading edge.
//   3. RTL layout renders without error.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/features/ai_teacher/data/models/ai_teacher_chat_models.dart';
import 'package:aim_mobile/features/ai_teacher/ui/widgets/ai_chat_message_bubble.dart';

void main() {
  const studentMessage = AiChatMessageModel(
    id: 'm1',
    role: 'student',
    text: 'What is the past tense of go?',
    createdAt: '2025-01-01T00:00:00Z',
  );

  const aiMessage = AiChatMessageModel(
    id: 'm2',
    role: 'ai_teacher',
    text: 'The past tense of "go" is "went".',
    createdAt: '2025-01-01T00:00:01Z',
  );

  testWidgets(
      'renders student message aligned to the trailing edge with no avatar',
      (tester) async {
    await tester.pumpAimWidget(
      const AiChatMessageBubble(message: studentMessage),
    );

    expect(find.text('What is the past tense of go?'), findsOneWidget);
    expect(find.byIcon(Icons.person_outline_rounded), findsNothing);
    expect(find.byIcon(Icons.auto_awesome_rounded), findsNothing);

    final row = tester.widget<Row>(find.byType(Row));
    expect(row.mainAxisAlignment, MainAxisAlignment.end);
  });

  testWidgets('renders AI Teacher message aligned to the leading edge',
      (tester) async {
    await tester.pumpAimWidget(
      const AiChatMessageBubble(message: aiMessage),
    );

    expect(find.text('The past tense of "go" is "went".'), findsOneWidget);
    expect(find.byIcon(Icons.auto_awesome_rounded), findsOneWidget);

    final row = tester.widget<Row>(find.byType(Row));
    expect(row.mainAxisAlignment, MainAxisAlignment.start);
  });

  testWidgets('renders without error under RTL directionality',
      (tester) async {
    await tester.pumpAimWidget(
      const AiChatMessageBubble(message: studentMessage),
      textDirection: TextDirection.rtl,
    );

    expect(find.text('What is the past tense of go?'), findsOneWidget);
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
