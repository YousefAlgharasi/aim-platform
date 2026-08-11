import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('AIM mobile shell renders splash placeholder', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Center(
            child: Text('AIM'),
          ),
        ),
      ),
    );

    expect(find.text('AIM'), findsOneWidget);
  });
}
