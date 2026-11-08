import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/features/support/data/models/support_models.dart';
import 'package:aim_mobile/features/support/logic/provider/support_provider.dart';
import 'package:aim_mobile/features/support/logic/provider/ticket_list_notifier.dart';
import 'package:aim_mobile/features/support/logic/repository/support_repository.dart';
import 'package:aim_mobile/features/support/ui/pages/help_center_page.dart';

class _NoTicketsRepo implements SupportRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) {
    if (invocation.memberName == #getTickets) {
      return Future<List<SupportTicket>>.value(const []);
    }
    return super.noSuchMethod(invocation);
  }
}

Widget _wrap(Widget child, {Locale locale = const Locale('en')}) {
  return ProviderScope(
    overrides: [
      ticketListProvider.overrideWith(
        (ref) => TicketListNotifier(repository: _NoTicketsRepo()),
      ),
    ],
    child: MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
      home: child,
    ),
  );
}

void main() {
  group('HelpCenterPage (web-style Help & Support)', () {
    testWidgets('shows the title and the two action cards', (tester) async {
      await tester.pumpWidget(_wrap(const HelpCenterPage()));
      await tester.pumpAndSettle();
      expect(find.text('Help & Support'), findsOneWidget);
      expect(find.text('Submit a Ticket'), findsOneWidget);
      expect(find.text('Send Feedback'), findsOneWidget);
    });

    testWidgets('shows My Tickets with an empty state', (tester) async {
      await tester.pumpWidget(_wrap(const HelpCenterPage()));
      await tester.pumpAndSettle();
      expect(find.text('My Tickets'), findsOneWidget);
      expect(find.text('No tickets yet'), findsOneWidget);
    });

    testWidgets('shows the common questions', (tester) async {
      await tester.pumpWidget(_wrap(const HelpCenterPage()));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
        find.text('Technical Issues'),
        200,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('Technical Issues'), findsOneWidget);
      expect(find.text('Common questions'), findsOneWidget);
    });

    testWidgets('renders in Arabic without overflow', (tester) async {
      await tester.pumpWidget(_wrap(const HelpCenterPage(), locale: const Locale('ar')));
      await tester.pumpAndSettle();
      expect(find.text('المساعدة والدعم'), findsOneWidget);
      expect(find.text('أرسل تذكرة'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  });
}
