class BillingPlanModel {
  final String id;
  final String name;
  final String? description;
  final String planType;
  final String status;
  final Map<String, dynamic> features;
  final BillingPriceModel? price;

  const BillingPlanModel({
    required this.id,
    required this.name,
    this.description,
    required this.planType,
    required this.status,
    required this.features,
    this.price,
  });

  factory BillingPlanModel.fromJson(Map<String, dynamic> json) {
    return BillingPlanModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      planType: json['planType'] as String,
      status: json['status'] as String,
      features: json['features'] as Map<String, dynamic>? ?? {},
      price: json['price'] != null
          ? BillingPriceModel.fromJson(json['price'] as Map<String, dynamic>)
          : null,
    );
  }
}

class BillingPriceModel {
  final String id;
  final String productId;
  final int amount;
  final String currency;
  final String billingInterval;
  final String status;

  const BillingPriceModel({
    required this.id,
    required this.productId,
    required this.amount,
    required this.currency,
    required this.billingInterval,
    required this.status,
  });

  factory BillingPriceModel.fromJson(Map<String, dynamic> json) {
    return BillingPriceModel(
      id: json['id'] as String,
      productId: json['productId'] as String,
      amount: json['amount'] as int,
      currency: json['currency'] as String,
      billingInterval: json['billingInterval'] as String,
      status: json['status'] as String,
    );
  }

  String get formattedAmount {
    final dollars = (amount / 100).toStringAsFixed(2);
    return '\$$dollars';
  }
}

class SubscriptionModel {
  final String id;
  final String planId;
  final String status;
  final DateTime? currentPeriodEnd;
  final bool cancelAtPeriodEnd;

  const SubscriptionModel({
    required this.id,
    required this.planId,
    required this.status,
    this.currentPeriodEnd,
    this.cancelAtPeriodEnd = false,
  });

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionModel(
      id: json['id'] as String,
      planId: json['planId'] as String,
      status: json['status'] as String,
      currentPeriodEnd: json['currentPeriodEnd'] != null
          ? DateTime.parse(json['currentPeriodEnd'] as String)
          : null,
      cancelAtPeriodEnd: json['cancelAtPeriodEnd'] as bool? ?? false,
    );
  }

  bool get isActive => status == 'active' || status == 'trialing';
}

class CheckoutSessionModel {
  final String id;
  final String status;
  final String? checkoutUrl;
  final String? subscriptionId;

  const CheckoutSessionModel({
    required this.id,
    required this.status,
    this.checkoutUrl,
    this.subscriptionId,
  });

  factory CheckoutSessionModel.fromJson(Map<String, dynamic> json) {
    return CheckoutSessionModel(
      id: json['id'] as String? ?? json['sessionId'] as String,
      status: json['status'] as String,
      checkoutUrl: json['checkoutUrl'] as String?,
      subscriptionId: json['subscriptionId'] as String?,
    );
  }
}

class InvoiceModel {
  final String id;
  final String status;
  final int totalAmount;
  final String currency;
  final DateTime createdAt;

  const InvoiceModel({
    required this.id,
    required this.status,
    required this.totalAmount,
    required this.currency,
    required this.createdAt,
  });

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    return InvoiceModel(
      id: json['id'] as String,
      status: json['status'] as String,
      totalAmount: json['totalAmount'] as int,
      currency: json['currency'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class EntitlementModel {
  final String id;
  final String featureKey;
  final bool granted;
  final String status;

  const EntitlementModel({
    required this.id,
    required this.featureKey,
    required this.granted,
    required this.status,
  });

  factory EntitlementModel.fromJson(Map<String, dynamic> json) {
    return EntitlementModel(
      id: json['id'] as String,
      featureKey: json['featureKey'] as String,
      granted: json['granted'] as bool,
      status: json['status'] as String,
    );
  }
}
