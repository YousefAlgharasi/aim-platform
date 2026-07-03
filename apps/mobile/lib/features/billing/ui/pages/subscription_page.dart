// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Subscription" (44)
//   docs/design/ui-for-all-system-mobile/screenshots/light/44-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/44-screen.png
//
// TASK-26: restyled to match design screen 44 — gradient header
// ("Subscription"), a gradient hero card with the current plan name, an
// "Active"/status badge, and the real renew/cancel date, a "WHAT'S
// INCLUDED" entitlement list, and Invoices / Change plan actions.
//
// Security/data rules:
// - Plan name, status, dates, and entitlements are all backend-supplied;
//   Flutter never invents or computes any of them.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:intl/intl.dart' hide TextDirection;

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/billing/data/models/billing_models.dart';
import 'package:aim_mobile/features/billing/logic/entity/billing_data.dart';
import 'package:aim_mobile/features/billing/logic/provider/billing_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import 'pricing_page.dart';

class SubscriptionPage extends ConsumerStatefulWidget {
  const SubscriptionPage({super.key});

  @override
  ConsumerState<SubscriptionPage> createState() => _SubscriptionPageState();
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
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _SubscriptionHeader(),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() || AppAsyncIdle() => AIMFullScreenLoading(
                  semanticLabel: l10n.billingLoadingSubscriptionSemantic,
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
        ],
      ),
    );
  }
}

class _SubscriptionHeader extends StatelessWidget {
  const _SubscriptionHeader();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: l10n.commonBack,
              child: InkWell(
                onTap: () => context.pop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              l10n.billingSubscriptionTitle,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
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
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final subscription = data.currentSubscription;

    if (subscription == null) {
      final pricingState = ref.watch(pricingProvider);
      return RefreshIndicator(
        onRefresh: onRefresh,
        child: switch (pricingState) {
          AppAsyncLoading() || AppAsyncIdle() => AIMFullScreenLoading(
              semanticLabel: l10n.billingLoadingPlansSemantic,
            ),
          AppAsyncFailure(:final message) => AIMFullScreenError(
              message: message,
              onRetry: () => ref.read(pricingProvider.notifier).load(),
            ),
          AppAsyncSuccess(:final data) => PlansList(data: data),
        },
      );
    }

    BillingPlanModel? plan;
    final pricingState = ref.watch(pricingProvider);
    if (pricingState is AppAsyncSuccess<PricingData>) {
      for (final p in pricingState.data.plans) {
        if (p.id == subscription.planId) {
          plan = p;
          break;
        }
      }
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        children: [
          _CurrentPlanCard(plan: plan, subscription: subscription),
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            l10n.billingWhatsIncludedTitle,
            style: AimTextStyles.label.copyWith(
              color: surfaces.textMuted,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          if (data.entitlements.isEmpty)
            AIMCard(
              child: Center(
                child: Text(
                  l10n.billingNoEntitlementsYet,
                  style:
                      AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
                ),
              ),
            )
          else
            AIMCard(
              padded: false,
              child: Column(
                children: [
                  for (final entitlement in data.entitlements)
                    _EntitlementRow(entitlement: entitlement),
                ],
              ),
            ),
          const SizedBox(height: AimSpacing.sectionGap),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => context.push(AppRoutePaths.invoiceHistory),
                  child: Text(l10n.billingInvoicesLabel),
                ),
              ),
              const SizedBox(width: AimSpacing.componentGap),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => context.push(AppRoutePaths.pricing),
                  child: Text(l10n.billingChangePlanButton),
                ),
              ),
            ],
          ),
          if (!subscription.cancelAtPeriodEnd) ...[
            const SizedBox(height: AimSpacing.componentGap),
            TextButton(
              onPressed: () => _showCancelDialog(context, ref, subscription.id),
              style: TextButton.styleFrom(foregroundColor: AimColors.error500),
              child: Text(l10n.billingCancelSubscriptionButton),
            ),
          ],
        ],
      ),
    );
  }

  void _showCancelDialog(
    BuildContext context,
    WidgetRef ref,
    String subscriptionId,
  ) {
    final l10n = AppLocalizations.of(context);
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.billingCancelDialogTitle),
        content: Text(l10n.billingCancelDialogBody),
        actions: [
          TextButton(
            onPressed: () => ctx.pop(),
            child: Text(l10n.billingKeepSubscriptionButton),
          ),
          TextButton(
            onPressed: () {
              ctx.pop();
              ref
                  .read(subscriptionProvider.notifier)
                  .cancelSubscription(subscriptionId);
            },
            style: TextButton.styleFrom(foregroundColor: AimColors.error500),
            child: Text(l10n.commonCancel),
          ),
        ],
      ),
    );
  }
}

/// Gradient hero card mirroring design screen 44's "Current plan" panel.
class _CurrentPlanCard extends StatelessWidget {
  const _CurrentPlanCard({required this.plan, required this.subscription});

  final BillingPlanModel? plan;
  final SubscriptionModel subscription;

  String _formatDate(BuildContext context, DateTime date) {
    return DateFormat.yMMMd(
      Localizations.localeOf(context).toString(),
    ).format(date);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final price = plan?.price;
    String? subtitle;
    if (subscription.currentPeriodEnd != null) {
      final dateStr = _formatDate(context, subscription.currentPeriodEnd!);
      final base = subscription.cancelAtPeriodEnd
          ? l10n.billingCancelsOnLabel(dateStr)
          : l10n.billingRenewsOnLabel(dateStr);
      subtitle = price != null
          ? '$base · ${price.formattedAmount}/${price.billingInterval}'
          : base;
    }

    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: AimGradients.gzHero,
        borderRadius: AimRadius.borderX2l,
      ),
      child: Padding(
        padding: AimSpacing.card,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.billingCurrentPlanLabel,
                        style: AimTextStyles.bodySm.copyWith(
                          color: AimColors.neutral0.withValues(alpha: 0.85),
                        ),
                      ),
                      const SizedBox(height: AimSpacing.space4),
                      Text(
                        plan?.name ?? l10n.billingSubscriptionTitle,
                        style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                AIMBadge(
                  tone: subscription.isActive
                      ? AIMBadgeTone.success
                      : AIMBadgeTone.neutral,
                  variant: AIMBadgeVariant.solid,
                  pill: true,
                  child: Text(subscription.status),
                ),
              ],
            ),
            if (subtitle != null) ...[
              const SizedBox(height: AimSpacing.space8),
              Text(
                subtitle,
                style: AimTextStyles.bodySm.copyWith(
                  color: AimColors.neutral0.withValues(alpha: 0.85),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _EntitlementRow extends StatelessWidget {
  const _EntitlementRow({required this.entitlement});

  final EntitlementModel entitlement;

  String _humanizeFeatureKey(String key) {
    final words = key.split('_').where((w) => w.isNotEmpty);
    return words
        .map((w) => '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final usageText = entitlement.usageLimit != null
        ? '${entitlement.usageCount} / ${entitlement.usageLimit}'
        : null;

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.space16,
        vertical: AimSpacing.space12,
      ),
      child: Row(
        children: [
          Icon(
            entitlement.granted ? Icons.check : Icons.close,
            size: AimSizes.iconSm,
            color: entitlement.granted
                ? AimColors.success500
                : surfaces.textMuted,
          ),
          const SizedBox(width: AimSpacing.space12),
          Expanded(
            child: Text(
              _humanizeFeatureKey(entitlement.featureKey),
              style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary),
            ),
          ),
          if (usageText != null)
            Text(
              usageText,
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            ),
        ],
      ),
    );
  }
}
