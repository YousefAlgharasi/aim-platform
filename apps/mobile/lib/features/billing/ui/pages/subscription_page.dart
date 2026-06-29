import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/billing/data/models/billing_models.dart';
import 'package:aim_mobile/features/billing/logic/entity/billing_data.dart';
import 'package:aim_mobile/features/billing/logic/provider/billing_provider.dart';
import 'pricing_page.dart';

class SubscriptionPage extends ConsumerStatefulWidget {
  const SubscriptionPage({super.key});

  @override
  ConsumerState<SubscriptionPage> createState() => _SubscriptionPageState();

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
}

class _SubscriptionPageState extends ConsumerState<SubscriptionPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    ref.read(subscriptionProvider.notifier).load();
    ref.read(pricingProvider.notifier).load();
  }

  Future<void> _refresh() => ref.read(subscriptionProvider.notifier).refresh();

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(subscriptionProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My Subscription')),
      body: SafeArea(
        child: switch (state) {
          AppAsyncLoading() || AppAsyncIdle() => const AIMFullScreenLoading(
              semanticLabel: 'Loading subscription data',
            ),
          AppAsyncFailure(:final message) => AIMFullScreenError(
              message: message,
              onRetry: _load,
            ),
          AppAsyncSuccess(:final data) => _SubscriptionContent(
              data: data,
              onRefresh: _refresh,
            ),
        },
      ),
    );
  }
}

class _SubscriptionContent extends ConsumerWidget {
  const _SubscriptionContent({required this.data, required this.onRefresh});

  final SubscriptionData data;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final subscription = data.currentSubscription;

    if (subscription == null) {
      final pricingState = ref.watch(pricingProvider);
      return RefreshIndicator(
        onRefresh: onRefresh,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Choose Your Plan',
                style: theme.textTheme.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Select the plan that works best for you',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Expanded(
                child: switch (pricingState) {
                  AppAsyncLoading() || AppAsyncIdle() =>
                    const AIMFullScreenLoading(
                      semanticLabel: 'Loading plans',
                    ),
                  AppAsyncFailure(:final message) => AIMFullScreenError(
                      message: message,
                      onRetry: () => ref.read(pricingProvider.notifier).load(),
                    ),
                  AppAsyncSuccess(:final data) => PlansList(data: data),
                },
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildSubscriptionCard(context, theme, ref, subscription),
            const SizedBox(height: 16),
            Text('Your Entitlements', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            Expanded(
              child: data.entitlements.isEmpty
                  ? Center(
                      child: Text(
                        'No entitlements yet.',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    )
                  : ListView.builder(
                      itemCount: data.entitlements.length,
                      itemBuilder: (context, index) {
                        final entitlement = data.entitlements[index];
                        return SubscriptionPage.buildEntitlementTile(
                          context: context,
                          featureKey: entitlement.featureKey,
                          granted: entitlement.granted,
                          usageText: entitlement.usageLimit != null
                              ? '${entitlement.usageCount} / ${entitlement.usageLimit}'
                              : null,
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubscriptionCard(
    BuildContext context,
    ThemeData theme,
    WidgetRef ref,
    SubscriptionModel subscription,
  ) {
    final pricingState = ref.watch(pricingProvider);
    BillingPlanModel? plan;
    if (pricingState is AppAsyncSuccess<PricingData>) {
      for (final p in pricingState.data.plans) {
        if (p.id == subscription.planId) {
          plan = p;
          break;
        }
      }
    }

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
                  plan != null ? 'Current Plan: ${plan.name}' : 'Current Plan',
                  style: theme.textTheme.titleMedium,
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    subscription.status,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onPrimaryContainer,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (subscription.currentPeriodEnd != null)
              Text(
                subscription.cancelAtPeriodEnd
                    ? 'Cancels on ${_formatDate(subscription.currentPeriodEnd!)}'
                    : 'Renews on ${_formatDate(subscription.currentPeriodEnd!)}',
                style: theme.textTheme.bodyMedium,
              ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(context)
                        .pushNamed(AppRoutePaths.pricing),
                    child: const Text('Change Plan'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextButton(
                    onPressed: subscription.cancelAtPeriodEnd
                        ? null
                        : () => _showCancelDialog(context, ref, subscription.id),
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

  void _showCancelDialog(
    BuildContext context,
    WidgetRef ref,
    String subscriptionId,
  ) {
    showDialog<void>(
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
              ref
                  .read(subscriptionProvider.notifier)
                  .cancelSubscription(subscriptionId);
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

  String _formatDate(DateTime date) =>
      '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
}
