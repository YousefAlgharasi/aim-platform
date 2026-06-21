import 'package:flutter/material.dart';

/// Displays ticket detail with info and comments.
///
/// Shows ticket metadata and a threaded comments section.
/// RTL/Arabic ready via Directionality-aware layout.
class TicketDetailPage extends StatelessWidget {
  final String ticketId;

  const TicketDetailPage({super.key, required this.ticketId});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Ticket and comments loaded from backend
    // via GET /support/tickets/:id and GET /support/tickets/:id/comments
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ticket Detail'),
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

  /// Builds the ticket info header card.
  static Widget buildTicketInfoCard({
    required BuildContext context,
    required String subject,
    required String description,
    required String category,
    required String severity,
    required String status,
    required DateTime createdAt,
  }) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(subject, style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildInfoChip(context, category),
                const SizedBox(width: 8),
                _buildInfoChip(context, severity),
                const SizedBox(width: 8),
                _buildInfoChip(context, status),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              description,
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Created: ${createdAt.toLocal().toString().split('.').first}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Builds a single comment bubble.
  static Widget buildCommentBubble({
    required BuildContext context,
    required String authorName,
    required String body,
    required bool isStaff,
    required DateTime createdAt,
  }) {
    final theme = Theme.of(context);
    return Container(
      margin: EdgeInsetsDirectional.only(
        start: isStaff ? 16 : 48,
        end: isStaff ? 48 : 16,
        bottom: 8,
      ),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isStaff
            ? theme.colorScheme.primaryContainer
            : theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                authorName,
                style: theme.textTheme.labelMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isStaff
                      ? theme.colorScheme.onPrimaryContainer
                      : theme.colorScheme.onSurface,
                ),
              ),
              if (isStaff) ...[
                const SizedBox(width: 4),
                Icon(
                  Icons.verified,
                  size: 14,
                  color: theme.colorScheme.primary,
                ),
              ],
            ],
          ),
          const SizedBox(height: 4),
          Text(
            body,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: isStaff
                  ? theme.colorScheme.onPrimaryContainer
                  : theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            createdAt.toLocal().toString().split('.').first,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  static Widget _buildInfoChip(BuildContext context, String label) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelSmall,
      ),
    );
  }
}
