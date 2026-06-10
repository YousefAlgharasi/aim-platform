import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';

void main() {
  testWidgets('can navigate from splash to sign-in and main shell placeholder', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          initialRoute: AppRoutePaths.splash,
          onGenerateRoute: AppRouter.onGenerateRoute,
        ),
      ),
    );

    expect(find.text('AIM Splash'), findsOneWidget);

    await tester.tap(find.text('Start auth placeholder flow'));
    await tester.pumpAndSettle();

    expect(find.text('AIM Sign In'), findsOneWidget);

    await tester.tap(find.text('Continue with placeholder auth'));
    await tester.pumpAndSettle();

    expect(find.text('AIM Home'), findsOneWidget);
    expect(find.text('Home'), findsWidgets);
    expect(find.text('Learn'), findsWidgets);
    expect(find.text('Review'), findsWidgets);
    expect(find.text('Progress'), findsWidgets);
    expect(find.text('Profile'), findsWidgets);
  });
}
