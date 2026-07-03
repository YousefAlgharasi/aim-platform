// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "My tickets" (52)
//   docs/design/ui-for-all-system-mobile/screenshots/light/52-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/52-screen.png
//
// Displays the user's support tickets fetched from backend.
//
// Shows loading, empty, and populated states.
// RTL/Arabic ready via Directionality-aware layout.
//
// TASK-36: restyled to match design screen 52 — gradient header ("My
// tickets"), ticket cards with a status pill, gradient FAB (replacing the
// old header icon button) to create a new ticket, wired to
// AppRoutePaths.createTicket.
//
// Note: GET /support/tickets is "Planned / Not Yet Active" and
// SupportDatasource has no concrete implementation (out of scope for this
// UI-only verification task). Previously `_buildTicketList` returned a
// permanent `CircularProgressIndicator` that never resolved to anything —
// a real bug, not a "loading state." Since there's no way to load real
// tickets, the empty state is shown directly instead of an infinite
// spinner, which is the honest state absent live data.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' hide TextDirection;

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class TicketListPage extends StatelessWidget {
  const TicketListPage({super.key});

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    // Ticket data loaded from backend via GET /support/tickets
    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _TicketListHeader(title: l10n.supportMyTicketsTitle),
          Expanded(child: buildEmptyState(context)),
        ],
      ),
      floatingActionButton: AIMFab(
        semanticLabel: l10n.supportCreateTicketSemantic,
        onPressed: () => context.push(AppRoutePaths.createTicket),
        icon: const Icon(Icons.add),
      ),
    );
  }

  /// Builds a single ticket list item card.
  static Widget buildTicketTile({
    required BuildContext context,
    required String ticketId,
    required String subject,
    required String status,
    required String category,
    required String severity,
    required DateTime createdAt,
    VoidCallback? onTap,
  }) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
      ),
      child: Padding(
        padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
        child: AIMCard(
          interactive: onTap != null,
          onTap: onTap,
          semanticLabel: l10n.supportTicketTileSemantic(subject, status),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      subject,
                      style: AimTextStyles.title
                          .copyWith(color: surfaces.textPrimary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AimSpacing.space2),
                    Text(
                      '${_formatDate(context, createdAt)} · $category · '
                      '$severity',
                      style: AimTextStyles.bodySm
                          .copyWith(color: surfaces.textSecondary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AimSpacing.space8),
              _buildStatusChip(context, status),
            ],
          ),
        ),
      ),
    );
  }

  /// Builds an empty state when no tickets exist.
  static Widget buildEmptyState(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AIMEmptyState(
      icon: const Icon(Icons.confirmation_number_outlined),
      title: l10n.supportNoTicketsTitle,
      subtitle: l10n.supportNoTicketsSubtitle,
    );
  }

  static Widget _buildStatusChip(BuildContext context, String status) {
    final AIMBadgeTone tone = switch (status) {
      'open' => AIMBadgeTone.info,
      'in_progress' => AIMBadgeTone.warning,
      'resolved' || 'closed' => AIMBadgeTone.success,
      _ => AIMBadgeTone.neutral,
    };
    return AIMBadge(
      tone: tone,
      pill: true,
      child: Text(_statusLabel(AppLocalizations.of(context), status)),
    );
  }

  static String _statusLabel(AppLocalizations l10n, String status) =>
      switch (status) {
        'open' => l10n.supportStatusOpenLabel,
        'in_progress' => l10n.supportStatusInProgressLabel,
        'resolved' => l10n.supportStatusResolvedLabel,
        'closed' => l10n.supportStatusClosedLabel,
        _ => status
            .split('_')
            .map((w) =>
                w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
            .join(' '),
      };

  static String _formatDate(BuildContext context, DateTime date) {
    return DateFormat.yMMMd(
      Localizations.localeOf(context).toString(),
    ).format(date);
  }
}

class _TicketListHeader extends StatelessWidget {
  const _TicketListHeader({required this.title});

  final String title;

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
              title,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
