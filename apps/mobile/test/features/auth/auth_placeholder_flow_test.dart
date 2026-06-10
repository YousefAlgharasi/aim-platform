import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/app/aim_mobile_app.dart';

void main() {
  testWidgets('can complete placeholder auth UI flow', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: AimMobileApp(),
      ),
    );

    expect(find.text('AIM Splash'), findsOneWidget);

    await tester.tap(find.text('Start auth placeholder flow'));
    await tester.pumpAndSettle();

    expect(find.text('AIM Sign In'), findsOneWidget);
    expect(
      find.text(
        'Placeholder auth only. Supabase authentication is not implemented yet.',
      ),
      findsOneWidget,
    );

    await tester.tap(find.text('Continue with placeholder auth'));
    await tester.pumpAndSettle();

    expect(find.text('AIM Home'), findsOneWidget);

    await tester.tap(find.text('Profile').last);
    await tester.pumpAndSettle();

    expect(find.textContaining('learner@example.com'), findsOneWidget);

    await tester.tap(find.text('Sign out placeholder'));
    await tester.pumpAndSettle();

    expect(find.text('AIM Sign In'), findsOneWidget);
  });
}
