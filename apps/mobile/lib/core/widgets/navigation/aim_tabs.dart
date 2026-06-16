import 'package:flutter/material.dart';

import '../../theme/theme.dart';

class AIMTabItem<T> {
  const AIMTabItem({
    required this.value,
    required this.label,
    this.icon,
    this.count,
    this.semanticLabel,
  });

  final T value;
  final String label;
  final Widget? icon;
  final int? count;
  final String? semanticLabel;
}

class AIMTabs<T> extends StatelessWidget {
  const AIMTabs({
    required this.items,
    required this.value,
    super.key,
    this.onChanged,
  }) : assert(items.length > 0, 'AIMTabs requires at least one tab.');

  final List<AIMTabItem<T>> items;
  final T value;
  final ValueChanged<T>? onChanged;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final selectedIndex = items.indexWhere((item) => item.value == value);
    final effectiveIndex = selectedIndex < 0 ? 0 : selectedIndex;

    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: surfaces.border)),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final tabWidth = constraints.maxWidth / items.length;

          return Stack(
            alignment: AlignmentDirectional.bottomStart,
            children: [
              Row(
                children: [
                  for (final item in items)
                    Expanded(
                      child: _AIMTab<T>(
                        item: item,
                        selected: item.value == value,
                        onTap: onChanged == null
                            ? null
                            : () => onChanged?.call(item.value),
                      ),
                    ),
                ],
              ),
              AnimatedPositionedDirectional(
                duration: AimMotion.durationBase,
                curve: AimMotion.easeStandard,
                bottom: -1,
                start: tabWidth * effectiveIndex,
                width: tabWidth,
                height: 2.5,
                child: const DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.primary500,
                    borderRadius: AimRadius.borderPill,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _AIMTab<T> extends StatelessWidget {
  const _AIMTab({
    required this.item,
    required this.selected,
    this.onTap,
  });

  final AIMTabItem<T> item;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final color = selected ? AimColors.primary600 : surfaces.textSecondary;

    return Semantics(
      button: true,
      selected: selected,
      label: item.semanticLabel ?? item.label,
      child: InkWell(
        onTap: onTap,
        borderRadius: AimRadius.borderSm,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.space16,
            vertical: AimSpacing.space12,
          ),
          child: IconTheme.merge(
            data: IconThemeData(color: color, size: AimSizes.iconMd),
            child: DefaultTextStyle.merge(
              style: AimTextStyles.button.copyWith(color: color),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (item.icon != null) ...[
                    item.icon!,
                    const SizedBox(width: AimSpacing.space8),
                  ],
                  Flexible(
                    child: Text(
                      item.label,
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                  ),
                  if (item.count != null) ...[
                    const SizedBox(width: AimSpacing.space8),
                    DecoratedBox(
                      decoration: BoxDecoration(
                        color: selected ? soft.primary : surfaces.surfaceSunken,
                        borderRadius: AimRadius.borderPill,
                      ),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 7),
                        child: Text(
                          '${item.count}',
                          style: AimTextStyles.caption.copyWith(
                            color: selected
                                ? soft.onPrimary
                                : surfaces.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
