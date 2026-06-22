import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/support/ui/pages/feedback_page.dart';

void main() {
  group('FeedbackPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: FeedbackPage()),
      );
      expect(find.text('Send Feedback'), findsOneWidget);
    });

    testWidgets('shows feedback form fields', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: FeedbackPage()),
      );
      expect(find.text('Category'), findsOneWidget);
      expect(find.text('Rating (optional)'), findsOneWidget);
      expect(find.text('Title'), findsOneWidget);
      expect(find.text('Details'), findsOneWidget);
      expect(find.text('Submit Feedback'), findsOneWidget);
    });

    testWidgets('shows value message', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: FeedbackPage()),
      );
      expect(find.text('We value your feedback'), findsOneWidget);
    });

    testWidgets('shows star rating icons', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: FeedbackPage()),
      );
      // 5 star border icons initially
      expect(find.byIcon(Icons.star_border), findsNWidgets(5));
    });

    testWidgets('validates empty title field', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: FeedbackPage()),
      );

      // Scroll to submit button and tap
      await tester.scrollUntilVisible(
        find.text('Submit Feedback'),
        100,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('Submit Feedback'));
      await tester.pump();

      expect(find.text('Title is required'), findsOneWidget);
      expect(find.text('Details are required'), findsOneWidget);
    });
  });
}
