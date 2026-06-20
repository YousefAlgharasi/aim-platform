// P13-059: Reusable notification bell button with an unread-count badge.
//
// Drop into an [AIMTopAppBar.actions] list to give students quick access
// to the inbox with a discoverable unread indicator. The badge count is
// always backend-sourced; this widget never computes unread state itself.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

import '../../logic/provider/notification_providers.dart';
import '../pages/notification_inbox_page.dart';

class NotificationBellButton extends ConsumerStatefulWidget {
  const NotificationBellButton({super.key});

  @override
  ConsumerState<NotificationBellButton> createState() =>
      _NotificationBellButtonState();
}

class _NotificationBellButtonState
    extends ConsumerState<NotificationBellButton> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(notificationUnreadCountProvider.notifier).load(bearerToken: token);
  }

  Future<void> _openInbox() async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => const NotificationInboxPage(),
      ),
    );
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final unreadState = ref.watch(notificationUnreadCountProvider);
    final unreadCount =
        unreadState is AppAsyncSuccess<int> ? unreadState.data : 0;

    return Semantics(
      label: unreadCount > 0
          ? 'Notifications, $unreadCount unread'
          : 'Notifications',
      button: true,
      child: IconButton(
        icon: Badge(
          isLabelVisible: unreadCount > 0,
          label: Text(unreadCount > 99 ? '99+' : '$unreadCount'),
          child: const Icon(Icons.notifications_outlined),
        ),
        tooltip: 'Notifications',
        onPressed: _openInbox,
      ),
    );
  }
}
