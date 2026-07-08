import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/support/data/models/support_models.dart';
import 'package:aim_mobile/features/support/logic/provider/support_provider.dart';
import 'package:aim_mobile/features/support/logic/repository/support_repository.dart';
import 'package:aim_mobile/features/support/ui/pages/feedback_page.dart';

class _FakeSupportRepository implements SupportRepository {
  @override
  Future<List<SupportTicket>> getTickets() => throw UnimplementedError();

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
  group('FeedbackPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(_wrap(const FeedbackPage()));
      expect(find.text('Send feedback'), findsOneWidget);
    });

    testWidgets('shows feedback form fields', (tester) async {
      await tester.pumpWidget(_wrap(const FeedbackPage()));
      expect(find.text('Category'), findsOneWidget);
      expect(find.text('How would you rate AIM?'), findsOneWidget);
      expect(find.text('Title'), findsOneWidget);
      expect(find.text('Your feedback'), findsOneWidget);
      expect(find.text('Submit'), findsOneWidget);
    });

    testWidgets('shows star rating icons', (tester) async {
      await tester.pumpWidget(_wrap(const FeedbackPage()));
      // 5 star border icons initially
      expect(find.byIcon(Icons.star_border), findsNWidgets(5));
    });

    testWidgets('validates empty title field', (tester) async {
      await tester.pumpWidget(_wrap(const FeedbackPage()));

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
