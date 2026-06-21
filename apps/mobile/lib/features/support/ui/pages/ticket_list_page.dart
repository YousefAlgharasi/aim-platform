import 'package:flutter/material.dart';

/// Displays the user's support tickets fetched from backend.
///
/// Shows loading, empty, and populated states.
/// RTL/Arabic ready via Directionality-aware layout.
class TicketListPage extends StatelessWidget {
  const TicketListPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Ticket data loaded from backend via GET /support/tickets
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Tickets'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'Create Ticket',
            onPressed: () {
              // Navigate to create ticket page
            },
          ),
        ],
      ),
      body: SafeArea(
        child: _buildTicketList(context, theme),
      ),
    );
  }

  Widget _buildTicketList(BuildContext context, ThemeData theme) {
    // Will be connected to provider — shows loading state for now
    return const Center(
      child: CircularProgressIndicator(),
    );
  }

  /// Builds a single ticket list item card.
  static Widget buildTicketTile({
    required BuildContext context,
    required String ticketId,
    required String subject,
    required String status,
    required String category,
    required String severity,
    required DateTime createdAt,
    VoidCallback? onTap,
  }) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsetsDirectional.only(
        start: 16,
        end: 16,
        bottom: 8,
      ),
      child: ListTile(
        title: Text(
          subject,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          '$category · $severity',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        trailing: _buildStatusChip(context, status),
        onTap: onTap,
      ),
    );
  }

  /// Builds an empty state when no tickets exist.
  static Widget buildEmptyState(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.confirmation_number_outlined,
            size: 64,
            color: theme.colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No Tickets Yet',
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Create a ticket to get help from our support team.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  static Widget _buildStatusChip(BuildContext context, String status) {
    final theme = Theme.of(context);
    final Color chipColor;
    switch (status) {
      case 'open':
        chipColor = theme.colorScheme.primary;
        break;
      case 'in_progress':
        chipColor = theme.colorScheme.tertiary;
        break;
      case 'resolved':
      case 'closed':
        chipColor = theme.colorScheme.outline;
        break;
      default:
        chipColor = theme.colorScheme.outline;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: chipColor.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        status.replaceAll('_', ' '),
        style: theme.textTheme.labelSmall?.copyWith(color: chipColor),
      ),
    );
  }
}
