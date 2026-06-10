import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/app/aim_mobile_app.dart';

void main() {
  testWidgets('AIM mobile shell renders placeholder home', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: AimMobileApp(),
      ),
    );

    expect(find.text('AIM Mobile'), findsOneWidget);
    expect(find.text('AIM Flutter Mobile shell is ready.'), findsOneWidget);
  });
}
