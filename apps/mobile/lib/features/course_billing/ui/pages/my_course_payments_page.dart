// MyCoursePaymentsPage — the student's course payments and their review
// status (pending / approved / rejected with the admin's note).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import '../../data/course_billing_models.dart';
import '../../logic/course_billing_providers.dart';
import '../widgets/billing_format.dart';

class MyCoursePaymentsPage extends ConsumerWidget {
  const MyCoursePaymentsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final payments = ref.watch(myCoursePaymentsProvider);

    return Scaffold(
      appBar: AIMTopAppBar(
        title: l10n.billingMyPayments,
        onBack: () => context.canPop() ? context.pop() : context.go(AppRoutePaths.mainShell),
      ),
      body: SafeArea(
        top: false,
        child: payments.when(
          loading: () => const AIMFullScreenLoading(),
          error: (e, _) => AIMFullScreenError(
            message: e is ApiClientException ? e.message : '$e',
            onRetry: () => ref.invalidate(myCoursePaymentsProvider),
          ),
          data: (items) => RefreshIndicator(
            onRefresh: () async => ref.invalidate(myCoursePaymentsProvider),
            child: items.isEmpty
                ? ListView(
                    padding: const EdgeInsets.all(AimSpacing.space24),
                    children: [
                      AIMEmptyState(
                        icon: const Icon(Icons.receipt_long_outlined),
                        title: l10n.billingNoPayments,
                      ),
                    ],
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AimSpacing.screenPaddingMobile,
                      vertical: AimSpacing.space16,
                    ),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: AimSpacing.componentGap),
                    itemBuilder: (context, i) => _PaymentCard(payment: items[i]),
                  ),
          ),
        ),
      ),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  const _PaymentCard({required this.payment});

  final CoursePaymentRequest payment;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final (Color color, String label) = switch (payment.status) {
      PaymentRequestStatus.pending => (AimColors.warning500, l10n.billingStatusPending),
      PaymentRequestStatus.approved => (AimColors.success500, l10n.billingStatusApproved),
      PaymentRequestStatus.rejected => (AimColors.error500, l10n.billingStatusRejected),
    };

    return AIMCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  payment.courseTitle,
                  style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
                ),
              ),
              Container(
                padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            formatCurrencyAmount(context, payment.amount, payment.currency),
            style: AimTextStyles.bodyLg.copyWith(color: surfaces.textPrimary, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            '${payment.walletName} · ${l10n.billingTransactionShort(payment.transactionNumber)}',
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
          Text(
            formatBillingDate(context, payment.createdAt),
            style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
          ),
          if (payment.adminNote != null && payment.adminNote!.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.space8),
            Text(
              l10n.billingAdminNote(payment.adminNote!),
              style: AimTextStyles.bodySm.copyWith(
                color: payment.status == PaymentRequestStatus.rejected ? AimColors.error500 : surfaces.textSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
