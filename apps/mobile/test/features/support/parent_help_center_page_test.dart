import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/support/ui/pages/parent_help_center_page.dart';
import 'package:aim_mobile/features/support/ui/pages/parent_ticket_list_page.dart';

void main() {
  group('ParentHelpCenterPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: ParentHelpCenterPage()),
      );
      expect(find.text('Parent Help Center'), findsOneWidget);
    });

    testWidgets('shows parent-specific help categories', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: ParentHelpCenterPage()),
      );
      expect(find.text('Student Progress'), findsOneWidget);
      expect(find.text('Courses & Content'), findsOneWidget);
      expect(find.text('Billing & Payments'), findsOneWidget);
      expect(find.text('Account Management'), findsOneWidget);
      expect(find.text('Privacy & Safety'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('General Help'),
        100,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('General Help'), findsOneWidget);
    });

    testWidgets('shows how can we help text', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: ParentHelpCenterPage()),
      );
      expect(find.text('How can we help you?'), findsOneWidget);
    });

    testWidgets('shows create ticket button', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: ParentHelpCenterPage()),
      );
      expect(find.text('Create Ticket'), findsOneWidget);
      expect(find.byType(FilledButton), findsOneWidget);
    });
  });

  group('ParentTicketListPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: ParentTicketListPage()),
      );
      expect(find.text('My Support Tickets'), findsOneWidget);
    });

    testWidgets('shows loading indicator', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: ParentTicketListPage()),
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('buildEmptyState shows no tickets message', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) =>
                  ParentTicketListPage.buildEmptyState(context),
            ),
          ),
        ),
      );
      await tester.pump();
      expect(find.text('No Support Tickets'), findsOneWidget);
      expect(
        find.text('Create a ticket if you need help with your account.'),
        findsOneWidget,
      );
    });

    testWidgets('buildTicketTile renders ticket info', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => ParentTicketListPage.buildTicketTile(
                context: context,
                ticketId: 'ticket_p001',
                subject: 'Cannot view child progress',
                status: 'open',
                category: 'account',
                severity: 'medium',
                createdAt: DateTime(2026, 1, 20),
              ),
            ),
          ),
        ),
      );
      await tester.pump();
      expect(find.text('Cannot view child progress'), findsOneWidget);
      expect(find.text('account · medium'), findsOneWidget);
    });
  });
}
