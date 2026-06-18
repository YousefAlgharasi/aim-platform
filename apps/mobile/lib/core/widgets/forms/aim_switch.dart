import 'package:flutter/material.dart';

import '../../theme/theme.dart';

class AIMSwitch extends StatelessWidget {
  const AIMSwitch({
    super.key,
    this.label,
    this.value = false,
    this.disabled = false,
    this.onChanged,
    this.semanticLabel,
  });

  final String? label;
  final bool value;
  final bool disabled;
  final ValueChanged<bool>? onChanged;
  final String? semanticLabel;

  bool get isEnabled => !disabled && onChanged != null;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final foreground = disabled ? surfaces.disabledFg : surfaces.textPrimary;
    final trackColor = disabled
        ? surfaces.disabledBg
        : value
            ? AimColors.primary500
            : AimColors.neutral300;

    return Semantics(
      toggled: value,
      enabled: isEnabled,
      label: semanticLabel ?? label,
      onTap: isEnabled ? _toggle : null,
      child: InkWell(
        onTap: isEnabled ? _toggle : null,
        borderRadius: AimRadius.borderPill,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: AimSizes.touchTarget),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: AimMotion.durationBase,
                curve: AimMotion.easeStandard,
                width: 44,
                height: 26,
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: trackColor,
                  borderRadius: AimRadius.borderPill,
                ),
                child: AnimatedAlign(
                  alignment: value
                      ? AlignmentDirectional.centerEnd
                      : AlignmentDirectional.centerStart,
                  duration: AimMotion.durationBase,
                  curve: AimMotion.easeEmphasis,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: AimColors.neutral0,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AimColors.neutral900.withValues(alpha: 0.30),
                          offset: const Offset(0, 1),
                          blurRadius: 3,
                        ),
                      ],
                    ),
                    child: const SizedBox.square(dimension: 20),
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

  void _toggle() {
    onChanged?.call(!value);
  }
}
