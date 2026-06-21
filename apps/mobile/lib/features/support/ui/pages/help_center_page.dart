import 'package:flutter/material.dart';

/// Student Help Center page.
///
/// Displays help categories and a prominent "Create Ticket" button.
/// RTL/Arabic ready via Directionality-aware layout.
class HelpCenterPage extends StatelessWidget {
  const HelpCenterPage({super.key});

  static const List<_HelpCategory> _categories = [
    _HelpCategory(
      icon: Icons.school,
      title: 'Lessons & Content',
      description: 'Help with courses, lessons, and learning materials',
    ),
    _HelpCategory(
      icon: Icons.assignment,
      title: 'Assessments & Grades',
      description: 'Questions about tests, quizzes, and grading',
    ),
    _HelpCategory(
      icon: Icons.account_circle,
      title: 'Account & Profile',
      description: 'Manage your account settings and profile',
    ),
    _HelpCategory(
      icon: Icons.payment,
      title: 'Billing & Subscription',
      description: 'Payment issues, plans, and invoices',
    ),
    _HelpCategory(
      icon: Icons.bug_report,
      title: 'Technical Issues',
      description: 'App crashes, errors, and performance problems',
    ),
    _HelpCategory(
      icon: Icons.help_outline,
      title: 'General Help',
      description: 'Other questions and general assistance',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Help Center'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16.0),
                children: [
                  Text(
                    'How can we help you?',
                    style: theme.textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Browse categories or create a support ticket.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 24),
                  ..._categories.map(
                    (cat) => _buildCategoryCard(context, theme, cat),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: () {
                    // Navigate to create ticket page
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('Create Ticket'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryCard(
    BuildContext context,
    ThemeData theme,
    _HelpCategory category,
  ) {
    return Card(
      margin: const EdgeInsetsDirectional.only(bottom: 8),
      child: ListTile(
        leading: Icon(
          category.icon,
          color: theme.colorScheme.primary,
        ),
        title: Text(category.title),
        subtitle: Text(category.description),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          // Navigate to filtered help content for this category
        },
      ),
    );
  }
}

class _HelpCategory {
  final IconData icon;
  final String title;
  final String description;

  const _HelpCategory({
    required this.icon,
    required this.title,
    required this.description,
  });
}
