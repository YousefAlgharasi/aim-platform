import 'package:flutter/material.dart';

import '../../theme/theme.dart';

class AIMBottomNavDestination<T> {
  const AIMBottomNavDestination({
    required this.value,
    required this.label,
    required this.icon,
    this.activeIcon,
    this.badge,
    this.semanticLabel,
  });

  final T value;
  final String label;
  final Widget icon;
  final Widget? activeIcon;
  final String? badge;
  final String? semanticLabel;
}

class AIMBottomNav<T> extends StatelessWidget {
  const AIMBottomNav({
    required this.items,
    required this.value,
    super.key,
    this.onChanged,
    this.useSafeArea = true,
  }) : assert(
          items.length >= 3 && items.length <= 5,
          'AIMBottomNav supports 3 to 5 destinations.',
        );

  final List<AIMBottomNavDestination<T>> items;
  final T value;
  final ValueChanged<T>? onChanged;
  final bool useSafeArea;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final shadows = aimShadowsOf(context);

    final nav = DecoratedBox(
      decoration: BoxDecoration(
        color: surfaces.surface,
        border: Border(top: BorderSide(color: surfaces.border)),
        boxShadow: shadows.sheet,
      ),
      child: SizedBox(
        height: AimSizes.bottomNavHeight,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            for (final item in items)
              Expanded(
                child: _AIMBottomNavItem<T>(
                  item: item,
                  selected: item.value == value,
                  onTap: onChanged == null
                      ? null
                      : () => onChanged?.call(item.value),
                ),
              ),
          ],
        ),
      ),
    );

    if (!useSafeArea) return nav;
    return SafeArea(top: false, child: nav);
  }
}

class _AIMBottomNavItem<T> extends StatelessWidget {
  const _AIMBottomNavItem({
    required this.item,
    required this.selected,
    this.onTap,
  });

  final AIMBottomNavDestination<T> item;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final color = selected ? AimColors.primary600 : surfaces.textMuted;

    return Semantics(
      button: true,
      selected: selected,
      label: item.semanticLabel ?? item.label,
      child: InkWell(
        onTap: onTap,
        child: IconTheme.merge(
          data: IconThemeData(color: color, size: AimSizes.iconLg),
          child: DefaultTextStyle.merge(
            style: AimTextStyles.caption.copyWith(
              color: color,
              fontWeight: AimFontWeights.semibold,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    selected && item.activeIcon != null
                        ? item.activeIcon!
                        : item.icon,
                    if (item.badge != null)
                      PositionedDirectional(
                        top: -4,
                        end: -7,
                        child: _BottomNavBadge(label: item.badge!),
                      ),
                  ],
                ),
                const SizedBox(height: 3),
                Flexible(
                  child: Text(
                    item.label,
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BottomNavBadge extends StatelessWidget {
  const _BottomNavBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: AimColors.error500,
        border: Border.all(color: surfaces.surface, width: 2),
        borderRadius: AimRadius.borderPill,
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AimSpacing.space4),
          child: Center(
            child: Text(
              label,
              style: AimTextStyles.caption.copyWith(
                color: AimColors.neutral0,
                fontSize: 10,
                fontWeight: AimFontWeights.bold,
                height: 1,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
