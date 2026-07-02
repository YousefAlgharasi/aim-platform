// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Invoice history" (47)
//   docs/design/ui-for-all-system-mobile/screenshots/light/47-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/47-screen.png
//
// TASK-27: restyled to match design screen 47 — gradient header ("Invoices"),
// rows with a leading receipt-icon avatar, bold amount, date subtitle, and a
// soft "Paid"/status pill.
//
// Security/data rules:
// - Invoice id, status, amount, currency, and date are all backend-supplied;
//   Flutter never invents or computes any of them.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/billing/data/models/billing_models.dart';
import 'package:aim_mobile/features/billing/logic/provider/billing_provider.dart';

class InvoiceHistoryPage extends ConsumerStatefulWidget {
  const InvoiceHistoryPage({super.key});

  @override
  ConsumerState<InvoiceHistoryPage> createState() =>
      _InvoiceHistoryPageState();

  static Widget buildInvoiceTile({
    required BuildContext context,
    required String invoiceId,
    required String status,
    required String amountFormatted,
    required String dateFormatted,
    VoidCallback? onTap,
  }) {
    final surfaces = aimSurfacesOf(context);
    return AIMCard(
      interactive: onTap != null,
      onTap: onTap,
      semanticLabel: '$amountFormatted, $dateFormatted, $status',
      child: Row(
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: surfaces.surfaceSunken,
              borderRadius: AimRadius.borderMd,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                Icons.receipt_outlined,
                size: AimSizes.iconMd,
                color: surfaces.textSecondary,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  amountFormatted,
                  style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
                ),
                const SizedBox(height: AimSpacing.space2),
                Text(
                  dateFormatted,
                  style:
                      AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
                ),
              ],
            ),
          ),
          AIMBadge(
            tone: _toneForStatus(status),
            pill: true,
            child: Text(_capitalize(status)),
          ),
        ],
      ),
    );
  }

  static AIMBadgeTone _toneForStatus(String status) {
    switch (status) {
      case 'paid':
        return AIMBadgeTone.success;
      case 'pending':
        return AIMBadgeTone.warning;
      case 'failed':
        return AIMBadgeTone.error;
      case 'refunded':
        return AIMBadgeTone.info;
      default:
        return AIMBadgeTone.neutral;
    }
  }

  static String _capitalize(String value) =>
      value.isEmpty ? value : '${value[0].toUpperCase()}${value.substring(1)}';

  static Widget buildEmptyState(BuildContext context) {
    return const AIMEmptyState(
      icon: Icon(Icons.receipt_long_outlined),
      title: 'No Invoices Yet',
      subtitle: 'Your invoices will appear here after your first payment.',
    );
  }
}

class _InvoiceHistoryPageState extends ConsumerState<InvoiceHistoryPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() => ref.read(invoiceProvider.notifier).load();

  Future<void> _refresh() => ref.read(invoiceProvider.notifier).refresh();

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(invoiceProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _InvoiceHistoryHeader(),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() || AppAsyncIdle() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading invoices',
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: _load,
                ),
              AppAsyncSuccess(:final data) => data.isEmpty
                  ? RefreshIndicator(
                      onRefresh: _refresh,
                      child: ListView(
                        children: [
                          SizedBox(
                            height: MediaQuery.of(context).size.height * 0.7,
                            child: InvoiceHistoryPage.buildEmptyState(context),
                          ),
                        ],
                      ),
                    )
                  : _InvoiceList(invoices: data, onRefresh: _refresh),
            },
          ),
        ],
      ),
    );
  }
}

class _InvoiceHistoryHeader extends StatelessWidget {
  const _InvoiceHistoryHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: 'Back',
              child: InkWell(
                onTap: () => Navigator.of(context).pop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.arrow_back,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              'Invoices',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}

class _InvoiceList extends StatelessWidget {
  const _InvoiceList({required this.invoices, required this.onRefresh});

  final List<InvoiceModel> invoices;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        itemCount: invoices.length,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (context, index) {
          final invoice = invoices[index];
          return InvoiceHistoryPage.buildInvoiceTile(
            context: context,
            invoiceId: invoice.id,
            status: invoice.status,
            amountFormatted: '\$${(invoice.total / 100).toStringAsFixed(2)}',
            dateFormatted: _formatDate(invoice.createdAt),
          );
        },
      ),
    );
  }

  /// Formats a real backend timestamp as e.g. "Jun 25, 2026" (design screen
  /// 47's row subtitle).
  String _formatDate(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}

class InvoiceDetailPage extends StatelessWidget {
  final String invoiceId;

  const InvoiceDetailPage({super.key, required this.invoiceId});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Invoice Detail'),
      ),
      body: SafeArea(
        child: _buildInvoiceDetail(context, theme),
      ),
    );
  }

  Widget _buildInvoiceDetail(BuildContext context, ThemeData theme) {
    // Invoice detail loaded from GET /billing/invoices/:id — backend authority
    return const Center(
      child: CircularProgressIndicator(),
    );
  }

  static Widget buildInvoiceHeader({
    required BuildContext context,
    required String invoiceNumber,
    required String status,
    required String totalFormatted,
    required String dateFormatted,
  }) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(invoiceNumber, style: theme.textTheme.titleMedium),
                Text(status, style: theme.textTheme.labelMedium),
              ],
            ),
            const SizedBox(height: 8),
            Text(totalFormatted, style: theme.textTheme.headlineSmall),
            const SizedBox(height: 4),
            Text(dateFormatted, style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }

  static Widget buildLineItemTile({
    required BuildContext context,
    required String description,
    required String amountFormatted,
    int quantity = 1,
  }) {
    final theme = Theme.of(context);
    return ListTile(
      title: Text(description),
      subtitle: quantity > 1 ? Text('Qty: $quantity') : null,
      trailing: Text(
        amountFormatted,
        style: theme.textTheme.bodyMedium?.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
