// P13-056: Student mobile notification detail UI.
//
// Shows the full rendered notification (title/body) along with safe
// metadata (channel, category, status, timestamps) and lets the student
// mark as read or dismiss. The backend remains the sole authority on
// read/dismissed state; this page only displays what it returns.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

import '../../logic/entity/notification_entities.dart';
import '../../logic/provider/notification_providers.dart';

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
      if (mounted) Navigator.of(context).pop();
    } catch (_) {
      // Best-effort: the inbox list will re-sync on next load.
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isDismissed = _event.dismissedAt != null;

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Notification'),
      body: SafeArea(
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
                    tone: AIMBadgeTone.neutral,
                    variant: AIMBadgeVariant.soft,
                    pill: true,
                    child: Text(_event.category),
                  ),
                  AIMBadge(
                    tone: _event.isUnread
                        ? AIMBadgeTone.info
                        : AIMBadgeTone.neutral,
                    variant: AIMBadgeVariant.soft,
                    pill: true,
                    child: Text(_event.isUnread ? 'Unread' : 'Read'),
                  ),
                ],
              ),

              const SizedBox(height: AimSpacing.sectionGap),

              AIMCard(
                variant: AIMCardVariant.elevated,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _event.title ?? '',
                      style: AimTextStyles.h2.copyWith(
                        color: surfaces.textPrimary,
                      ),
                    ),
                    const SizedBox(height: AimSpacing.componentGap),
                    Text(
                      _event.body ?? '',
                      style: AimTextStyles.bodyMd.copyWith(
                        color: surfaces.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AimSpacing.sectionGap),

              if (!isDismissed) ...[
                AIMButton(
                  onPressed: _busy ? null : _markAsRead,
                  variant: AIMButtonVariant.secondary,
                  child: Text(_event.isUnread ? 'Mark as read' : 'Read'),
                ),
                const SizedBox(height: AimSpacing.innerGap),
                AIMButton(
                  onPressed: _busy ? null : _dismiss,
                  variant: AIMButtonVariant.ghost,
                  child: const Text('Dismiss'),
                ),
              ] else
                AIMAlertBanner(
                  tone: AIMAlertTone.info,
                  title: 'Dismissed',
                  child: const Text(
                    'This notification has been dismissed.',
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
