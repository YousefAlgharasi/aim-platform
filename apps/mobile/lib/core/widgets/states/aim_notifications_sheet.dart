import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/theme.dart';
import '../buttons/buttons.dart';
import '../feedback/feedback.dart';
import 'aim_empty_state.dart';

/// Display data for a single row in [AIMNotificationsSheet].
class AIMNotificationItemData {
  const AIMNotificationItemData({
    required this.id,
    required this.title,
    this.body,
    this.timeLabel,
    this.icon,
    this.read = false,
  });

  final String id;
  final String title;
  final String? body;
  final String? timeLabel;
  final Widget? icon;
  final bool read;
}

/// Bottom sheet listing notifications, opened via [showModalBottomSheet].
///
/// ```dart
/// showModalBottomSheet(
///   context: context,
///   isScrollControlled: true,
///   builder: (context) => AIMNotificationsSheet(
///     notifications: notifications,
///     loading: isLoading,
///     onTapItem: (item) => ...,
///     onDismissItem: (item) => ...,
///   ),
/// );
/// ```
class AIMNotificationsSheet extends StatelessWidget {
  const AIMNotificationsSheet({
    required this.notifications,
    super.key,
    this.onTapItem,
    this.onDismissItem,
    this.loading = false,
    this.emptyMessage = 'No notifications yet',
    this.subtitle,
    this.headerIcon,
    this.onMarkAllRead,
  });

  final List<AIMNotificationItemData> notifications;
  final ValueChanged<AIMNotificationItemData>? onTapItem;
  final ValueChanged<AIMNotificationItemData>? onDismissItem;
  final bool loading;
  final String emptyMessage;

  /// Optional subtitle rendered under the "Notifications" title, e.g.
  /// "2 new today". Defaults to `null` (not rendered).
  final String? subtitle;

  /// Optional leading avatar/icon rendered beside the title, e.g. a
  /// colored bell-icon avatar. Defaults to `null` (not rendered).
  final Widget? headerIcon;

  /// Optional bulk "Mark read" action shown in the header row. Defaults to
  /// `null`, in which case no action button is rendered.
  final VoidCallback? onMarkAllRead;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final shadows = aimShadowsOf(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: const BorderRadiusDirectional.only(
          topStart: Radius.circular(AimRadius.x2l),
          topEnd: Radius.circular(AimRadius.x2l),
        ),
        boxShadow: shadows.sheet,
      ),
      child: SafeArea(
        top: false,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.sizeOf(context).height * 0.8,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsetsDirectional.fromSTEB(
                  AimSpacing.screenPaddingMobile,
                  AimSpacing.space12,
                  AimSpacing.screenPaddingMobile,
                  AimSpacing.space8,
                ),
                child: _buildHeader(context, surfaces),
              ),
              Flexible(child: _buildBody(context, surfaces)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, AimSurfaceTheme surfaces) {
    final titleAndSubtitle = Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Notifications',
            style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: AimSpacing.space4),
            Text(
              subtitle!,
              style: AimTextStyles.bodySm.copyWith(
                color: surfaces.textSecondary,
              ),
            ),
          ],
        ],
      ),
    );

    if (headerIcon == null && onMarkAllRead == null) {
      return Row(children: [titleAndSubtitle]);
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        if (headerIcon != null) ...[
          headerIcon!,
          const SizedBox(width: AimSpacing.componentGap),
        ],
        titleAndSubtitle,
        if (onMarkAllRead != null)
          TextButton(
            onPressed: onMarkAllRead,
            child: const Text('Mark read'),
          ),
        AIMIconButton(
          semanticLabel: 'Close notifications',
          icon: const Icon(Icons.close_rounded),
          onPressed: () => context.pop(),
        ),
      ],
    );
  }

  Widget _buildBody(BuildContext context, AimSurfaceTheme surfaces) {
    if (loading) {
      return ListView.separated(
        shrinkWrap: true,
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.space8,
        ),
        itemCount: 4,
        separatorBuilder: (context, index) =>
            const SizedBox(height: AimSpacing.componentGap),
        itemBuilder: (context, index) => const Row(
          children: [
            AIMSkeleton(shape: AIMSkeletonShape.circle, width: 40, height: 40),
            SizedBox(width: AimSpacing.componentGap),
            Expanded(child: AIMSkeleton(lines: 2)),
          ],
        ),
      );
    }

    if (notifications.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: AimSpacing.sectionGap),
        child: AIMEmptyState(
          icon: const Icon(Icons.notifications_none_rounded),
          title: emptyMessage,
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.space8,
      ),
      itemCount: notifications.length,
      separatorBuilder: (context, index) =>
          Divider(height: AimSpacing.space24, color: surfaces.divider),
      itemBuilder: (context, index) {
        final item = notifications[index];
        return _AIMNotificationRow(
          data: item,
          surfaces: surfaces,
          onTap: onTapItem == null ? null : () => onTapItem!(item),
          onDismiss:
              onDismissItem == null ? null : () => onDismissItem!(item),
        );
      },
    );
  }
}

class _AIMNotificationRow extends StatelessWidget {
  const _AIMNotificationRow({
    required this.data,
    required this.surfaces,
    this.onTap,
    this.onDismiss,
  });

  final AIMNotificationItemData data;
  final AimSurfaceTheme surfaces;
  final VoidCallback? onTap;
  final VoidCallback? onDismiss;

  @override
  Widget build(BuildContext context) {
    final content = ConstrainedBox(
      constraints: const BoxConstraints(minHeight: AimSizes.touchTarget),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!data.read)
            const Padding(
              padding: EdgeInsetsDirectional.only(
                end: AimSpacing.space8,
                top: AimSpacing.space8,
              ),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: AimColors.primary500,
                  shape: BoxShape.circle,
                ),
                child: SizedBox(
                  width: AimSpacing.space8,
                  height: AimSpacing.space8,
                ),
              ),
            ),
          if (data.icon != null) ...[
            IconTheme(
              data: IconThemeData(
                color: surfaces.textSecondary,
                size: AimSizes.iconMd,
              ),
              child: data.icon!,
            ),
            const SizedBox(width: AimSpacing.componentGap),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data.title,
                  style: AimTextStyles.bodyMd.copyWith(
                    color: surfaces.textPrimary,
                    fontWeight: data.read
                        ? AimFontWeights.regular
                        : AimFontWeights.semibold,
                  ),
                ),
                if (data.body != null) ...[
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    data.body!,
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textSecondary),
                  ),
                ],
                if (data.timeLabel != null) ...[
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    data.timeLabel!,
                    style:
                        AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                  ),
                ],
              ],
            ),
          ),
          if (onDismiss != null)
            AIMIconButton(
              semanticLabel: 'Dismiss notification',
              icon: const Icon(Icons.close_rounded, size: AimSizes.iconSm),
              onPressed: onDismiss,
            ),
        ],
      ),
    );

    if (onTap == null) return content;

    return Material(
      color: Colors.transparent,
      borderRadius: AimRadius.borderMd,
      child: InkWell(
        onTap: onTap,
        borderRadius: AimRadius.borderMd,
        splashColor: surfaces.statePressed,
        highlightColor: surfaces.statePressed,
        child: Semantics(button: true, label: data.title, child: content),
      ),
    );
  }
}
