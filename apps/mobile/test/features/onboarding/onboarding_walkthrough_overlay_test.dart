import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/features/onboarding/ui/widgets/onboarding_walkthrough_overlay.dart';

Widget _wrap(Widget child) => MaterialApp(
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
      home: child,
    );

void main() {
  testWidgets('shows the welcome slide first, with a Next button', (tester) async {
    var done = false;
    await tester.pumpWidget(
      _wrap(OnboardingWalkthroughOverlay(onDone: () => done = true)),
    );

    expect(find.text('Welcome to AIM'), findsOneWidget);
    expect(find.text('Next'), findsOneWidget);
    expect(done, isFalse);
  });

  testWidgets('tapping Skip calls onDone immediately', (tester) async {
    var done = false;
    await tester.pumpWidget(
      _wrap(OnboardingWalkthroughOverlay(onDone: () => done = true)),
    );

    await tester.tap(find.text('Skip'));
    await tester.pump();

    expect(done, isTrue);
  });

  testWidgets('advancing through all slides ends on Get Started, which calls onDone',
      (tester) async {
    var done = false;
    await tester.pumpWidget(
      _wrap(OnboardingWalkthroughOverlay(onDone: () => done = true)),
    );

    for (var i = 0; i < 3; i++) {
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();
    }

    expect(find.text('Get Started'), findsOneWidget);
    expect(done, isFalse);

    await tester.tap(find.text('Get Started'));
    await tester.pump();

    expect(done, isTrue);
  });
}
