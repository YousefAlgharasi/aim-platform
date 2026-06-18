import 'package:flutter/material.dart';

import '../../theme/theme.dart';
import '../buttons/buttons.dart';

class AIMTopAppBar extends StatelessWidget implements PreferredSizeWidget {
  const AIMTopAppBar({
    super.key,
    this.title,
    this.onBack,
    this.leading,
    this.actions = const [],
    this.centerTitle = false,
    this.transparent = false,
    this.backSemanticLabel = 'Back',
  });

  final String? title;
  final VoidCallback? onBack;
  final Widget? leading;
  final List<Widget> actions;
  final bool centerTitle;
  final bool transparent;
  final String backSemanticLabel;

  @override
  Size get preferredSize => const Size.fromHeight(AimSizes.topBarHeight);

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final direction = Directionality.of(context);
    final background = transparent ? Colors.transparent : surfaces.surface;
    final border = transparent ? Colors.transparent : surfaces.border;

    final titleWidget = Text(
      title ?? '',
      overflow: TextOverflow.ellipsis,
      maxLines: 1,
      textAlign: centerTitle ? TextAlign.center : TextAlign.start,
      style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
    );

    return DecoratedBox(
      decoration: BoxDecoration(
        color: background,
        border: Border(bottom: BorderSide(color: border)),
      ),
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: AimSizes.topBarHeight,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AimSpacing.space8),
            child: Row(
              children: [
                if (leading != null) leading!,
                if (onBack != null)
                  AIMIconButton(
                    semanticLabel: backSemanticLabel,
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
                        ? Center(child: titleWidget)
                        : Align(
                            alignment: AlignmentDirectional.centerStart,
                            child: titleWidget,
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
