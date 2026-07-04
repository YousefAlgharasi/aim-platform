import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/features/support/ui/pages/feedback_page.dart';

void main() {
  group('FeedbackPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: const FeedbackPage(),
      ),
      );
      expect(find.text('Send feedback'), findsOneWidget);
    });

    testWidgets('shows feedback form fields', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: const FeedbackPage(),
      ),
      );
      expect(find.text('Category'), findsOneWidget);
      expect(find.text('How would you rate AIM?'), findsOneWidget);
      expect(find.text('Title'), findsOneWidget);
      expect(find.text('Your feedback'), findsOneWidget);
      expect(find.text('Submit'), findsOneWidget);
    });

    testWidgets('shows star rating icons', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: const FeedbackPage(),
      ),
      );
      // 5 star border icons initially
      expect(find.byIcon(Icons.star_border), findsNWidgets(5));
    });

    testWidgets('validates empty title field', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: const FeedbackPage(),
      ),
      );

      // Scroll to submit button and tap
      await tester.scrollUntilVisible(
        find.text('Submit'),
        100,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('Submit'));
      await tester.pump();

      expect(find.text('Title is required'), findsOneWidget);
      expect(find.text('Feedback details are required'), findsOneWidget);
    });
  });
}
