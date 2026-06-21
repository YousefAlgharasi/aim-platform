import 'package:flutter/material.dart';

class InvoiceHistoryPage extends StatelessWidget {
  const InvoiceHistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Invoice History'),
      ),
      body: SafeArea(
        child: _buildInvoiceList(context, theme),
      ),
    );
  }

  Widget _buildInvoiceList(BuildContext context, ThemeData theme) {
    // Invoices loaded from GET /billing/invoices — backend is authority
    return const Center(
      child: CircularProgressIndicator(),
    );
  }

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
