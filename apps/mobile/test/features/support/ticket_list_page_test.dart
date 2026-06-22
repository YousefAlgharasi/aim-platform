import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/support/ui/pages/ticket_list_page.dart';
import 'package:aim_mobile/features/support/ui/pages/create_ticket_page.dart';

void main() {
  group('TicketListPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: TicketListPage()),
      );
      expect(find.text('My Tickets'), findsOneWidget);
    });

    testWidgets('shows loading indicator', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: TicketListPage()),
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('buildEmptyState shows no tickets message', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => TicketListPage.buildEmptyState(context),
            ),
          ),
        ),
      );
      await tester.pump();
      expect(find.text('No Tickets Yet'), findsOneWidget);
      expect(
        find.text('Create a ticket to get help from our support team.'),
        findsOneWidget,
      );
    });

    testWidgets('buildTicketTile renders ticket info', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => TicketListPage.buildTicketTile(
                context: context,
                ticketId: 'ticket_001',
                subject: 'Cannot access lesson',
                status: 'open',
                category: 'technical',
                severity: 'high',
                createdAt: DateTime(2026, 1, 15),
              ),
            ),
          ),
        ),
      );
      await tester.pump();
      expect(find.text('Cannot access lesson'), findsOneWidget);
      expect(find.text('technical · high'), findsOneWidget);
    });
  });

  group('CreateTicketPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: CreateTicketPage()),
      );
      expect(find.text('Create Ticket'), findsOneWidget);
    });

    testWidgets('shows form fields', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: CreateTicketPage()),
      );
      expect(find.text('Category'), findsOneWidget);
      expect(find.text('Severity'), findsOneWidget);
      expect(find.text('Subject'), findsOneWidget);
      expect(find.text('Description'), findsOneWidget);
      expect(find.text('Submit Ticket'), findsOneWidget);
    });

    testWidgets('validates empty subject field', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: CreateTicketPage()),
      );

      // Tap submit without filling fields
      await tester.tap(find.text('Submit Ticket'));
      await tester.pump();

      expect(find.text('Subject is required'), findsOneWidget);
      expect(find.text('Description is required'), findsOneWidget);
    });
  });
}
