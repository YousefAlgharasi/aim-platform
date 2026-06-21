import 'package:flutter/material.dart';

class SubscriptionPage extends StatelessWidget {
  const SubscriptionPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Subscription and entitlement data loaded from backend
    // via GET /billing/subscriptions — backend is the authority
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Subscription'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildSubscriptionCard(context, theme),
              const SizedBox(height: 16),
              Text(
                'Your Entitlements',
                style: theme.textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Expanded(
                child: _buildEntitlementsList(context, theme),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSubscriptionCard(BuildContext context, ThemeData theme) {
    // Will be populated with backend-approved subscription data
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Current Plan',
                  style: theme.textTheme.titleMedium,
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'Active',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onPrimaryContainer,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      // Navigate to pricing page for plan change
                    },
                    child: const Text('Change Plan'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextButton(
                    onPressed: () {
                      _showCancelDialog(context);
                    },
                    style: TextButton.styleFrom(
                      foregroundColor: theme.colorScheme.error,
                    ),
                    child: const Text('Cancel'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEntitlementsList(BuildContext context, ThemeData theme) {
    // Will be populated with backend-approved entitlements
    return const Center(
      child: CircularProgressIndicator(),
    );
  }

  static Widget buildEntitlementTile({
    required BuildContext context,
    required String featureKey,
    required bool granted,
    String? usageText,
  }) {
    final theme = Theme.of(context);
    return ListTile(
      leading: Icon(
        granted ? Icons.check_circle : Icons.cancel,
        color: granted ? theme.colorScheme.primary : theme.colorScheme.outline,
      ),
      title: Text(featureKey),
      subtitle: usageText != null ? Text(usageText) : null,
    );
  }

  static Widget buildNoSubscriptionState(BuildContext context, {VoidCallback? onViewPlans}) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.card_membership,
            size: 64,
            color: theme.colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No Active Subscription',
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Subscribe to unlock premium features.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          if (onViewPlans != null)
            FilledButton(
              onPressed: onViewPlans,
              child: const Text('View Plans'),
            ),
        ],
      ),
    );
  }

  void _showCancelDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel Subscription?'),
        content: const Text(
          'Your subscription will remain active until the end of the current billing period.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Keep Subscription'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              // Call POST /billing/subscriptions/:id/cancel via repository
            },
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }
}
