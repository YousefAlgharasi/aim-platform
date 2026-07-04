import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/features/voice_teacher/ui/widgets/voice_error_state.dart';

void main() {
  Future<void> pumpError(
    WidgetTester tester, {
    VoiceErrorType type = VoiceErrorType.networkError,
    String? fallbackText,
    VoidCallback? onRetry,
    VoidCallback? onDismiss,
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
            body: VoiceErrorState(
              errorType: type,
              fallbackText: fallbackText,
              onRetry: onRetry,
              onDismiss: onDismiss,
            ),
          ),
        ),
      ),
    );
  }

  testWidgets('shows network error title and message', (tester) async {
    await pumpError(tester, type: VoiceErrorType.networkError);

    expect(find.text('Connection Error'), findsOneWidget);
    expect(find.text('Check your internet connection and try again'), findsOneWidget);
    expect(find.byIcon(Icons.wifi_off), findsOneWidget);
  });

  testWidgets('shows microphone error in RTL', (tester) async {
    await pumpError(tester, type: VoiceErrorType.microphoneError, dir: TextDirection.rtl);

    expect(find.text('خطأ في الميكروفون'), findsOneWidget);
    expect(find.byIcon(Icons.mic_off), findsOneWidget);
  });

  testWidgets('shows fallback text when provided', (tester) async {
    await pumpError(tester, fallbackText: 'Hello student');

    expect(find.text('Teacher response (text):'), findsOneWidget);
    expect(find.text('Hello student'), findsOneWidget);
  });

  testWidgets('retry button invokes callback', (tester) async {
    var retries = 0;
    await pumpError(tester, onRetry: () => retries++);

    await tester.tap(find.text('Try again'));
    expect(retries, 1);
  });

  testWidgets('dismiss button invokes callback', (tester) async {
    var dismissed = 0;
    await pumpError(tester, onDismiss: () => dismissed++);

    await tester.tap(find.byIcon(Icons.close));
    expect(dismissed, 1);
  });

  testWidgets('hides retry button when onRetry is null', (tester) async {
    await pumpError(tester);

    expect(find.text('Try again'), findsNothing);
  });
}
