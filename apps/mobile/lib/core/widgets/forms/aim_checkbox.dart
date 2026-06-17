import 'package:flutter/material.dart';

import '../../theme/theme.dart';

class AIMCheckbox extends StatelessWidget {
  const AIMCheckbox({
    super.key,
    this.label,
    this.value = false,
    this.indeterminate = false,
    this.disabled = false,
    this.onChanged,
    this.semanticLabel,
  });

  final String? label;
  final bool value;
  final bool indeterminate;
  final bool disabled;
  final ValueChanged<bool?>? onChanged;
  final String? semanticLabel;

  bool get isEnabled => !disabled && onChanged != null;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final checked = value || indeterminate;
    final foreground = disabled ? surfaces.disabledFg : surfaces.textPrimary;
    final boxBackground = disabled
        ? surfaces.disabledBg
        : checked
            ? AimColors.primary500
            : surfaces.surface;
    final boxBorder = disabled
        ? surfaces.disabledBorder
        : checked
            ? AimColors.primary500
            : surfaces.borderStrong;

    return Semantics(
      checked: indeterminate ? null : value,
      enabled: isEnabled,
      label: semanticLabel ?? label,
      onTap: isEnabled ? _toggle : null,
      child: InkWell(
        onTap: isEnabled ? _toggle : null,
        borderRadius: AimRadius.borderSm,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: AimSizes.touchTarget),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              DecoratedBox(
                decoration: BoxDecoration(
                  color: boxBackground,
                  border: Border.all(color: boxBorder, width: 1.5),
                  borderRadius: AimRadius.borderXs,
                ),
                child: SizedBox.square(
                  dimension: 20,
                  child: checked
                      ? Icon(
                          indeterminate
                              ? Icons.remove_rounded
                              : Icons.check_rounded,
                          color: AimColors.neutral0,
                          size: 14,
                        )
                      : null,
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

  void _toggle() {
    onChanged?.call(indeterminate ? true : !value);
  }
}
