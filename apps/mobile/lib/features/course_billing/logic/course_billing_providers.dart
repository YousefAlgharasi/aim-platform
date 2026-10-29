import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';

import '../data/course_billing_datasource.dart';
import '../data/course_billing_models.dart';

final courseBillingDatasourceProvider = Provider<CourseBillingDatasource>((ref) {
  return CourseBillingDatasource(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

/// Active wallets students can pay with.
final paymentWalletsProvider = FutureProvider.autoDispose<List<PaymentWallet>>((ref) {
  return ref.watch(courseBillingDatasourceProvider).getWallets();
});

/// Price and access for one course.
final courseBillingProvider =
    FutureProvider.autoDispose.family<CourseBilling, String>((ref, courseId) {
  return ref.watch(courseBillingDatasourceProvider).getCourseBilling(courseId);
});

/// The student's course payments, newest first.
final myCoursePaymentsProvider =
    FutureProvider.autoDispose<List<CoursePaymentRequest>>((ref) {
  return ref.watch(courseBillingDatasourceProvider).getMyPayments();
});
