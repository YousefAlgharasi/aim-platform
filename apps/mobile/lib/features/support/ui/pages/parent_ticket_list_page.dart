import 'package:flutter/material.dart';

import 'ticket_list_page.dart';

/// Parent ticket list page.
///
/// Same pattern as student TicketListPage but for parent role.
/// Reuses shared widget builders from TicketListPage.
/// RTL/Arabic ready via Directionality-aware layout.
class ParentTicketListPage extends StatelessWidget {
  const ParentTicketListPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Parent tickets loaded from backend via GET /support/tickets
    // filtered by parent role on the backend
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Support Tickets'),
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
        child: _buildContent(context, theme),
      ),
    );
  }

  Widget _buildContent(BuildContext context, ThemeData theme) {
    // Will be connected to provider — shows loading state for now
    return const Center(
      child: CircularProgressIndicator(),
    );
  }

  /// Builds an empty state for parent tickets using shared pattern.
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
            'No Support Tickets',
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Create a ticket if you need help with your account.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  /// Delegates to shared TicketListPage.buildTicketTile for consistent UI.
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
    return TicketListPage.buildTicketTile(
      context: context,
      ticketId: ticketId,
      subject: subject,
      status: status,
      category: category,
      severity: severity,
      createdAt: createdAt,
      onTap: onTap,
    );
  }
}
