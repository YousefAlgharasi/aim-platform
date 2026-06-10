import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/routing/routing.dart';

void main() {
  testWidgets('can navigate between placeholder routes', (tester) async {
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

    expect(find.text('AIM Main Shell'), findsOneWidget);

    await tester.tap(find.text('Home'));
    await tester.pumpAndSettle();

    expect(find.text('AIM Home'), findsOneWidget);
    expect(find.text('Home placeholder'), findsOneWidget);
  });
}
