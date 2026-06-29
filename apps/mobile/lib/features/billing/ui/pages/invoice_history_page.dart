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
    final theme = Theme.of(context);
    return ListTile(
      onTap: onTap,
      leading: Icon(
        _iconForStatus(status),
        color: _colorForStatus(status, theme),
      ),
      title: Text(amountFormatted),
      subtitle: Text(dateFormatted),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: _colorForStatus(status, theme).withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          status,
          style: theme.textTheme.labelSmall?.copyWith(
            color: _colorForStatus(status, theme),
          ),
        ),
      ),
    );
  }

  static IconData _iconForStatus(String status) {
    switch (status) {
      case 'paid':
        return Icons.check_circle;
      case 'pending':
        return Icons.schedule;
      case 'failed':
        return Icons.error;
      case 'refunded':
        return Icons.replay;
      default:
        return Icons.receipt;
    }
  }

  static Color _colorForStatus(String status, ThemeData theme) {
    switch (status) {
      case 'paid':
        return theme.colorScheme.primary;
      case 'pending':
        return theme.colorScheme.tertiary;
      case 'failed':
        return theme.colorScheme.error;
      case 'refunded':
        return theme.colorScheme.outline;
      default:
        return theme.colorScheme.onSurface;
    }
  }

  static Widget buildEmptyState(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.receipt_long,
            size: 64,
            color: theme.colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No Invoices Yet',
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Your invoices will appear here after your first payment.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
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

    return Scaffold(
      appBar: AppBar(title: const Text('Invoice History')),
      body: SafeArea(
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
      child: ListView.builder(
        itemCount: invoices.length,
        itemBuilder: (context, index) {
          final invoice = invoices[index];
          return InvoiceHistoryPage.buildInvoiceTile(
            context: context,
            invoiceId: invoice.id,
            status: invoice.status,
            amountFormatted:
                '\$${(invoice.total / 100).toStringAsFixed(2)} ${invoice.currency.toUpperCase()}',
            dateFormatted: _formatDate(invoice.createdAt),
          );
        },
      ),
    );
  }

  String _formatDate(DateTime date) =>
      '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
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
