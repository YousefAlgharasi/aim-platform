// Phase 8 — P8-087
// ai_chat_input_bar_test.dart — widget tests for AiChatInputBar.
//
// Covers:
//   1. Send button is disabled while the input is empty.
//   2. Typing enables the send button, and tapping it invokes onSend.
//   3. isSending disables both the input and the send button.
//   4. Renders without error under RTL directionality.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/ai_teacher/ui/widgets/ai_chat_input_bar.dart';

/// The send button is a private `_SendButton` widget (a bespoke circular
/// gradient button, since `AIMIconButton` has no gradient-fill variant — see
/// `ai_chat_input_bar.dart`'s header comment) and so can't be referenced by
/// type from this test file. It's located instead via the `InkWell` that
/// wraps the send icon, which is how the widget itself implements enabled/
/// disabled state (`onTap: enabled ? onPressed : null`).
Finder _sendButtonInkWell() => find.ancestor(
      of: find.byIcon(Icons.send_rounded),
      matching: find.byType(InkWell),
    );

void main() {
  testWidgets('send button is disabled while input is empty', (tester) async {
    final controller = TextEditingController();
    addTearDown(controller.dispose);

    await tester.pumpAimWidget(
      AiChatInputBar(
        controller: controller,
        isSending: false,
        onSend: () async {},
      ),
    );

    final inkWell = tester.widget<InkWell>(_sendButtonInkWell());
    expect(inkWell.onTap, isNull);
  });

  testWidgets('typing enables the send button and tapping invokes onSend',
      (tester) async {
    final controller = TextEditingController();
    addTearDown(controller.dispose);
    var sent = false;

    await tester.pumpAimWidget(
      AiChatInputBar(
        controller: controller,
        isSending: false,
        onSend: () async => sent = true,
      ),
    );

    await tester.enterText(find.byType(TextField), 'Hello AI');
    await tester.pump();

    final inkWell = tester.widget<InkWell>(_sendButtonInkWell());
    expect(inkWell.onTap, isNotNull);

    await tester.tap(_sendButtonInkWell());
    await tester.pump();

    expect(sent, isTrue);
  });

  testWidgets('isSending disables the input and the send button',
      (tester) async {
    final controller = TextEditingController(text: 'pending text');
    addTearDown(controller.dispose);

    await tester.pumpAimWidget(
      AiChatInputBar(
        controller: controller,
        isSending: true,
        onSend: () async {},
      ),
    );

    final textField = tester.widget<TextField>(find.byType(TextField));
    expect(textField.enabled, isFalse);

    final inkWell = tester.widget<InkWell>(_sendButtonInkWell());
    expect(inkWell.onTap, isNull);
  });

  testWidgets('renders without error under RTL directionality', (tester) async {
    final controller = TextEditingController();
    addTearDown(controller.dispose);

    await tester.pumpAimWidget(
      AiChatInputBar(
        controller: controller,
        isSending: false,
        onSend: () async {},
      ),
      textDirection: TextDirection.rtl,
    );

    expect(find.byType(AiChatInputBar), findsOneWidget);
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
