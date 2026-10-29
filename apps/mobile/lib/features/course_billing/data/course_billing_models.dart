// Course billing models — parsed from the backend verbatim. The backend
// computes every price, discount and access decision; the app only shows
// them.

/// What a student pays for a course right now.
class CoursePriceQuote {
  const CoursePriceQuote({
    required this.isFree,
    required this.currency,
    required this.originalAmount,
    required this.discountAmount,
    required this.amount,
    required this.discountActive,
    required this.accessDays,
    this.discountEndsAt,
  });

  final bool isFree;
  final String currency;
  final double originalAmount;
  final double discountAmount;
  final double amount;
  final bool discountActive;
  final DateTime? discountEndsAt;

  /// Days the student gets to finish once their payment is approved.
  final int accessDays;

  factory CoursePriceQuote.fromJson(Map<String, dynamic> json) {
    return CoursePriceQuote(
      isFree: json['isFree'] as bool? ?? true,
      currency: json['currency'] as String? ?? 'YER',
      originalAmount: (json['originalAmount'] as num? ?? 0).toDouble(),
      discountAmount: (json['discountAmount'] as num? ?? 0).toDouble(),
      amount: (json['amount'] as num? ?? 0).toDouble(),
      discountActive: json['discountActive'] as bool? ?? false,
      discountEndsAt: _date(json['discountEndsAt']),
      accessDays: (json['accessDays'] as num? ?? 30).toInt(),
    );
  }
}

/// The student's access to a course (see backend CourseAccessStatus).
enum CourseAccessStatus { free, none, pending, rejected, active, completed, failed }

CourseAccessStatus _accessStatus(Object? value) {
  return CourseAccessStatus.values.firstWhere(
    (s) => s.name == value,
    orElse: () => CourseAccessStatus.free,
  );
}

class CourseAccess {
  const CourseAccess({
    required this.status,
    required this.hasAccess,
    this.startsAt,
    this.expiresAt,
    this.daysLeft,
    this.rejectionNote,
  });

  final CourseAccessStatus status;
  final bool hasAccess;
  final DateTime? startsAt;
  final DateTime? expiresAt;
  final int? daysLeft;
  final String? rejectionNote;

  /// The student must pay (or is waiting for approval) before opening it.
  bool get needsPayment => !hasAccess;

  factory CourseAccess.fromJson(Map<String, dynamic> json) {
    return CourseAccess(
      status: _accessStatus(json['status']),
      hasAccess: json['hasAccess'] as bool? ?? true,
      startsAt: _date(json['startsAt']),
      expiresAt: _date(json['expiresAt']),
      daysLeft: (json['daysLeft'] as num?)?.toInt(),
      rejectionNote: json['rejectionNote'] as String?,
    );
  }
}

class CourseBilling {
  const CourseBilling({required this.courseId, required this.price, required this.access});

  final String courseId;
  final CoursePriceQuote price;
  final CourseAccess access;

  factory CourseBilling.fromJson(Map<String, dynamic> json) {
    return CourseBilling(
      courseId: json['courseId'] as String,
      price: CoursePriceQuote.fromJson(json['price'] as Map<String, dynamic>),
      access: CourseAccess.fromJson(json['access'] as Map<String, dynamic>),
    );
  }
}

class PaymentWallet {
  const PaymentWallet({
    required this.id,
    required this.name,
    this.accountName,
    this.accountNumber,
    this.instructions,
    this.logoPath,
    this.qrImagePath,
  });

  final String id;
  final String name;
  final String? accountName;
  final String? accountNumber;
  final String? instructions;

  /// Backend paths (relative to the API base URL) of the wallet images.
  final String? logoPath;
  final String? qrImagePath;

  factory PaymentWallet.fromJson(Map<String, dynamic> json) {
    return PaymentWallet(
      id: json['id'] as String,
      name: json['name'] as String,
      accountName: json['accountName'] as String?,
      accountNumber: json['accountNumber'] as String?,
      instructions: json['instructions'] as String?,
      logoPath: json['logoUrl'] as String?,
      qrImagePath: json['qrImageUrl'] as String?,
    );
  }
}

enum PaymentRequestStatus { pending, approved, rejected }

class CoursePaymentRequest {
  const CoursePaymentRequest({
    required this.id,
    required this.courseId,
    required this.courseTitle,
    required this.walletName,
    required this.transactionNumber,
    required this.amount,
    required this.originalAmount,
    required this.currency,
    required this.status,
    required this.createdAt,
    this.adminNote,
    this.reviewedAt,
  });

  final String id;
  final String courseId;
  final String courseTitle;
  final String walletName;
  final String transactionNumber;
  final double amount;
  final double originalAmount;
  final String currency;
  final PaymentRequestStatus status;
  final String? adminNote;
  final DateTime createdAt;
  final DateTime? reviewedAt;

  factory CoursePaymentRequest.fromJson(Map<String, dynamic> json) {
    return CoursePaymentRequest(
      id: json['id'] as String,
      courseId: json['courseId'] as String,
      courseTitle: json['courseTitle'] as String? ?? '',
      walletName: json['walletName'] as String? ?? '',
      transactionNumber: json['transactionNumber'] as String? ?? '',
      amount: (json['amount'] as num? ?? 0).toDouble(),
      originalAmount: (json['originalAmount'] as num? ?? 0).toDouble(),
      currency: json['currency'] as String? ?? 'YER',
      status: PaymentRequestStatus.values.firstWhere(
        (s) => s.name == json['status'],
        orElse: () => PaymentRequestStatus.pending,
      ),
      adminNote: json['adminNote'] as String?,
      createdAt: _date(json['createdAt']) ?? DateTime.now(),
      reviewedAt: _date(json['reviewedAt']),
    );
  }
}

DateTime? _date(Object? value) =>
    value is String && value.isNotEmpty ? DateTime.tryParse(value)?.toLocal() : null;
