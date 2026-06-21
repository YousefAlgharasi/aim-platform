import 'package:flutter/material.dart';

/// Parent Help Center page.
///
/// Same pattern as student HelpCenterPage but tailored for parent role.
/// Reuses shared widget patterns from the support feature.
/// RTL/Arabic ready via Directionality-aware layout.
class ParentHelpCenterPage extends StatelessWidget {
  const ParentHelpCenterPage({super.key});

  static const List<_ParentHelpCategory> _categories = [
    _ParentHelpCategory(
      icon: Icons.child_care,
      title: 'Student Progress',
      description: 'Questions about your child\'s learning progress',
    ),
    _ParentHelpCategory(
      icon: Icons.school,
      title: 'Courses & Content',
      description: 'Help with available courses and learning materials',
    ),
    _ParentHelpCategory(
      icon: Icons.payment,
      title: 'Billing & Payments',
      description: 'Payment issues, subscription plans, and invoices',
    ),
    _ParentHelpCategory(
      icon: Icons.account_circle,
      title: 'Account Management',
      description: 'Manage your account and linked student accounts',
    ),
    _ParentHelpCategory(
      icon: Icons.security,
      title: 'Privacy & Safety',
      description: 'Data privacy, safety settings, and parental controls',
    ),
    _ParentHelpCategory(
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
        title: const Text('Parent Help Center'),
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
    _ParentHelpCategory category,
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

class _ParentHelpCategory {
  final IconData icon;
  final String title;
  final String description;

  const _ParentHelpCategory({
    required this.icon,
    required this.title,
    required this.description,
  });
}
