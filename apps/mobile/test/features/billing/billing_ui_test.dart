import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/billing/ui/pages/pricing_page.dart';
import 'package:aim_mobile/features/billing/ui/pages/subscription_page.dart';
import 'package:aim_mobile/features/billing/ui/pages/invoice_history_page.dart';

void main() {
  group('PricingPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: PricingPage()),
      );
      expect(find.text('Plans & Pricing'), findsOneWidget);
    });
  });

  group('SubscriptionPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: SubscriptionPage()),
      );
      expect(find.text('My Subscription'), findsOneWidget);
    });

    testWidgets('shows current plan card', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: SubscriptionPage()),
      );
      expect(find.text('Current Plan'), findsOneWidget);
      expect(find.text('Change Plan'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);
    });

    testWidgets('buildNoSubscriptionState shows empty state', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SubscriptionPage.buildNoSubscriptionState(
              tester.element(find.byType(Scaffold)),
              onViewPlans: () {},
            ),
          ),
        ),
      );
      await tester.pump();
      expect(find.text('No Active Subscription'), findsOneWidget);
      expect(find.text('View Plans'), findsOneWidget);
    });

    testWidgets('buildEntitlementTile renders granted state', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SubscriptionPage.buildEntitlementTile(
              context: tester.element(find.byType(Scaffold)),
              featureKey: 'ai_teacher',
              granted: true,
              usageText: '50/100 sessions',
            ),
          ),
        ),
      );
      await tester.pump();
      expect(find.text('ai_teacher'), findsOneWidget);
      expect(find.text('50/100 sessions'), findsOneWidget);
    });
  });

  group('InvoiceHistoryPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: InvoiceHistoryPage()),
      );
      expect(find.text('Invoice History'), findsOneWidget);
    });

    testWidgets('buildEmptyState shows no invoices message', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InvoiceHistoryPage.buildEmptyState(
              tester.element(find.byType(Scaffold)),
            ),
          ),
        ),
      );
      await tester.pump();
      expect(find.text('No Invoices Yet'), findsOneWidget);
    });
  });

  group('InvoiceDetailPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: InvoiceDetailPage(invoiceId: 'inv_001'),
        ),
      );
      expect(find.text('Invoice Detail'), findsOneWidget);
    });
  });
}
