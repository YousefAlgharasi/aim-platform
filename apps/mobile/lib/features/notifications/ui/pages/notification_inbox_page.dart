// P13-055: Student mobile notification inbox.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Notifications" (39)
//   docs/design/ui-for-all-system-mobile/screenshots/light/39-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/39-screen.png
// Endpoints: GET /api/v1/notifications/inbox,
//   PATCH /api/v1/notifications/:id/read, PATCH /api/v1/notifications/:id/dismiss
//
// Displays in-app notifications fetched from the backend. The backend is
// the sole authority for notification eligibility, delivery state, and
// read/dismissed status — this page only renders what it returns and
// relays read/dismiss requests back to it.
//
// TASK-25: restyled to match design screen 39 — gradient header (back +
// "Notifications" + settings gear linking to notification preferences),
// tiles with unread dot, title, relative-time label, body, and a soft
// category chip.
//
// Deviations from the mockup (real-data-only rules):
// - The design's "Mark all read" link is OMITTED — the backend has no bulk
//   mark-all-read endpoint (per-event read/dismiss only). The same omission
//   was made deliberately for the home page's notifications sheet
//   (`onMarkAllRead` left unwired there for the same reason).
// - The design's subtle tinted background on unread tiles is OMITTED —
//   AIMCard exposes no background-color parameter, and a bespoke tinted card
//   would diverge from the shared widget for a purely decorative cue the
//   unread dot + bold title already provide. Minor styling deviation.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

import '../../logic/entity/notification_entities.dart';
import '../../logic/provider/notification_providers.dart';
import 'notification_detail_page.dart';

/// Computes a real relative-time label (e.g. "1h ago", "Yesterday") from
/// the backend-supplied `createdAt` ISO timestamp. Mirrors the home page's
/// private `_relativeTimeLabel` helper — a small real computation from real
/// data, not a fabricated value.
String _relativeTimeLabel(String createdAtIso) {
  final createdAt = DateTime.tryParse(createdAtIso);
  if (createdAt == null) return '';

  final diff = DateTime.now().toUtc().difference(createdAt.toUtc());
  if (diff.inMinutes < 1) return 'Just now';
  if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
  if (diff.inHours < 24) return '${diff.inHours}h ago';
  if (diff.inDays == 1) return 'Yesterday';
  if (diff.inDays < 7) return '${diff.inDays}d ago';
  return '${diff.inDays ~/ 7}w ago';
}

/// Display-only first-letter capitalisation of the REAL backend category
/// value (e.g. 'assessment' → 'Assessment'). Mirrors achievements_page.dart's
/// `_titleCase`; the underlying value is never altered or remapped.
String _titleCase(String value) {
  if (value.isEmpty) return value;
  return value[0].toUpperCase() + value.substring(1);
}

class NotificationInboxPage extends ConsumerStatefulWidget {
  const NotificationInboxPage({super.key});

  @override
  ConsumerState<NotificationInboxPage> createState() =>
      _NotificationInboxPageState();
}

class _NotificationInboxPageState
    extends ConsumerState<NotificationInboxPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(notificationInboxProvider.notifier).load(bearerToken: token);
  }

  void _onOpen(NotificationEventModel event) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => NotificationDetailPage(event: event),
      ),
    );
  }

  void _onDismiss(NotificationEventModel event) {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(notificationInboxProvider.notifier).dismiss(
          bearerToken: token,
          eventId: event.id,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationInboxProvider);

    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _NotificationsHeader(),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() ||
              AppAsyncIdle() =>
                const AIMFullScreenLoading(
                  semanticLabel: 'Loading notifications',
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: _load,
                ),
              AppAsyncSuccess(:final data) => RefreshIndicator(
                  onRefresh: () async => _load(),
                  child: _NotificationInboxList(
                    events: data,
                    onOpen: _onOpen,
                    onDismiss: _onDismiss,
                  ),
                ),
            },
          ),
        ],
      ),
    );
  }
}

// ── Gradient header ─────────────────────────────────────────────────────────

/// Hero header mirroring [DeadlinesPage]'s back-button/title pattern
/// (design screen 39's top bar), plus a trailing settings gear that opens
/// the notification preferences screen.
class _NotificationsHeader extends StatelessWidget {
  const _NotificationsHeader();

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
                onTap: () => Navigator.of(context).maybePop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.arrow_back,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Expanded(
              child: Text(
                'Notifications',
                style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Semantics(
              button: true,
              label: 'Notification settings',
              child: InkWell(
                onTap: () => Navigator.of(context)
                    .pushNamed(AppRoutePaths.notificationPreferences),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.settings_outlined,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Body content ────────────────────────────────────────────────────────────

class _NotificationInboxList extends StatelessWidget {
  const _NotificationInboxList({
    required this.events,
    required this.onOpen,
    required this.onDismiss,
  });

  final List<NotificationEventModel> events;
  final void Function(NotificationEventModel) onOpen;
  final void Function(NotificationEventModel) onDismiss;

  @override
  Widget build(BuildContext context) {
    final visible =
        events.where((event) => event.dismissedAt == null).toList();

    if (visible.isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.notifications_none_rounded),
        title: 'No notifications yet',
        subtitle:
            'Session reminders and progress updates will appear here.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      itemCount: visible.length,
      separatorBuilder: (_, __) =>
          const SizedBox(height: AimSpacing.listItemGap),
      itemBuilder: (context, index) {
        final event = visible[index];
        return _NotificationTile(
          event: event,
          onOpen: () => onOpen(event),
          onDismiss: () => onDismiss(event),
        );
      },
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({
    required this.event,
    required this.onOpen,
    required this.onDismiss,
  });

  final NotificationEventModel event;
  final VoidCallback onOpen;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isUnread = event.isUnread;
    final timeLabel = _relativeTimeLabel(event.createdAt);

    return Dismissible(
      key: ValueKey(event.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onDismiss(),
      background: Container(
        alignment: AlignmentDirectional.centerEnd,
        padding: const EdgeInsetsDirectional.only(
          end: AimSpacing.screenPaddingMobile,
        ),
        child: Icon(
          Icons.delete_outline_rounded,
          color: surfaces.textSecondary,
          semanticLabel: 'Dismiss notification',
        ),
      ),
      child: AIMCard(
        variant: AIMCardVariant.elevated,
        interactive: true,
        onTap: onOpen,
        semanticLabel: isUnread
            ? 'Unread notification: ${event.title}'
            : 'Notification: ${event.title}',
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isUnread)
              const Padding(
                padding: EdgeInsetsDirectional.only(
                  end: AimSpacing.innerGap,
                  top: AimSpacing.space4,
                ),
                child: Icon(
                  Icons.circle,
                  size: AimSpacing.space8,
                  color: AimColors.primary500,
                  semanticLabel: 'Unread',
                ),
              ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          event.title ?? '',
                          style: AimTextStyles.bodyMd.copyWith(
                            color: surfaces.textPrimary,
                            fontWeight:
                                isUnread ? FontWeight.w600 : FontWeight.w400,
                          ),
                        ),
                      ),
                      if (timeLabel.isNotEmpty) ...[
                        const SizedBox(width: AimSpacing.space8),
                        Text(
                          timeLabel,
                          style: AimTextStyles.caption.copyWith(
                            color: surfaces.textMuted,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    event.body ?? '',
                    style: AimTextStyles.bodySm.copyWith(
                      color: surfaces.textSecondary,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space8),
                  AIMBadge(
                    tone: AIMBadgeTone.neutral,
                    variant: AIMBadgeVariant.soft,
                    pill: true,
                    child: Text(_titleCase(event.category)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
