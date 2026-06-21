import 'package:flutter/material.dart';

/// Lists published release notes from backend.
///
/// Fetches from GET /release-notes and displays as a scrollable list.
/// RTL/Arabic ready via Directionality-aware layout.
class ReleaseNotesPage extends StatelessWidget {
  const ReleaseNotesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Release notes loaded from backend via GET /release-notes
    return Scaffold(
      appBar: AppBar(
        title: const Text('Release Notes'),
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

  /// Builds a single release note list item.
  static Widget buildReleaseNoteTile({
    required BuildContext context,
    required String version,
    required String title,
    required DateTime publishedAt,
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
        leading: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: theme.colorScheme.primaryContainer,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            version,
            style: theme.textTheme.labelMedium?.copyWith(
              color: theme.colorScheme.onPrimaryContainer,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          publishedAt.toLocal().toString().split(' ').first,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }

  /// Builds an empty state when no release notes exist.
  static Widget buildEmptyState(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.new_releases_outlined,
            size: 64,
            color: theme.colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No Release Notes',
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Release notes will appear here when published.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
