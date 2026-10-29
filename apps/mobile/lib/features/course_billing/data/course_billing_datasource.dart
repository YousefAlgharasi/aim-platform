// Course billing API calls (student side).

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';

import 'course_billing_models.dart';

class CourseBillingDatasource {
  const CourseBillingDatasource({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  /// Full URL of a backend path such as a wallet logo.
  Uri resolve(String path) => _apiClient.buildUri(path);

  Future<List<PaymentWallet>> getWallets() async {
    final envelope = await _apiClient.get<List<PaymentWallet>>(
      BackendApiPaths.studentBillingWallets,
      decodeData: (json) => (json as List<dynamic>)
          .map((w) => PaymentWallet.fromJson(w as Map<String, dynamic>))
          .toList(),
    );
    return envelope.data ?? const [];
  }

  Future<CourseBilling> getCourseBilling(String courseId) async {
    final envelope = await _apiClient.get<CourseBilling>(
      BackendApiPaths.studentCourseBilling(courseId),
      decodeData: (json) => CourseBilling.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  Future<List<CoursePaymentRequest>> getMyPayments() async {
    final envelope = await _apiClient.get<List<CoursePaymentRequest>>(
      BackendApiPaths.studentPaymentRequests,
      decodeData: (json) => (json as List<dynamic>)
          .map((p) => CoursePaymentRequest.fromJson(p as Map<String, dynamic>))
          .toList(),
    );
    return envelope.data ?? const [];
  }

  Future<CoursePaymentRequest> submitPayment({
    required String courseId,
    required String walletId,
    required String transactionNumber,
    required List<int> receiptBytes,
    required String receiptFileName,
    String? receiptMimeType,
  }) async {
    final envelope = await _apiClient.postMultipart<CoursePaymentRequest>(
      BackendApiPaths.studentCoursePaymentRequests(courseId),
      fieldName: 'receipt',
      fileBytes: receiptBytes,
      fileName: receiptFileName,
      mimeType: receiptMimeType,
      fields: {'walletId': walletId, 'transactionNumber': transactionNumber},
      decodeData: (json) => CoursePaymentRequest.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }
}
