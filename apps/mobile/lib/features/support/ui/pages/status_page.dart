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
// Note on which endpoint this calls: this screen's data comes from
// SupportDatasource.getOperationalStatus() (GET /status) — the SAME
// unimplemented interface as the other support screens (createTicket,
// feedback, ticketList, ticketDetail), NOT the backend's real /health
// endpoint (services/backend-api/src/health/health.controller.ts), which
// this screen never calls. So it's blocked the same way as the rest, not
// exempt — confirmed per this task's note to check before assuming.
// SupportDatasource has no concrete implementation (out of scope for this
// UI-only verification task). The body previously showed a permanent
// CircularProgressIndicator that never resolved — a real bug. It now shows
// a graceful "not available yet" empty state instead.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' hide TextDirection;

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class StatusPage extends StatelessWidget {
  const StatusPage({super.key});

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    // Status data loaded from backend via GET /status
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
                AIMEmptyState(
                  icon: const Icon(Icons.monitor_heart_outlined),
                  title: l10n.supportStatusUnavailableTitle,
                  subtitle: l10n.supportStatusUnavailableSubtitle,
                ),
                const SizedBox(height: AimSpacing.sectionGap),
                AIMCard(
                  interactive: true,
                  onTap: () => context.push(AppRoutePaths.releaseNotes),
                  semanticLabel: l10n.supportReleaseNotesCardSemantic,
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n.supportReleaseNotesTitle,
                              style: AimTextStyles.title
                                  .copyWith(color: surfaces.textPrimary),
                            ),
                            const SizedBox(height: AimSpacing.space2),
                            Text(
                              l10n.supportWhatsNewSubtitle,
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

  /// Builds a component status row with colored indicator.
  static Widget buildComponentStatus({
    required BuildContext context,
    required String component,
    required String status,
    String? message,
  }) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
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
            _statusLabel(l10n, status),
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
    final l10n = AppLocalizations.of(context);
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
                child: Text(isActive
                    ? l10n.supportStatusInProgressLabel
                    : l10n.supportStatusScheduledLabel),
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
            '${_formatDateTime(context, scheduledStart)} — '
            '${_formatDateTime(context, scheduledEnd)}',
            style:
                AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
        ],
      ),
    );
  }

  /// Builds an all-operational banner.
  static Widget buildAllOperationalBanner(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AIMAlertBanner(
      tone: AIMAlertTone.success,
      title: l10n.supportAllSystemsOperationalTitle,
      semanticLabel: l10n.supportAllSystemsOperationalTitle,
      child: const SizedBox.shrink(),
    );
  }

  static Color _statusColor(String status) => switch (status) {
        'operational' => AimColors.success500,
        'degraded' => AimColors.warning500,
        'partial_outage' || 'major_outage' => AimColors.error500,
        'maintenance' => AimColors.info500,
        _ => AimColors.neutral500,
      };

  static String _statusLabel(AppLocalizations l10n, String status) =>
      switch (status) {
        'operational' => l10n.supportStatusOperational,
        'degraded' => l10n.supportStatusDegraded,
        'partial_outage' => l10n.supportStatusPartialOutage,
        'major_outage' => l10n.supportStatusMajorOutage,
        'maintenance' => l10n.supportStatusMaintenanceLabel,
        _ => status,
      };

  static String _formatDateTime(BuildContext context, DateTime dt) {
    final locale = Localizations.localeOf(context).toString();
    final local = dt.toLocal();
    return '${DateFormat.MMMd(locale).format(local)} · '
        '${DateFormat.Hm(locale).format(local)}';
  }
}

class _StatusHeader extends StatelessWidget {
  const _StatusHeader();

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
              l10n.supportSystemStatusTitle,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
