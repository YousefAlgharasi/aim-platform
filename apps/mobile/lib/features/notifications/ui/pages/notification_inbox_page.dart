// Notifications — same layout as the student web app: title with a
// Preferences link, All/Unread filter, Mark all read, then notifications
// grouped by Today / Yesterday / Earlier. The backend is the sole authority
// for read and dismissed state; this page only shows what it returns and
// relays read/dismiss requests back to it.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' hide TextDirection;

import 'package:aim_mobile/core/localization/inline_tr.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

import '../../logic/entity/notification_entities.dart';
import '../../logic/provider/notification_providers.dart';

enum _Filter { all, unread }

String _categoryLabel(BuildContext context, String value) {
  if (value.isEmpty) return context.tr('Other', 'أخرى');
  final s = value.replaceAll('_', ' ');
  final label = s[0].toUpperCase() + s.substring(1);
  return switch (value.toLowerCase()) {
    'assessment' || 'assessments' => context.tr(label, 'التقييمات'),
    'achievement' || 'achievements' => context.tr(label, 'الإنجازات'),
    'reminder' || 'reminders' => context.tr(label, 'التذكيرات'),
    'billing' => context.tr(label, 'الفواتير'),
    'support' => context.tr(label, 'الدعم'),
    'learning' => context.tr(label, 'التعلّم'),
    'streak' => context.tr(label, 'المواظبة'),
    _ => label,
  };
}

class NotificationInboxPage extends ConsumerStatefulWidget {
  const NotificationInboxPage({super.key});

  @override
  ConsumerState<NotificationInboxPage> createState() =>
      _NotificationInboxPageState();
}

class _NotificationInboxPageState
    extends ConsumerState<NotificationInboxPage> {
  _Filter _filter = _Filter.all;
  bool _markingAll = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) {
      // No session yet: show a retryable failure instead of an endless spinner.
      ref.read(notificationInboxProvider.notifier).setFailure(
            message: 'Please sign in again to view notifications.',
            code: 'NO_SESSION',
          );
      return;
    }
    ref.read(notificationInboxProvider.notifier).load(bearerToken: token);
  }

  String? get _token {
    final token = ref.read(authFlowProvider).accessToken;
    return token == null || token.isEmpty ? null : token;
  }

  void _onOpen(NotificationEventModel event) {
    final token = _token;
    if (token != null && event.isUnread) {
      ref
          .read(notificationInboxProvider.notifier)
          .markAsRead(bearerToken: token, eventId: event.id);
    }
    context.push(AppRoutePaths.notificationDetail, extra: event);
  }

  void _onDismiss(NotificationEventModel event) {
    final token = _token;
    if (token == null) return;
    ref
        .read(notificationInboxProvider.notifier)
        .dismiss(bearerToken: token, eventId: event.id);
    AIMToast.show(
      context,
      message: context.tr('Notification dismissed', 'تم تجاهل الإشعار'),
    );
  }

  /// There is no bulk endpoint, so each unread notification is marked on its own.
  Future<void> _markAllRead(List<NotificationEventModel> unread) async {
    final token = _token;
    if (token == null || _markingAll) return;
    setState(() => _markingAll = true);
    final notifier = ref.read(notificationInboxProvider.notifier);
    for (final e in unread) {
      await notifier.markAsRead(bearerToken: token, eventId: e.id);
    }
    if (mounted) setState(() => _markingAll = false);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationInboxProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: SafeArea(
        // Inside the app chrome the top inset is already handled, so this adds none.
        child: switch (state) {
          AppAsyncLoading() || AppAsyncIdle() => AIMFullScreenLoading(
              semanticLabel: context.tr('Loading', 'جارٍ التحميل'),
            ),
          AppAsyncFailure(:final message) => AIMFullScreenError(
              message: message,
              onRetry: _load,
            ),
          AppAsyncSuccess(:final data) => RefreshIndicator(
              onRefresh: () async => _load(),
              child: _content(context, data),
            ),
        },
      ),
    );
  }

  Widget _content(BuildContext context, List<NotificationEventModel> events) {
    final live = events.where((e) => e.dismissedAt == null).toList();
    final unread = live.where((e) => e.isUnread).toList();
    final visible = _filter == _Filter.unread ? unread : live;

    final today = DateTime.now();
    int dayDiff(String iso) {
      final d = DateTime.tryParse(iso)?.toLocal();
      if (d == null) return 99;
      final a = DateTime(today.year, today.month, today.day);
      final b = DateTime(d.year, d.month, d.day);
      return a.difference(b).inDays;
    }

    final groups = <(String, List<NotificationEventModel>)>[
      (
        context.tr('Today', 'اليوم'),
        visible.where((e) => dayDiff(e.createdAt) <= 0).toList()
      ),
      (
        context.tr('Yesterday', 'أمس'),
        visible.where((e) => dayDiff(e.createdAt) == 1).toList()
      ),
      (
        context.tr('Earlier', 'سابقاً'),
        visible.where((e) => dayDiff(e.createdAt) > 1).toList()
      ),
    ].where((g) => g.$2.isNotEmpty).toList();

    return ListView(
      padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
      children: [
        PageTitleBar(
          title: context.tr('Notifications', 'الإشعارات'),
          action: TextButton(
            onPressed: () => context.push(AppRoutePaths.notificationPreferences),
            child: Text(context.tr('Preferences', 'التفضيلات')),
          ),
        ),
        const SizedBox(height: AimSpacing.sectionGap),
        Row(
          children: [
            Expanded(
              child: FilterPills<_Filter>(
                value: _filter,
                onChanged: (v) => setState(() => _filter = v),
                options: [
                  FilterPillOption(_Filter.all, context.tr('All', 'الكل')),
                  FilterPillOption(
                    _Filter.unread,
                    fill(context.tr('Unread ({n})', 'غير مقروءة ({n})'),
                        {'n': unread.length}),
                  ),
                ],
              ),
            ),
            if (unread.isNotEmpty)
              AIMButton(
                size: AIMButtonSize.small,
                variant: AIMButtonVariant.secondary,
                loading: _markingAll,
                onPressed: () => _markAllRead(unread),
                child: Text(context.tr('Mark all read', 'تعليم الكل كمقروء')),
              ),
          ],
        ),
        const SizedBox(height: AimSpacing.sectionGap),
        if (visible.isEmpty)
          AIMEmptyState(
            icon: const Icon(Icons.notifications_none_rounded),
            title: context.tr('No notifications', 'لا توجد إشعارات'),
            subtitle: context.tr("You're all caught up!", 'لقد أنهيت كل شيء!'),
          )
        else
          for (final g in groups) ...[
            Padding(
              padding: const EdgeInsetsDirectional.only(
                start: 4,
                bottom: AimSpacing.space8,
              ),
              child: Text(
                g.$1,
                style: AimTextStyles.caption.copyWith(
                  color: aimSurfacesOf(context).textMuted,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            for (final e in g.$2) ...[
              _NotificationTile(
                event: e,
                onOpen: () => _onOpen(e),
                onDismiss: () => _onDismiss(e),
              ),
              const SizedBox(height: AimSpacing.listItemGap),
            ],
            const SizedBox(height: AimSpacing.space8),
          ],
        const SizedBox(height: AimSpacing.space24),
      ],
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
    final unread = event.isUnread;
    final created = DateTime.tryParse(event.createdAt)?.toLocal();
    final when = created == null
        ? ''
        : DateFormat.yMMMd(context.isArabic ? 'ar' : 'en').add_jm().format(created);
    final title = (event.title?.isNotEmpty ?? false)
        ? event.title!
        : _categoryLabel(context, event.category);
    final body = event.body ?? '';

    return Material(
      color: unread
          ? AimColors.primary500.withValues(alpha: 0.08)
          : surfaces.surfaceRaised,
      borderRadius: BorderRadius.circular(AimRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AimRadius.lg),
        onTap: onOpen,
        child: Container(
          padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AimRadius.lg),
            border: Border.all(
              color: unread
                  ? AimColors.primary500.withValues(alpha: 0.35)
                  : surfaces.border,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsetsDirectional.only(top: 6, end: 12),
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: unread
                        ? AimColors.primary500
                        : surfaces.surfaceSunken,
                  ),
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AimTextStyles.bodyMd.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (body.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        body,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AimTextStyles.bodySm
                            .copyWith(color: surfaces.textMuted),
                      ),
                    ],
                    const SizedBox(height: 4),
                    Text(
                      when.isEmpty
                          ? _categoryLabel(context, event.category)
                          : '${_categoryLabel(context, event.category)} · $when',
                      style: AimTextStyles.caption.copyWith(
                        color: surfaces.textMuted,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                visualDensity: VisualDensity.compact,
                tooltip: fill(context.tr('Dismiss {title}', 'تجاهل {title}'),
                    {'title': title}),
                icon: Icon(Icons.close_rounded, color: surfaces.textMuted),
                onPressed: onDismiss,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
