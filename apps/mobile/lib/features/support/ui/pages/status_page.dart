import 'package:flutter/material.dart';

/// System status and maintenance window page.
///
/// Shows operational status per component from backend (GET /status)
/// and lists active/upcoming maintenance windows.
/// RTL/Arabic ready via Directionality-aware layout.
class StatusPage extends StatelessWidget {
  const StatusPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Status data loaded from backend via GET /status
    return Scaffold(
      appBar: AppBar(
        title: const Text('System Status'),
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

  /// Builds a component status row with colored indicator.
  static Widget buildComponentStatus({
    required BuildContext context,
    required String component,
    required String status,
    String? message,
  }) {
    final theme = Theme.of(context);
    final Color statusColor = _statusColor(theme, status);
    final IconData statusIcon = _statusIcon(status);

    return Card(
      margin: const EdgeInsetsDirectional.only(
        start: 16,
        end: 16,
        bottom: 8,
      ),
      child: ListTile(
        leading: Icon(statusIcon, color: statusColor),
        title: Text(component),
        subtitle: message != null
            ? Text(
                message,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              )
            : null,
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: statusColor.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            _statusLabel(status),
            style: theme.textTheme.labelSmall?.copyWith(color: statusColor),
          ),
        ),
      ),
    );
  }

  /// Builds a maintenance window card.
  static Widget buildMaintenanceCard({
    required BuildContext context,
    required String title,
    String? description,
    required DateTime scheduledStart,
    required DateTime scheduledEnd,
    required String status,
  }) {
    final theme = Theme.of(context);
    final bool isActive = status == 'in_progress';

    return Card(
      margin: const EdgeInsetsDirectional.only(
        start: 16,
        end: 16,
        bottom: 8,
      ),
      color: isActive
          ? theme.colorScheme.errorContainer
          : theme.colorScheme.surfaceContainerHighest,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  isActive ? Icons.engineering : Icons.schedule,
                  size: 20,
                  color: isActive
                      ? theme.colorScheme.onErrorContainer
                      : theme.colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    title,
                    style: theme.textTheme.titleSmall?.copyWith(
                      color: isActive
                          ? theme.colorScheme.onErrorContainer
                          : null,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: isActive
                        ? theme.colorScheme.error.withValues(alpha: 0.12)
                        : theme.colorScheme.outline.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    isActive ? 'In Progress' : 'Scheduled',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: isActive
                          ? theme.colorScheme.error
                          : theme.colorScheme.outline,
                    ),
                  ),
                ),
              ],
            ),
            if (description != null) ...[
              const SizedBox(height: 8),
              Text(
                description,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: isActive
                      ? theme.colorScheme.onErrorContainer
                      : theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
            const SizedBox(height: 8),
            Text(
              '${scheduledStart.toLocal().toString().split('.').first} — '
              '${scheduledEnd.toLocal().toString().split('.').first}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Builds an all-operational banner.
  static Widget buildAllOperationalBanner(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.green.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.check_circle, color: Colors.green),
          const SizedBox(width: 12),
          Text(
            'All Systems Operational',
            style: theme.textTheme.titleMedium?.copyWith(
              color: Colors.green.shade700,
            ),
          ),
        ],
      ),
    );
  }

  static Color _statusColor(ThemeData theme, String status) {
    switch (status) {
      case 'operational':
        return Colors.green;
      case 'degraded':
        return Colors.orange;
      case 'partial_outage':
        return theme.colorScheme.error;
      case 'major_outage':
        return theme.colorScheme.error;
      case 'maintenance':
        return theme.colorScheme.tertiary;
      default:
        return theme.colorScheme.outline;
    }
  }

  static IconData _statusIcon(String status) {
    switch (status) {
      case 'operational':
        return Icons.check_circle;
      case 'degraded':
        return Icons.warning;
      case 'partial_outage':
        return Icons.error;
      case 'major_outage':
        return Icons.error;
      case 'maintenance':
        return Icons.build;
      default:
        return Icons.help_outline;
    }
  }

  static String _statusLabel(String status) {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'degraded':
        return 'Degraded';
      case 'partial_outage':
        return 'Partial Outage';
      case 'major_outage':
        return 'Major Outage';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  }
}
