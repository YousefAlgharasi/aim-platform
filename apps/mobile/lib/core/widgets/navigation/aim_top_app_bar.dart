import 'package:flutter/material.dart';

import '../../theme/theme.dart';
import '../buttons/buttons.dart';

class AIMTopAppBar extends StatelessWidget implements PreferredSizeWidget {
  const AIMTopAppBar({
    super.key,
    this.title,
    this.subtitle,
    this.titleWidget,
    this.onBack,
    this.leading,
    this.actions = const [],
    this.centerTitle = false,
    this.transparent = false,
    this.backSemanticLabel = 'Back',
    this.iconButtonVariant = AIMIconButtonVariant.soft,
  });

  final String? title;
  final String? subtitle;
  final Widget? titleWidget;
  final VoidCallback? onBack;
  final Widget? leading;
  final List<Widget> actions;
  final bool centerTitle;
  final bool transparent;
  final String backSemanticLabel;
  final AIMIconButtonVariant iconButtonVariant;

  @override
  Size get preferredSize => Size.fromHeight(
        (subtitle != null && subtitle!.isNotEmpty)
            ? AimSizes.topBarHeight + 8
            : AimSizes.topBarHeight,
      );

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final direction = Directionality.of(context);
    final background = transparent ? Colors.transparent : surfaces.surface;
    final border = transparent ? Colors.transparent : surfaces.border;

    final Widget resolvedTitle = titleWidget ??
        (subtitle != null && subtitle!.isNotEmpty
            ? Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: centerTitle
                    ? CrossAxisAlignment.center
                    : CrossAxisAlignment.start,
                children: [
                  Text(
                    title ?? '',
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                    textAlign: centerTitle ? TextAlign.center : TextAlign.start,
                    style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle!,
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                    textAlign: centerTitle ? TextAlign.center : TextAlign.start,
                    style:
                        AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
                  ),
                ],
              )
            : Text(
                title ?? '',
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
                textAlign: centerTitle ? TextAlign.center : TextAlign.start,
                style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
              ));

    return DecoratedBox(
      decoration: BoxDecoration(
        color: background,
        border: Border(bottom: BorderSide(color: border)),
      ),
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: preferredSize.height,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AimSpacing.space8),
            child: Row(
              children: [
                if (leading != null) leading!,
                if (onBack != null)
                  AIMIconButton(
                    semanticLabel: backSemanticLabel,
                    variant: iconButtonVariant,
                    onPressed: onBack,
                    icon: Icon(
                      direction == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                      size: 22,
                    ),
                  ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AimSpacing.space8,
                    ),
                    child: centerTitle
                        ? Center(child: resolvedTitle)
                        : Align(
                            alignment: AlignmentDirectional.centerStart,
                            child: resolvedTitle,
                          ),
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    for (final action in actions) ...[
                      action,
                      if (action != actions.last)
                        const SizedBox(width: AimSpacing.space4),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
