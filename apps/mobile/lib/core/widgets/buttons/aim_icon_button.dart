import 'package:flutter/material.dart';

import '../../theme/theme.dart';

enum AIMIconButtonVariant {
  ghost,
  solid,
  soft,
  outline,
}

enum AIMIconButtonSize {
  small,
  medium,
  large,
}

class AIMIconButton extends StatefulWidget {
  const AIMIconButton({
    required this.icon,
    required this.semanticLabel,
    super.key,
    this.onPressed,
    this.variant = AIMIconButtonVariant.ghost,
    this.size = AIMIconButtonSize.medium,
    this.round = false,
    this.disabled = false,
  });

  final Widget icon;
  final String semanticLabel;
  final VoidCallback? onPressed;
  final AIMIconButtonVariant variant;
  final AIMIconButtonSize size;
  final bool round;
  final bool disabled;

  bool get isEnabled => !disabled && onPressed != null;

  @override
  State<AIMIconButton> createState() => _AIMIconButtonState();
}

class _AIMIconButtonState extends State<AIMIconButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final spec = _AIMIconButtonSpec.resolve(
      variant: widget.variant,
      disabled: !widget.isEnabled,
      pressed: _pressed,
      surfaces: surfaces,
      soft: soft,
    );
    final side = widget.variant == AIMIconButtonVariant.outline
        ? BorderSide(color: spec.border)
        : BorderSide.none;
    final radius = widget.round
        ? AimRadius.borderPill
        : widget.size == AIMIconButtonSize.small
            ? AimRadius.borderSm
            : AimRadius.borderMd;

    final visualButton = AnimatedScale(
      scale: _pressed && widget.isEnabled ? 0.92 : 1,
      duration: AimMotion.durationFast,
      curve: AimMotion.easeStandard,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: spec.background,
          border: side == BorderSide.none ? null : Border.fromBorderSide(side),
          borderRadius: radius,
        ),
        child: SizedBox.square(
          dimension: widget.size.dimension,
          child: Center(
            child: IconTheme.merge(
              data: IconThemeData(
                color: spec.foreground,
                size: AimSizes.iconMd,
              ),
              child: widget.icon,
            ),
          ),
        ),
      ),
    );

    return Semantics(
      button: true,
      enabled: widget.isEnabled,
      label: widget.semanticLabel,
      onTap: widget.isEnabled ? widget.onPressed : null,
      excludeSemantics: true,
      child: SizedBox.square(
        dimension: widget.size.dimension < AimSizes.touchTarget
            ? AimSizes.touchTarget
            : widget.size.dimension,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.isEnabled ? widget.onPressed : null,
            onHighlightChanged: (value) {
              if (mounted && widget.isEnabled) {
                setState(() => _pressed = value);
              }
            },
            splashColor: surfaces.statePressed,
            highlightColor: surfaces.statePressed,
            borderRadius: radius,
            child: Center(child: visualButton),
          ),
        ),
      ),
    );
  }
}

final class _AIMIconButtonSpec {
  const _AIMIconButtonSpec({
    required this.background,
    required this.foreground,
    required this.border,
  });

  final Color background;
  final Color foreground;
  final Color border;

  static _AIMIconButtonSpec resolve({
    required AIMIconButtonVariant variant,
    required bool disabled,
    required bool pressed,
    required AimSurfaceTheme surfaces,
    required AimSoftFillTheme soft,
  }) {
    if (disabled) {
      return _AIMIconButtonSpec(
        background: const Color(0x00000000),
        foreground: surfaces.disabledFg,
        border: surfaces.disabledBorder,
      );
    }

    return switch (variant) {
      AIMIconButtonVariant.ghost => _AIMIconButtonSpec(
          background:
              pressed ? surfaces.surfaceSunken : const Color(0x00000000),
          foreground: pressed ? surfaces.textPrimary : surfaces.textSecondary,
          border: const Color(0x00000000),
        ),
      AIMIconButtonVariant.solid => _AIMIconButtonSpec(
          background: pressed ? AimColors.primary600 : AimColors.primary500,
          foreground: AimColors.neutral0,
          border: const Color(0x00000000),
        ),
      AIMIconButtonVariant.soft => _AIMIconButtonSpec(
          background: pressed ? AimColors.primary100 : soft.primary,
          foreground: soft.onPrimary,
          border: const Color(0x00000000),
        ),
      AIMIconButtonVariant.outline => _AIMIconButtonSpec(
          background:
              pressed ? surfaces.surfaceSunken : const Color(0x00000000),
          foreground: pressed ? surfaces.textPrimary : surfaces.textSecondary,
          border: surfaces.borderStrong,
        ),
    };
  }
}

extension on AIMIconButtonSize {
  double get dimension {
    return switch (this) {
      AIMIconButtonSize.small => AimSizes.buttonSm,
      AIMIconButtonSize.medium => AimSizes.iconButton,
      AIMIconButtonSize.large => AimSizes.buttonLg,
    };
  }
}
