import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/support/data/models/support_models.dart';
import 'package:aim_mobile/features/support/logic/provider/support_provider.dart';
import 'package:aim_mobile/features/support/logic/repository/support_repository.dart';
import 'package:aim_mobile/features/support/ui/pages/parent_help_center_page.dart';
import 'package:aim_mobile/features/support/ui/pages/parent_ticket_list_page.dart';

class _FakeSupportRepository implements SupportRepository {
  @override
  Future<List<SupportTicket>> getTickets() async => const [];

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
  group('ParentHelpCenterPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: ParentHelpCenterPage()),
      );
      expect(find.text('Parent Help'), findsOneWidget);
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

    testWidgets('shows create ticket button', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: ParentHelpCenterPage()),
      );
      expect(find.text('Create Ticket'), findsOneWidget);
      expect(find.byType(AIMGradientButton), findsOneWidget);
    });
  });

  group('ParentTicketListPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(_wrap(const ParentTicketListPage()));
      expect(find.text('Parent tickets'), findsOneWidget);
    });

    testWidgets('shows empty state when there are no tickets',
        (tester) async {
      await tester.pumpWidget(_wrap(const ParentTicketListPage()));
      await tester.pump();
      expect(find.text('No Support Tickets'), findsOneWidget);
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
      expect(find.text('Jan 20, 2026 · account · medium'), findsOneWidget);
    });
  });
}
