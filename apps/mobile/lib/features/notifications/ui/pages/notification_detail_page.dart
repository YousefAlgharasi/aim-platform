// P13-056: Student mobile notification detail UI.
//
// Shows the full rendered notification (title/body) along with safe
// metadata (channel, category, status, timestamps) and lets the student
// mark as read or dismiss. The backend remains the sole authority on
// read/dismissed state; this page only displays what it returns.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Notification" (40)
//   docs/design/ui-for-all-system-mobile/screenshots/light/40-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/40-screen.png
//
// TASK-31: restyled to match design screen 40 — gradient header, flat
// (cardless) title/timestamp/body layout, category chip title-cased.
//
// Deviation from the mockup: the design's primary button reads "Start
// review" and its example notification is a review reminder specifically.
// This screen renders ANY notification category (assessment, billing,
// system, etc. — see NotificationEventModel.category), so a category-
// specific action label would misrepresent non-review notifications. The
// generic, always-correct "Mark as read" / "Dismiss" actions are kept.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import '../../logic/entity/notification_entities.dart';
import '../../logic/provider/notification_providers.dart';

/// Real relative-time label from the backend-supplied `createdAt`
/// timestamp. Same helper as notification_inbox_page.dart's
/// `_relativeTimeLabel`.
String _relativeTimeLabel(AppLocalizations l10n, String createdAtIso) {
  final createdAt = DateTime.tryParse(createdAtIso);
  if (createdAt == null) return '';

  final diff = DateTime.now().toUtc().difference(createdAt.toUtc());
  if (diff.inMinutes < 1) return l10n.commonJustNow;
  if (diff.inMinutes < 60) return l10n.homeMinutesAgoLabel(diff.inMinutes);
  if (diff.inHours < 24) return l10n.homeHoursAgoLabel(diff.inHours);
  if (diff.inDays == 1) return l10n.commonYesterday;
  if (diff.inDays < 7) return l10n.homeDaysAgoLabel(diff.inDays);
  return l10n.homeWeeksAgoLabel(diff.inDays ~/ 7);
}

/// Display-only first-letter capitalisation of the REAL backend category
/// value. Same helper as notification_inbox_page.dart's `_titleCase`.
String _titleCase(String value) {
  if (value.isEmpty) return value;
  return value[0].toUpperCase() + value.substring(1);
}

class NotificationDetailPage extends ConsumerStatefulWidget {
  const NotificationDetailPage({required this.event, super.key});

  final NotificationEventModel event;

  @override
  ConsumerState<NotificationDetailPage> createState() =>
      _NotificationDetailPageState();
}

class _NotificationDetailPageState
    extends ConsumerState<NotificationDetailPage> {
  late NotificationEventModel _event;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _event = widget.event;
    if (_event.isUnread) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _markAsRead());
    }
  }

  Future<void> _markAsRead() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty || _busy) return;

    setState(() => _busy = true);
    try {
      final repository = ref.read(notificationRepositoryProvider);
      final updated = await repository.markAsRead(token, _event.id);
      if (mounted) setState(() => _event = updated);
      ref.read(notificationInboxProvider.notifier).markAsRead(
            bearerToken: token,
            eventId: _event.id,
          );
    } catch (_) {
      // Best-effort: the inbox list will re-sync on next load.
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _dismiss() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty || _busy) return;

    setState(() => _busy = true);
    try {
      final repository = ref.read(notificationRepositoryProvider);
      final updated = await repository.dismiss(token, _event.id);
      if (mounted) setState(() => _event = updated);
      ref.read(notificationInboxProvider.notifier).dismiss(
            bearerToken: token,
            eventId: _event.id,
          );
      if (mounted) context.pop();
    } catch (_) {
      // Best-effort: the inbox list will re-sync on next load.
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final isDismissed = _event.dismissedAt != null;
    final timeLabel = _relativeTimeLabel(l10n, _event.createdAt);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _NotificationDetailHeader(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsetsDirectional.fromSTEB(
                AimSpacing.screenPaddingMobile,
                AimSpacing.sectionGap,
                AimSpacing.screenPaddingMobile,
                AimSpacing.sectionGap,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Wrap(
                    spacing: AimSpacing.innerGap,
                    runSpacing: AimSpacing.innerGap,
                    children: [
                      AIMBadge(
                        tone: AIMBadgeTone.primary,
                        variant: AIMBadgeVariant.soft,
                        pill: true,
                        child: Text(_titleCase(_event.category)),
                      ),
                      AIMBadge(
                        tone: _event.isUnread
                            ? AIMBadgeTone.info
                            : AIMBadgeTone.success,
                        variant: AIMBadgeVariant.soft,
                        pill: true,
                        child: Text(
                          _event.isUnread
                              ? l10n.notificationsUnreadLabel
                              : l10n.notificationsReadLabel,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AimSpacing.componentGap),
                  Text(
                    _event.title ?? '',
                    style:
                        AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
                  ),
                  if (timeLabel.isNotEmpty) ...[
                    const SizedBox(height: AimSpacing.space4),
                    Text(
                      timeLabel,
                      style: AimTextStyles.bodySm
                          .copyWith(color: surfaces.textSecondary),
                    ),
                  ],
                  const SizedBox(height: AimSpacing.componentGap),
                  Text(
                    _event.body ?? '',
                    style: AimTextStyles.bodyMd
                        .copyWith(color: surfaces.textSecondary),
                  ),
                  const SizedBox(height: AimSpacing.sectionGap),
                  if (!isDismissed) ...[
                    AIMButton(
                      onPressed: _busy ? null : _markAsRead,
                      variant: AIMButtonVariant.secondary,
                      child: Text(
                        _event.isUnread
                            ? l10n.notificationsMarkAsReadLabel
                            : l10n.notificationsReadLabel,
                      ),
                    ),
                    const SizedBox(height: AimSpacing.innerGap),
                    AIMButton(
                      onPressed: _busy ? null : _dismiss,
                      variant: AIMButtonVariant.ghost,
                      child: Text(l10n.notificationsDismissLabel),
                    ),
                  ] else
                    AIMAlertBanner(
                      tone: AIMAlertTone.info,
                      title: l10n.notificationsDismissedTitle,
                      child: Text(l10n.notificationsDismissedBody),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NotificationDetailHeader extends StatelessWidget {
  const _NotificationDetailHeader();

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
              label: AppLocalizations.of(context).commonBack,
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
              AppLocalizations.of(context).notificationsDetailTitle,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
