import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/features/support/ui/pages/ticket_list_page.dart';
import 'package:aim_mobile/features/support/ui/pages/create_ticket_page.dart';

void main() {
  group('TicketListPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: const TicketListPage(),
      ),
      );
      expect(find.text('My tickets'), findsOneWidget);
    });

    testWidgets('shows empty state (no live backend to load tickets from)',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: const TicketListPage(),
      ),
      );
      expect(find.text('No Tickets Yet'), findsOneWidget);
    });

    testWidgets('buildEmptyState shows no tickets message', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: AppLocale.delegates,
          supportedLocales: AppLocale.supportedLocales,
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
          localizationsDelegates: AppLocale.delegates,
          supportedLocales: AppLocale.supportedLocales,
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
      expect(find.text('Jan 15, 2026 · technical · high'), findsOneWidget);
    });
  });

  group('CreateTicketPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: const CreateTicketPage(),
      ),
      );
      expect(find.text('New ticket'), findsOneWidget);
    });

    testWidgets('shows form fields', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: const CreateTicketPage(),
      ),
      );
      expect(find.text('Category'), findsOneWidget);
      expect(find.text('Severity'), findsOneWidget);
      expect(find.text('Subject'), findsOneWidget);
      expect(find.text('Description'), findsOneWidget);
      expect(find.text('Submit Ticket'), findsOneWidget);
    });

    testWidgets('validates empty subject field', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: const CreateTicketPage(),
      ),
      );

      // Tap submit without filling fields
      await tester.tap(find.text('Submit Ticket'));
      await tester.pump();

      expect(find.text('Subject is required'), findsOneWidget);
      expect(find.text('Description is required'), findsOneWidget);
    });
  });
}
