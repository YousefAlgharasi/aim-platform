import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

void main() {
  testWidgets('AIMToast.show renders the message in a floating SnackBar',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(
            body: ElevatedButton(
              onPressed: () =>
                  AIMToast.show(context, message: 'Saved successfully'),
              child: const Text('Trigger'),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Trigger'));
    await tester.pump();

    expect(find.text('Saved successfully'), findsOneWidget);
    expect(find.byType(SnackBar), findsOneWidget);
  });

  testWidgets('AIMToast.show hides any currently-showing toast first',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(
            body: Column(
              children: [
                ElevatedButton(
                  onPressed: () =>
                      AIMToast.show(context, message: 'First toast'),
                  child: const Text('First'),
                ),
                ElevatedButton(
                  onPressed: () =>
                      AIMToast.show(context, message: 'Second toast'),
                  child: const Text('Second'),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('First'));
    await tester.pump();
    await tester.tap(find.text('Second'));
    await tester.pump();

    expect(find.text('First toast'), findsNothing);
    expect(find.text('Second toast'), findsOneWidget);
  });
}
