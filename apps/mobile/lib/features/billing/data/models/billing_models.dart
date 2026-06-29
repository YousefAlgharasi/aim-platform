class BillingPlanModel {
  final String id;
  final String name;
  final String? description;
  final String planType;
  final String status;
  final Map<String, dynamic> features;
  final String? priceId;
  final BillingPriceModel? price;

  const BillingPlanModel({
    required this.id,
    required this.name,
    this.description,
    required this.planType,
    required this.status,
    required this.features,
    this.priceId,
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
      priceId: json['priceId'] as String?,
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
  final DateTime? currentPeriodStart;
  final DateTime? currentPeriodEnd;
  final bool cancelAtPeriodEnd;
  final DateTime? canceledAt;
  final DateTime? trialStart;
  final DateTime? trialEnd;

  const SubscriptionModel({
    required this.id,
    required this.planId,
    required this.status,
    this.currentPeriodStart,
    this.currentPeriodEnd,
    this.cancelAtPeriodEnd = false,
    this.canceledAt,
    this.trialStart,
    this.trialEnd,
  });

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionModel(
      id: json['id'] as String,
      planId: json['planId'] as String,
      status: json['status'] as String,
      currentPeriodStart: json['currentPeriodStart'] != null
          ? DateTime.parse(json['currentPeriodStart'] as String)
          : null,
      currentPeriodEnd: json['currentPeriodEnd'] != null
          ? DateTime.parse(json['currentPeriodEnd'] as String)
          : null,
      cancelAtPeriodEnd: json['cancelAtPeriodEnd'] as bool? ?? false,
      canceledAt: json['canceledAt'] != null
          ? DateTime.parse(json['canceledAt'] as String)
          : null,
      trialStart: json['trialStart'] != null
          ? DateTime.parse(json['trialStart'] as String)
          : null,
      trialEnd: json['trialEnd'] != null
          ? DateTime.parse(json['trialEnd'] as String)
          : null,
    );
  }

  bool get isActive => status == 'active' || status == 'trialing';
}

class CheckoutSessionModel {
  final String id;
  final String status;
  final String? checkoutUrl;
  final DateTime? expiresAt;

  const CheckoutSessionModel({
    required this.id,
    required this.status,
    this.checkoutUrl,
    this.expiresAt,
  });

  factory CheckoutSessionModel.fromJson(Map<String, dynamic> json) {
    return CheckoutSessionModel(
      id: json['id'] as String,
      status: json['status'] as String,
      checkoutUrl: json['checkoutUrl'] as String?,
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'] as String)
          : null,
    );
  }
}

class InvoiceModel {
  final String id;
  final String status;
  final int total;
  final String currency;
  final String? invoiceUrl;
  final DateTime createdAt;

  const InvoiceModel({
    required this.id,
    required this.status,
    required this.total,
    required this.currency,
    this.invoiceUrl,
    required this.createdAt,
  });

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    return InvoiceModel(
      id: json['id'] as String,
      status: json['status'] as String,
      total: json['total'] as int,
      currency: json['currency'] as String,
      invoiceUrl: json['invoiceUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class EntitlementModel {
  final String id;
  final String featureKey;
  final bool granted;
  final int? usageLimit;
  final int usageCount;
  final DateTime? expiresAt;
  final String source;
  final String status;

  const EntitlementModel({
    required this.id,
    required this.featureKey,
    required this.granted,
    this.usageLimit,
    required this.usageCount,
    this.expiresAt,
    required this.source,
    required this.status,
  });

  factory EntitlementModel.fromJson(Map<String, dynamic> json) {
    return EntitlementModel(
      id: json['id'] as String,
      featureKey: json['featureKey'] as String,
      granted: json['granted'] as bool,
      usageLimit: json['usageLimit'] as int?,
      usageCount: json['usageCount'] as int? ?? 0,
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'] as String)
          : null,
      source: json['source'] as String? ?? 'subscription',
      status: json['status'] as String,
    );
  }
}
