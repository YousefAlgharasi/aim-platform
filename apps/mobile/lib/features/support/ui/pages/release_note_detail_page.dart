import 'package:flutter/material.dart';

/// Displays a single release note's full detail.
///
/// Shows version, title, and body content.
/// RTL/Arabic ready via Directionality-aware layout.
class ReleaseNoteDetailPage extends StatelessWidget {
  final String noteId;

  const ReleaseNoteDetailPage({super.key, required this.noteId});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Release note loaded from backend via GET /release-notes/:id
    return Scaffold(
      appBar: AppBar(
        title: const Text('Release Note'),
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

  /// Builds the release note detail view with version badge, title, and body.
  static Widget buildNoteDetail({
    required BuildContext context,
    required String version,
    required String title,
    required String body,
    required DateTime publishedAt,
  }) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: theme.colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              'Version $version',
              style: theme.textTheme.titleSmall?.copyWith(
                color: theme.colorScheme.onPrimaryContainer,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: theme.textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Published: ${publishedAt.toLocal().toString().split(' ').first}',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            body,
            style: theme.textTheme.bodyLarge,
          ),
        ],
      ),
    );
  }
}
