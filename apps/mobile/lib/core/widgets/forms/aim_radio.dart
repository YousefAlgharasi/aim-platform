import 'package:flutter/material.dart';

import '../../theme/theme.dart';

class AIMRadio<T> extends StatelessWidget {
  const AIMRadio({
    required this.value,
    required this.groupValue,
    super.key,
    this.label,
    this.disabled = false,
    this.onChanged,
    this.semanticLabel,
  });

  final T value;
  final T? groupValue;
  final String? label;
  final bool disabled;
  final ValueChanged<T?>? onChanged;
  final String? semanticLabel;

  bool get isSelected => value == groupValue;
  bool get isEnabled => !disabled && onChanged != null;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final foreground = disabled ? surfaces.disabledFg : surfaces.textPrimary;
    final border = disabled
        ? surfaces.disabledBorder
        : isSelected
            ? AimColors.primary500
            : surfaces.borderStrong;

    return Semantics(
      inMutuallyExclusiveGroup: true,
      checked: isSelected,
      enabled: isEnabled,
      label: semanticLabel ?? label,
      onTap: isEnabled ? _select : null,
      child: InkWell(
        onTap: isEnabled ? _select : null,
        borderRadius: AimRadius.borderSm,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: AimSizes.touchTarget),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              DecoratedBox(
                decoration: BoxDecoration(
                  color: disabled ? surfaces.disabledBg : surfaces.surface,
                  border: Border.all(color: border, width: 1.5),
                  shape: BoxShape.circle,
                ),
                child: SizedBox.square(
                  dimension: 20,
                  child: Center(
                    child: AnimatedScale(
                      scale: isSelected ? 1 : 0,
                      duration: AimMotion.durationFast,
                      curve: AimMotion.easeEmphasis,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          color: disabled
                              ? surfaces.disabledFg
                              : AimColors.primary500,
                          shape: BoxShape.circle,
                        ),
                        child: const SizedBox.square(dimension: 10),
                      ),
                    ),
                  ),
                ),
              ),
              if (label != null) ...[
                const SizedBox(width: AimSpacing.space12),
                Flexible(
                  child: Text(
                    label!,
                    style: AimTextStyles.bodyMd.copyWith(color: foreground),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _select() {
    onChanged?.call(value);
  }
}
