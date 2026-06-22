import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/support/ui/pages/help_center_page.dart';

void main() {
  group('HelpCenterPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: HelpCenterPage()),
      );
      expect(find.text('Help Center'), findsOneWidget);
    });

    testWidgets('shows help categories', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: HelpCenterPage()),
      );
      expect(find.text('Lessons & Content'), findsOneWidget);
      expect(find.text('Assessments & Grades'), findsOneWidget);
      expect(find.text('Account & Profile'), findsOneWidget);
      expect(find.text('Billing & Subscription'), findsOneWidget);
      expect(find.text('Technical Issues'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('General Help'),
        100,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('General Help'), findsOneWidget);
    });

    testWidgets('shows how can we help text', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: HelpCenterPage()),
      );
      expect(find.text('How can we help you?'), findsOneWidget);
    });

    testWidgets('shows create ticket button', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: HelpCenterPage()),
      );
      expect(find.text('Create Ticket'), findsOneWidget);
      expect(find.byType(FilledButton), findsOneWidget);
    });
  });
}
