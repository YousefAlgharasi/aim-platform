import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/home/ui/widgets/home_widgets.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';

void main() {
  testWidgets('HomePageSkeleton renders shimmer placeholders without crashing',
      (tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: HomePageSkeleton())),
    );

    expect(find.byType(AIMSkeleton), findsWidgets);
    expect(find.byType(CircularProgressIndicator), findsNothing);
  });
}
