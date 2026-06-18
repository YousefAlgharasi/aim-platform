import 'package:flutter/material.dart';

import '../../theme/theme.dart';

class AIMSegmentedOption<T> {
  const AIMSegmentedOption({
    required this.value,
    required this.label,
    this.icon,
    this.semanticLabel,
  });

  final T value;
  final String label;
  final Widget? icon;
  final String? semanticLabel;
}

class AIMSegmentedControl<T> extends StatelessWidget {
  const AIMSegmentedControl({
    required this.items,
    required this.value,
    super.key,
    this.onChanged,
    this.fullWidth = false,
  }) : assert(
          items.length >= 2 && items.length <= 4,
          'AIMSegmentedControl supports 2 to 4 options.',
        );

  final List<AIMSegmentedOption<T>> items;
  final T value;
  final ValueChanged<T>? onChanged;
  final bool fullWidth;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final shadows = aimShadowsOf(context);
    final selectedIndex = items.indexWhere((item) => item.value == value);
    final effectiveIndex = selectedIndex < 0 ? 0 : selectedIndex;

    final control = LayoutBuilder(
      builder: (context, constraints) {
        final bounded = constraints.maxWidth.isFinite;
        final width = bounded ? constraints.maxWidth : 0.0;

        return DecoratedBox(
          decoration: BoxDecoration(
            color: surfaces.surfaceSunken,
            borderRadius: AimRadius.borderMd,
          ),
          child: Padding(
            padding: const EdgeInsets.all(3),
            child: Stack(
              children: [
                if (bounded)
                  AnimatedPositionedDirectional(
                    duration: AimMotion.durationBase,
                    curve: AimMotion.easeEmphasis,
                    top: 0,
                    bottom: 0,
                    start: (width - 6) / items.length * effectiveIndex,
                    width: (width - 6) / items.length,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: surfaces.surface,
                        borderRadius: const BorderRadius.all(
                          Radius.circular(AimRadius.md - 3),
                        ),
                        boxShadow: shadows.card,
                      ),
                    ),
                  ),
                Row(
                  mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
                  children: [
                    for (final item in items)
                      Expanded(
                        child: _SegmentButton<T>(
                          item: item,
                          selected: item.value == value,
                          onTap: onChanged == null
                              ? null
                              : () => onChanged?.call(item.value),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );

    if (fullWidth) return SizedBox(width: double.infinity, child: control);

    return IntrinsicWidth(
      child: ConstrainedBox(
        constraints: BoxConstraints(minWidth: 96.0 * items.length),
        child: control,
      ),
    );
  }
}

class _SegmentButton<T> extends StatelessWidget {
  const _SegmentButton({
    required this.item,
    required this.selected,
    this.onTap,
  });

  final AIMSegmentedOption<T> item;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
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
            vertical: AimSpacing.space8,
          ),
          child: IconTheme.merge(
            data: IconThemeData(color: color, size: AimSizes.iconMd),
            child: DefaultTextStyle.merge(
              style: AimTextStyles.button.copyWith(color: color),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (item.icon != null) ...[
                    item.icon!,
                    const SizedBox(width: AimSpacing.space8),
                  ],
                  Flexible(child: Text(item.label)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
