// P13-055: Student mobile notification inbox.
//
// Displays in-app notifications fetched from the backend. The backend is
// the sole authority for notification eligibility, delivery state, and
// read/dismissed status — this page only renders what it returns and
// relays read/dismiss requests back to it.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

import '../../logic/entity/notification_entities.dart';
import '../../logic/provider/notification_providers.dart';

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

  void _onMarkAsRead(NotificationEventModel event) {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(notificationInboxProvider.notifier).markAsRead(
          bearerToken: token,
          eventId: event.id,
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

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Notifications'),
      body: SafeArea(
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
                onMarkAsRead: _onMarkAsRead,
                onDismiss: _onDismiss,
              ),
            ),
        },
      ),
    );
  }
}

class _NotificationInboxList extends StatelessWidget {
  const _NotificationInboxList({
    required this.events,
    required this.onMarkAsRead,
    required this.onDismiss,
  });

  final List<NotificationEventModel> events;
  final void Function(NotificationEventModel) onMarkAsRead;
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
          onMarkAsRead: () => onMarkAsRead(event),
          onDismiss: () => onDismiss(event),
        );
      },
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({
    required this.event,
    required this.onMarkAsRead,
    required this.onDismiss,
  });

  final NotificationEventModel event;
  final VoidCallback onMarkAsRead;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isUnread = event.isUnread;

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
        interactive: isUnread,
        onTap: isUnread ? onMarkAsRead : null,
        semanticLabel: isUnread
            ? 'Unread notification: ${event.title}'
            : 'Notification: ${event.title}',
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isUnread)
              Padding(
                padding: const EdgeInsetsDirectional.only(
                  end: AimSpacing.innerGap,
                  top: AimSpacing.space4,
                ),
                child: Icon(
                  Icons.circle,
                  size: 8,
                  color: Theme.of(context).colorScheme.primary,
                  semanticLabel: 'Unread',
                ),
              ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.title ?? '',
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: isUnread ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    event.body ?? '',
                    style: AimTextStyles.bodySm.copyWith(
                      color: surfaces.textSecondary,
                    ),
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
