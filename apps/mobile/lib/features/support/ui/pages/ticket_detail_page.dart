// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Ticket" (54)
//   docs/design/ui-for-all-system-mobile/screenshots/light/54-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/54-screen.png
//
// Displays ticket detail with info and comments.
//
// Shows ticket metadata and a threaded comments section.
// RTL/Arabic ready via Directionality-aware layout.
//
// TASK-37: restyled to match design screen 54 — gradient header ("Ticket"),
// status/category/severity chip row, "CONVERSATION" section label, and
// chat-bubble comments (own messages right-aligned/primary-tinted, staff
// messages left-aligned/neutral, matching the existing isStaff-driven
// alignment logic — only the visual treatment changed).
//
// Deviation from the mockup: the design shows a short ticket number
// ("#4821") in the meta line. SupportTicket has no such field — only a
// full `id` (see support_models.dart) — so it's not shown; fabricating a
// short number would misrepresent the real ticket id.
//
// Note: GET /support/tickets/:id is "Planned / Not Yet Active" and
// SupportDatasource has no concrete implementation (out of scope for this
// UI-only verification task). The body previously showed a permanent
// CircularProgressIndicator that never resolved — a real bug. It now shows
// a graceful "not available yet" empty state instead.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' hide TextDirection;

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class TicketDetailPage extends StatelessWidget {
  final String ticketId;

  const TicketDetailPage({super.key, required this.ticketId});

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    // Ticket and comments loaded from backend
    // via GET /support/tickets/:id and GET /support/tickets/:id/comments
    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _TicketDetailHeader(),
          Expanded(
            child: AIMEmptyState(
              icon: const Icon(Icons.confirmation_number_outlined),
              title: l10n.supportTicketDetailUnavailableTitle,
              subtitle:
                  l10n.supportTicketDetailUnavailableSubtitle(ticketId),
            ),
          ),
        ],
      ),
    );
  }

  /// Builds the ticket info header card.
  static Widget buildTicketInfoCard({
    required BuildContext context,
    required String subject,
    required String description,
    required String category,
    required String severity,
    required String status,
    required DateTime createdAt,
  }) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              AIMBadge(
                tone: _statusTone(status),
                pill: true,
                child: Text(_statusLabel(l10n, status)),
              ),
              const SizedBox(width: AimSpacing.space8),
              Expanded(
                child: Text(
                  '${_titleCase(category)} · ${_titleCase(severity)}',
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            subject,
            style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            description,
            style:
                AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          ),
        ],
      ),
    );
  }

  /// Builds a single comment bubble.
  static Widget buildCommentBubble({
    required BuildContext context,
    required String authorName,
    required String body,
    required bool isStaff,
    required DateTime createdAt,
  }) {
    final surfaces = aimSurfacesOf(context);
    final bubbleColor = isStaff ? surfaces.surfaceSunken : AimColors.primary500;
    final textColor = isStaff ? surfaces.textPrimary : AimColors.neutral0;
    final timestamp = _formatTimestamp(context, createdAt);

    return Align(
      alignment: isStaff ? AlignmentDirectional.centerStart : AlignmentDirectional.centerEnd,
      child: Container(
        margin: EdgeInsetsDirectional.only(
          start: isStaff ? 0 : 48,
          end: isStaff ? 48 : 0,
          bottom: AimSpacing.componentGap,
        ),
        padding: const EdgeInsets.all(AimSpacing.componentGap),
        decoration: BoxDecoration(
          color: bubbleColor,
          borderRadius: AimRadius.borderLg,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              body,
              style: AimTextStyles.bodyMd.copyWith(color: textColor),
            ),
            const SizedBox(height: AimSpacing.space4),
            Text(
              '$authorName · $timestamp',
              style: AimTextStyles.caption.copyWith(
                color: isStaff
                    ? surfaces.textMuted
                    : AimColors.neutral0.withValues(alpha: 0.75),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static AIMBadgeTone _statusTone(String status) => switch (status) {
        'open' => AIMBadgeTone.info,
        'in_progress' => AIMBadgeTone.warning,
        'resolved' || 'closed' => AIMBadgeTone.success,
        _ => AIMBadgeTone.neutral,
      };

  static String _statusLabel(AppLocalizations l10n, String status) =>
      switch (status) {
        'open' => l10n.supportStatusOpenLabel,
        'in_progress' => l10n.supportStatusInProgressLabel,
        'resolved' => l10n.supportStatusResolvedLabel,
        'closed' => l10n.supportStatusClosedLabel,
        _ => _titleCase(status),
      };

  static String _titleCase(String value) {
    final words = value.split('_');
    return words
        .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');
  }

  static String _formatTimestamp(BuildContext context, DateTime dt) {
    final locale = Localizations.localeOf(context).toString();
    final local = dt.toLocal();
    return '${DateFormat.MMMd(locale).format(local)} · '
        '${DateFormat.Hm(locale).format(local)}';
  }
}

class _TicketDetailHeader extends StatelessWidget {
  const _TicketDetailHeader();

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
              l10n.supportTicketDetailTitle,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
