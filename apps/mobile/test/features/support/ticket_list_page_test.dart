import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/support/data/models/support_models.dart';
import 'package:aim_mobile/features/support/logic/provider/support_provider.dart';
import 'package:aim_mobile/features/support/logic/repository/support_repository.dart';
import 'package:aim_mobile/features/support/ui/pages/ticket_list_page.dart';
import 'package:aim_mobile/features/support/ui/pages/create_ticket_page.dart';

class _FakeSupportRepository implements SupportRepository {
  _FakeSupportRepository({this.tickets = const []});

  final List<SupportTicket> tickets;

  @override
  Future<List<SupportTicket>> getTickets() async => tickets;

  @override
  Future<SupportTicket> getTicket(String ticketId) =>
      throw UnimplementedError();

  @override
  Future<SupportTicket> createTicket({
    required String category,
    required String severity,
    required String subject,
    required String description,
  }) =>
      throw UnimplementedError();

  @override
  Future<List<TicketComment>> getTicketComments(String ticketId) =>
      throw UnimplementedError();

  @override
  Future<TicketComment> addTicketComment({
    required String ticketId,
    required String body,
  }) =>
      throw UnimplementedError();

  @override
  Future<UserFeedback> submitFeedback({
    required String category,
    int? rating,
    required String title,
    required String body,
  }) =>
      throw UnimplementedError();

  @override
  Future<List<ReleaseNote>> getReleaseNotes() => throw UnimplementedError();

  @override
  Future<ReleaseNote> getReleaseNote(String noteId) =>
      throw UnimplementedError();

  @override
  Future<List<OperationalStatus>> getOperationalStatus() =>
      throw UnimplementedError();
}

Widget _wrap(Widget child) {
  return ProviderScope(
    overrides: [
      supportRepositoryProvider.overrideWithValue(_FakeSupportRepository()),
    ],
    child: MaterialApp(home: child),
  );
}

void main() {
  group('TicketListPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(_wrap(const TicketListPage()));
      expect(find.text('My tickets'), findsOneWidget);
    });

    testWidgets('shows empty state when there are no tickets',
        (tester) async {
      await tester.pumpWidget(_wrap(const TicketListPage()));
      await tester.pump();
      expect(find.text('No Tickets Yet'), findsOneWidget);
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
      expect(find.text('Jan 15, 2026 · technical · high'), findsOneWidget);
    });
  });

  group('CreateTicketPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(_wrap(const CreateTicketPage()));
      expect(find.text('New ticket'), findsOneWidget);
    });

    testWidgets('shows form fields', (tester) async {
      await tester.pumpWidget(_wrap(const CreateTicketPage()));
      expect(find.text('Category'), findsOneWidget);
      expect(find.text('Severity'), findsOneWidget);
      expect(find.text('Subject'), findsOneWidget);
      expect(find.text('Description'), findsOneWidget);
      expect(find.text('Submit Ticket'), findsOneWidget);
    });

    testWidgets('validates empty subject field', (tester) async {
      await tester.pumpWidget(_wrap(const CreateTicketPage()));

      // Tap submit without filling fields
      await tester.tap(find.text('Submit Ticket'));
      await tester.pump();

      expect(find.text('Subject is required'), findsOneWidget);
      expect(find.text('Description is required'), findsOneWidget);
    });
  });
}
