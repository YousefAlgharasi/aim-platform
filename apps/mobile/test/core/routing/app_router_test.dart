import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/routing/routing.dart';

void main() {
  testWidgets('can navigate from splash to sign-in and main shell placeholder', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        initialRoute: AppRoutePaths.splash,
        onGenerateRoute: AppRouter.onGenerateRoute,
      ),
    );

    expect(find.text('AIM Splash'), findsOneWidget);

    await tester.tap(find.text('Go to sign in'));
    await tester.pumpAndSettle();

    expect(find.text('AIM Sign In'), findsOneWidget);

    await tester.tap(find.text('Continue to main shell'));
    await tester.pumpAndSettle();

    expect(find.text('AIM Home'), findsOneWidget);
    expect(find.text('Home'), findsWidgets);
    expect(find.text('Learn'), findsWidgets);
    expect(find.text('Review'), findsWidgets);
    expect(find.text('Progress'), findsWidgets);
    expect(find.text('Profile'), findsWidgets);
  });
}
