import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/billing/data/models/billing_models.dart';
import 'package:aim_mobile/features/billing/logic/provider/billing_provider.dart';
import 'package:aim_mobile/features/billing/logic/repository/billing_repository.dart';
import 'package:aim_mobile/features/billing/ui/pages/pricing_page.dart';
import 'package:aim_mobile/features/billing/ui/pages/subscription_page.dart';
import 'package:aim_mobile/features/billing/ui/pages/invoice_history_page.dart';

class _FakeBillingRepository implements BillingRepository {
  _FakeBillingRepository({
    this.plans = const [],
    this.prices = const [],
    this.subscriptions = const [],
    this.entitlements = const [],
    this.invoices = const [],
  });

  final List<BillingPlanModel> plans;
  final List<BillingPriceModel> prices;
  final List<SubscriptionModel> subscriptions;
  final List<EntitlementModel> entitlements;
  final List<InvoiceModel> invoices;

  @override
  Future<List<BillingPlanModel>> getPlans() async => plans;

  @override
  Future<List<BillingPriceModel>> getPrices() async => prices;

  @override
  Future<CheckoutSessionModel> createCheckoutSession({
    required String priceId,
    required String successUrl,
    required String cancelUrl,
    String? promotionCode,
  }) async =>
      const CheckoutSessionModel(id: 'sess_1', status: 'pending');

  @override
  Future<CheckoutSessionModel> getCheckoutStatus(String sessionId) async =>
      const CheckoutSessionModel(id: 'sess_1', status: 'pending');

  @override
  Future<List<SubscriptionModel>> getSubscriptions() async => subscriptions;

  @override
  Future<SubscriptionModel> cancelSubscription(String subscriptionId) async =>
      subscriptions.first;

  @override
  Future<List<InvoiceModel>> getInvoices() async => invoices;

  @override
  Future<List<EntitlementModel>> getEntitlements() async => entitlements;
}

Widget _wrap(Widget child, {BillingRepository? repository}) {
  return ProviderScope(
    overrides: [
      if (repository != null)
        billingRepositoryProvider.overrideWithValue(repository),
    ],
    child: MaterialApp(home: child),
  );
}

void main() {
  group('PricingPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(_wrap(
        const PricingPage(),
        repository: _FakeBillingRepository(),
      ));
      expect(find.text('Plans & Pricing'), findsOneWidget);
    });

    testWidgets('renders plan cards once loaded', (tester) async {
      await tester.pumpWidget(_wrap(
        const PricingPage(),
        repository: _FakeBillingRepository(
          plans: const [
            BillingPlanModel(
              id: 'plan_1',
              name: 'Premium',
              planType: 'premium',
              status: 'active',
              features: {'ai_teacher': true},
            ),
          ],
        ),
      ));
      await tester.pumpAndSettle();
      expect(find.text('Premium'), findsOneWidget);
    });

    testWidgets('renders price from prices list', (tester) async {
      await tester.pumpWidget(_wrap(
        const PricingPage(),
        repository: _FakeBillingRepository(
          plans: const [
            BillingPlanModel(
              id: 'plan_1',
              name: 'Premium',
              planType: 'premium',
              status: 'active',
              features: {'ai_teacher': true},
              price: BillingPriceModel(
                id: 'price_1',
                productId: 'plan_1',
                amount: 1999,
                currency: 'usd',
                billingInterval: 'month',
                status: 'active',
              ),
            ),
          ],
          prices: const [
            BillingPriceModel(
              id: 'price_1',
              productId: 'plan_1',
              amount: 1999,
              currency: 'usd',
              billingInterval: 'month',
              status: 'active',
            ),
          ],
        ),
      ));
      await tester.pumpAndSettle();
      expect(find.text('\$19.99'), findsOneWidget);
    });

    testWidgets('resolves price by priceId when not embedded on plan',
        (tester) async {
      await tester.pumpWidget(_wrap(
        const PricingPage(),
        repository: _FakeBillingRepository(
          plans: const [
            BillingPlanModel(
              id: 'plan_1',
              name: 'Premium',
              planType: 'premium',
              status: 'active',
              features: {'ai_teacher': true},
              priceId: 'price_1',
            ),
          ],
          prices: const [
            BillingPriceModel(
              id: 'price_1',
              productId: 'plan_1',
              amount: 1999,
              currency: 'usd',
              billingInterval: 'month',
              status: 'active',
            ),
          ],
        ),
      ));
      await tester.pumpAndSettle();
      expect(find.text('\$19.99'), findsOneWidget);
      final selectButton = tester.widget<FilledButton>(
        find.widgetWithText(FilledButton, 'Select Plan'),
      );
      expect(selectButton.onPressed, isNotNull);
    });
  });

  group('SubscriptionPage', () {
    testWidgets('renders scaffold with title', (tester) async {
      await tester.pumpWidget(_wrap(
        const SubscriptionPage(),
        repository: _FakeBillingRepository(),
      ));
      expect(find.text('My Subscription'), findsOneWidget);
    });

    testWidgets('shows entitlement usage once loaded', (tester) async {
      await tester.pumpWidget(_wrap(
        const SubscriptionPage(),
        repository: _FakeBillingRepository(
          subscriptions: [
            SubscriptionModel(
              id: 'sub_1',
              planId: 'plan_1',
              status: 'active',
            ),
          ],
          entitlements: const [
            EntitlementModel(
              id: 'ent_1',
              featureKey: 'ai_teacher',
              granted: true,
              usageLimit: 100,
              usageCount: 50,
              source: 'subscription',
              status: 'active',
            ),
          ],
        ),
      ));
      await tester.pumpAndSettle();
      expect(find.text('ai_teacher'), findsOneWidget);
      expect(find.text('50 / 100'), findsOneWidget);
    });

    testWidgets('shows current plan card once loaded', (tester) async {
      await tester.pumpWidget(_wrap(
        const SubscriptionPage(),
        repository: _FakeBillingRepository(
          subscriptions: [
            SubscriptionModel(
              id: 'sub_1',
              planId: 'plan_1',
              status: 'active',
            ),
          ],
        ),
      ));
      await tester.pumpAndSettle();
      expect(find.text('Current Plan'), findsOneWidget);
      expect(find.text('Change Plan'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);
    });

    testWidgets('shows empty state when no active subscription', (tester) async {
      await tester.pumpWidget(_wrap(
        const SubscriptionPage(),
        repository: _FakeBillingRepository(),
      ));
      await tester.pumpAndSettle();
      expect(find.text('No Active Subscription'), findsOneWidget);
      expect(find.text('View Plans'), findsOneWidget);
    });

    testWidgets('buildNoSubscriptionState shows empty state', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => SubscriptionPage.buildNoSubscriptionState(
                context,
                onViewPlans: () {},
              ),
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
            body: Builder(
              builder: (context) => SubscriptionPage.buildEntitlementTile(
                context: context,
                featureKey: 'ai_teacher',
                granted: true,
                usageText: '50/100 sessions',
              ),
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
      await tester.pumpWidget(_wrap(
        const InvoiceHistoryPage(),
        repository: _FakeBillingRepository(),
      ));
      expect(find.text('Invoice History'), findsOneWidget);
    });

    testWidgets('shows empty state when no invoices', (tester) async {
      await tester.pumpWidget(_wrap(
        const InvoiceHistoryPage(),
        repository: _FakeBillingRepository(),
      ));
      await tester.pumpAndSettle();
      expect(find.text('No Invoices Yet'), findsOneWidget);
    });

    testWidgets('renders invoice tile once loaded', (tester) async {
      await tester.pumpWidget(_wrap(
        const InvoiceHistoryPage(),
        repository: _FakeBillingRepository(
          invoices: [
            InvoiceModel(
              id: 'inv_1',
              status: 'paid',
              total: 1999,
              currency: 'usd',
              createdAt: DateTime(2026, 1, 15),
            ),
          ],
        ),
      ));
      await tester.pumpAndSettle();
      expect(find.text('\$19.99 USD'), findsOneWidget);
      expect(find.text('paid'), findsOneWidget);
    });

    testWidgets('buildEmptyState shows no invoices message', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => InvoiceHistoryPage.buildEmptyState(context),
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
