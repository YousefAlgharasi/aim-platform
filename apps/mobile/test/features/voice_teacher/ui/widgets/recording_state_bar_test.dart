import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/features/voice_teacher/ui/widgets/recording_state_bar.dart';

void main() {
  Future<void> pumpBar(
    WidgetTester tester, {
    RecordingState state = RecordingState.idle,
    String? duration,
    VoidCallback? onStop,
    VoidCallback? onCancel,
    VoidCallback? onSend,
    TextDirection dir = TextDirection.ltr,
  }) {
    return tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Directionality(
          textDirection: dir,
          child: Scaffold(
            body: RecordingStateBar(
              state: state,
              duration: duration,
              onStop: onStop,
              onCancel: onCancel,
              onSend: onSend,
            ),
          ),
        ),
      ),
    );
  }

  testWidgets('idle state renders nothing', (tester) async {
    await pumpBar(tester);

    expect(find.text('Cancel'), findsNothing);
    expect(find.text('Stop'), findsNothing);
  });

  testWidgets('recording state shows duration, cancel, and stop', (tester) async {
    await pumpBar(tester, state: RecordingState.recording, duration: '1:23');

    expect(find.text('1:23'), findsOneWidget);
    expect(find.text('Cancel'), findsOneWidget);
    expect(find.text('Stop'), findsOneWidget);
  });

  testWidgets('stopped state shows discard and send', (tester) async {
    await pumpBar(tester, state: RecordingState.stopped, duration: '0:45');

    expect(find.text('Recorded'), findsOneWidget);
    expect(find.text('Discard'), findsOneWidget);
    expect(find.text('Send'), findsOneWidget);
  });

  testWidgets('RTL shows Arabic labels', (tester) async {
    await pumpBar(tester, state: RecordingState.recording, dir: TextDirection.rtl);

    expect(find.text('إلغاء'), findsOneWidget);
    expect(find.text('إيقاف'), findsOneWidget);
  });

  testWidgets('send callback fires', (tester) async {
    var sent = 0;
    await pumpBar(tester, state: RecordingState.stopped, onSend: () => sent++);

    await tester.tap(find.text('Send'));
    expect(sent, 1);
  });
}
