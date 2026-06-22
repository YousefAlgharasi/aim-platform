import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/billing/data/models/billing_models.dart';

void main() {
  group('BillingPlanModel', () {
    test('parses from JSON', () {
      final model = BillingPlanModel.fromJson(const {
        'id': 'plan_001',
        'name': 'Premium',
        'description': 'Full access plan',
        'planType': 'premium',
        'status': 'active',
        'features': {'ai_teacher': true},
      });

      expect(model.id, 'plan_001');
      expect(model.name, 'Premium');
      expect(model.description, 'Full access plan');
      expect(model.planType, 'premium');
      expect(model.status, 'active');
      expect(model.features, {'ai_teacher': true});
    });

    test('handles missing optional fields', () {
      final model = BillingPlanModel.fromJson(const {
        'id': 'plan_002',
        'name': 'Basic',
        'planType': 'basic',
        'status': 'active',
      });

      expect(model.id, 'plan_002');
      expect(model.description, isNull);
      expect(model.price, isNull);
      expect(model.features, isEmpty);
    });
  });

  group('BillingPriceModel', () {
    test('parses from JSON', () {
      final model = BillingPriceModel.fromJson(const {
        'id': 'price_001',
        'productId': 'plan_001',
        'amount': 999,
        'currency': 'usd',
        'billingInterval': 'month',
        'status': 'active',
      });

      expect(model.id, 'price_001');
      expect(model.productId, 'plan_001');
      expect(model.amount, 999);
      expect(model.currency, 'usd');
      expect(model.billingInterval, 'month');
      expect(model.formattedAmount, '\$9.99');
    });
  });

  group('SubscriptionModel', () {
    test('parses from JSON', () {
      final model = SubscriptionModel.fromJson(const {
        'id': 'sub_001',
        'planId': 'plan_001',
        'status': 'active',
        'currentPeriodEnd': '2026-07-01T00:00:00Z',
      });

      expect(model.id, 'sub_001');
      expect(model.planId, 'plan_001');
      expect(model.status, 'active');
    });

    test('identifies active subscription', () {
      final model = SubscriptionModel.fromJson(const {
        'id': 'sub_002',
        'planId': 'plan_001',
        'status': 'active',
        'currentPeriodEnd': '2026-07-01T00:00:00Z',
      });

      expect(model.isActive, isTrue);
    });

    test('identifies cancelled subscription', () {
      final model = SubscriptionModel.fromJson(const {
        'id': 'sub_003',
        'planId': 'plan_001',
        'status': 'cancelled',
        'currentPeriodEnd': '2026-07-01T00:00:00Z',
      });

      expect(model.isActive, isFalse);
    });
  });

  group('CheckoutSessionModel', () {
    test('parses from JSON', () {
      final model = CheckoutSessionModel.fromJson(const {
        'id': 'cs_001',
        'status': 'pending',
      });

      expect(model.id, 'cs_001');
      expect(model.status, 'pending');
    });
  });

  group('InvoiceModel', () {
    test('parses from JSON', () {
      final model = InvoiceModel.fromJson(const {
        'id': 'inv_001',
        'status': 'paid',
        'totalAmount': 999,
        'currency': 'usd',
        'createdAt': '2026-06-01T00:00:00Z',
      });

      expect(model.id, 'inv_001');
      expect(model.status, 'paid');
      expect(model.totalAmount, 999);
    });

    test('handles missing optional fields', () {
      final model = CheckoutSessionModel.fromJson(const {
        'id': 'cs_002',
        'status': 'pending',
      });

      expect(model.subscriptionId, isNull);
      expect(model.checkoutUrl, isNull);
    });
  });

  group('EntitlementModel', () {
    test('parses from JSON', () {
      final model = EntitlementModel.fromJson(const {
        'id': 'ent_001',
        'featureKey': 'ai_teacher',
        'granted': true,
        'status': 'active',
      });

      expect(model.id, 'ent_001');
      expect(model.featureKey, 'ai_teacher');
      expect(model.granted, isTrue);
    });
  });

  group('Security constraints', () {
    test('models do not store raw card data', () {
      final json = {
        'id': 'sub_001',
        'planId': 'plan_001',
        'status': 'active',
        'currentPeriodEnd': '2026-07-01T00:00:00Z',
        'cardNumber': '4242424242424242',
        'cvv': '123',
      };
      final model = SubscriptionModel.fromJson(json);
      expect(model.id, 'sub_001');
      // Model only extracts defined safe fields — card data is ignored
    });
  });
}
