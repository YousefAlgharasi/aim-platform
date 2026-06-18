// Phase 6 — P6-112
// NotificationsPlaceholderPage — skeleton placeholder for the Notifications
// feature.
//
// Notification delivery, read/unread state, and push token management are
// backend-owned. Flutter NEVER computes these locally.
//
// RTL/Arabic rules:
// - AIMTopAppBar handles back-icon mirroring internally.
// - MainShellPlaceholderCard uses AIMCard which respects Directionality.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/shell/ui/widgets/main_shell_placeholder_card.dart';

/// Skeleton placeholder for the Notifications feature.
///
/// Replace with the real Notifications page when the feature is implemented.
class NotificationsPlaceholderPage extends StatelessWidget {
  const NotificationsPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AIMTopAppBar(title: 'Notifications'),
      body: MainShellPlaceholderCard(
        title: 'Notifications',
        description:
            'Notification centre placeholder. '
            'Delivery and read state are backend-owned.',
      ),
    );
  }
}
