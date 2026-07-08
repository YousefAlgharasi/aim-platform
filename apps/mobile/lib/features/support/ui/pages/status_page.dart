// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "System status" (55)
//   docs/design/ui-for-all-system-mobile/screenshots/light/55-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/55-screen.png
//
// System status and maintenance window page.
//
// Shows operational status per component from backend (GET /status)
// and lists active/upcoming maintenance windows.
// RTL/Arabic ready via Directionality-aware layout.
//
// TASK-37: restyled to match design screen 55 — gradient header ("System
// Status"), a "Release notes" navigation card (real, working route to
// AppRoutePaths.releaseNotes).
//
// Wired to the real GET /operational-status endpoint via
// operationalStatusProvider (SupportRemoteDatasourceImpl). That endpoint
// has no maintenance-windows list (see support_models.dart), so
// buildMaintenanceCard below is kept for a future maintenance-windows
// endpoint but is unused today rather than fed fabricated data.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';

import '../../logic/provider/support_provider.dart';

class StatusPage extends ConsumerStatefulWidget {
  const StatusPage({super.key});

  @override
  ConsumerState<StatusPage> createState() => _StatusPageState();

  /// Builds a component status row with colored indicator.
  static Widget buildComponentStatus({
    required BuildContext context,
    required String component,
    required String status,
    String? message,
  }) {
    final surfaces = aimSurfacesOf(context);
    final color = _statusColor(status);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AimSpacing.space8),
      child: Row(
        children: [
          Container(
            width: AimSpacing.space8,
            height: AimSpacing.space8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: AimSpacing.space8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  component,
                  style: AimTextStyles.bodyMd
                      .copyWith(color: surfaces.textPrimary),
                ),
                if (message != null)
                  Text(
                    message,
                    style: AimTextStyles.caption
                        .copyWith(color: surfaces.textSecondary),
                  ),
              ],
            ),
          ),
          Text(
            _statusLabel(status),
            style: AimTextStyles.bodySm.copyWith(color: color),
          ),
        ],
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
    final surfaces = aimSurfacesOf(context);
    final isActive = status == 'in_progress';

    return AIMCard(
      variant: AIMCardVariant.standard,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isActive ? Icons.engineering : Icons.schedule,
                size: AimSizes.iconSm,
                color: isActive ? AimColors.error500 : surfaces.textSecondary,
              ),
              const SizedBox(width: AimSpacing.space8),
              Expanded(
                child: Text(
                  title,
                  style: AimTextStyles.bodyMd
                      .copyWith(color: surfaces.textPrimary),
                ),
              ),
              AIMBadge(
                tone: isActive ? AIMBadgeTone.error : AIMBadgeTone.neutral,
                pill: true,
                child: Text(isActive ? 'In Progress' : 'Scheduled'),
              ),
            ],
          ),
          if (description != null) ...[
            const SizedBox(height: AimSpacing.space8),
            Text(
              description,
              style: AimTextStyles.bodySm
                  .copyWith(color: surfaces.textSecondary),
            ),
          ],
          const SizedBox(height: AimSpacing.space8),
          Text(
            '${_formatDateTime(scheduledStart)} — '
            '${_formatDateTime(scheduledEnd)}',
            style:
                AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
        ],
      ),
    );
  }

  /// Builds an all-operational banner.
  static Widget buildAllOperationalBanner(BuildContext context) {
    return const AIMAlertBanner(
      tone: AIMAlertTone.success,
      title: 'All Systems Operational',
      semanticLabel: 'All systems operational',
      child: SizedBox.shrink(),
    );
  }

  static Color _statusColor(String status) => switch (status) {
        'operational' => AimColors.success500,
        'degraded' => AimColors.warning500,
        'partial_outage' || 'major_outage' => AimColors.error500,
        'maintenance' => AimColors.info500,
        _ => AimColors.neutral500,
      };

  static String _statusLabel(String status) => switch (status) {
        'operational' => 'Operational',
        'degraded' => 'Degraded',
        'partial_outage' => 'Partial Outage',
        'major_outage' => 'Major Outage',
        'maintenance' => 'Maintenance',
        _ => status,
      };

  static const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  static String _formatDateTime(DateTime dt) {
    final local = dt.toLocal();
    final hour = local.hour.toString().padLeft(2, '0');
    final minute = local.minute.toString().padLeft(2, '0');
    return '${_months[local.month - 1]} ${local.day} · $hour:$minute';
  }
}

class _StatusPageState extends ConsumerState<StatusPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(
      (_) => ref.read(operationalStatusProvider.notifier).load(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final state = ref.watch(operationalStatusProvider);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _StatusHeader(),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.screenPaddingMobile,
                vertical: AimSpacing.sectionGap,
              ),
              children: [
                switch (state) {
                  AppAsyncLoading() || AppAsyncIdle() => const AIMFullScreenLoading(
                      semanticLabel: 'Loading system status',
                    ),
                  AppAsyncFailure(:final message) => AIMFullScreenError(
                      message: message,
                      onRetry: () =>
                          ref.read(operationalStatusProvider.notifier).load(),
                    ),
                  AppAsyncSuccess(:final data) => data.isEmpty
                      ? const AIMEmptyState(
                          icon: Icon(Icons.monitor_heart_outlined),
                          title: 'No components reported',
                          subtitle: 'Nothing to show yet.',
                        )
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (data.every((s) => s.isOperational))
                              StatusPage.buildAllOperationalBanner(context),
                            for (final component in data)
                              StatusPage.buildComponentStatus(
                                context: context,
                                component: component.component,
                                status: component.status,
                                message: component.message,
                              ),
                          ],
                        ),
                },
                const SizedBox(height: AimSpacing.sectionGap),
                AIMCard(
                  interactive: true,
                  onTap: () => context.push(AppRoutePaths.releaseNotes),
                  semanticLabel: "Release notes, what's new in AIM",
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Release notes',
                              style: AimTextStyles.title
                                  .copyWith(color: surfaces.textPrimary),
                            ),
                            const SizedBox(height: AimSpacing.space2),
                            Text(
                              "What's new in AIM",
                              style: AimTextStyles.bodySm
                                  .copyWith(color: surfaces.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.chevron_right,
                        color: surfaces.textMuted,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusHeader extends StatelessWidget {
  const _StatusHeader();

  @override
  Widget build(BuildContext context) {
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
              label: 'Back',
              child: InkWell(
                onTap: () {
                  if (context.canPop()) context.pop();
                },
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
              'System Status',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
