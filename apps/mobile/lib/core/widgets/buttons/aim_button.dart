import 'package:flutter/material.dart';

import '../../theme/theme.dart';

enum AIMButtonVariant {
  primary,
  secondary,
  outline,
  ghost,
  destructive,
}

enum AIMButtonSize {
  small,
  medium,
  large,
}

class AIMButton extends StatefulWidget {
  const AIMButton({
    required this.child,
    super.key,
    this.onPressed,
    this.variant = AIMButtonVariant.primary,
    this.size = AIMButtonSize.medium,
    this.fullWidth = false,
    this.loading = false,
    this.disabled = false,
    this.leadingIcon,
    this.trailingIcon,
    this.semanticLabel,
  });

  final Widget child;
  final VoidCallback? onPressed;
  final AIMButtonVariant variant;
  final AIMButtonSize size;
  final bool fullWidth;
  final bool loading;
  final bool disabled;
  final Widget? leadingIcon;
  final Widget? trailingIcon;
  final String? semanticLabel;

  bool get isEnabled => !disabled && !loading && onPressed != null;

  @override
  State<AIMButton> createState() => _AIMButtonState();
}

class _AIMButtonState extends State<AIMButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final shadows = aimShadowsOf(context);
    final spec = _AIMButtonSpec.resolve(
      variant: widget.variant,
      disabled: !widget.isEnabled,
      pressed: _pressed,
      surfaces: surfaces,
      soft: soft,
    );
    // Ghost buttons have no visible surface to lift, and a disabled button
    // should read as flat/sunken rather than floating.
    final boxShadow = widget.isEnabled && widget.variant != AIMButtonVariant.ghost
        ? shadows.card
        : AimShadows.none;
    final height = widget.size.height;
    final radius = widget.size == AIMButtonSize.small
        ? AimRadius.borderSm
        : AimRadius.borderMd;
    final horizontalPadding = widget.size == AIMButtonSize.large
        ? AimSpacing.space24
        : widget.size == AIMButtonSize.small
            ? AimSpacing.space16
            : AimSpacing.space20;

    final labelStyle = (widget.size == AIMButtonSize.small
            ? AimTextStyles.button.copyWith(fontSize: AimTypography.bodySmSize)
            : widget.size == AIMButtonSize.large
                ? AimTextStyles.button
                    .copyWith(fontSize: AimTypography.bodyMdSize)
                : AimTextStyles.button)
        .copyWith(color: spec.foreground);

    final content = IconTheme.merge(
      data: IconThemeData(color: spec.foreground, size: AimSizes.iconMd),
      child: DefaultTextStyle.merge(
        style: labelStyle,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        child: Row(
          mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (widget.leadingIcon != null) ...[
              widget.leadingIcon!,
              const SizedBox(width: AimSpacing.space8),
            ],
            Flexible(child: widget.child),
            if (widget.trailingIcon != null) ...[
              const SizedBox(width: AimSpacing.space8),
              widget.trailingIcon!,
            ],
          ],
        ),
      ),
    );

    final visualButton = AnimatedScale(
      scale: _pressed && widget.isEnabled ? 0.97 : 1,
      duration: AimMotion.durationFast,
      curve: AimMotion.easeStandard,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: spec.background,
          border: Border.all(color: spec.border),
          borderRadius: radius,
          boxShadow: boxShadow,
        ),
        child: Container(
          height: height,
          width: widget.fullWidth ? double.infinity : null,
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
          alignment: Alignment.center,
          child: Stack(
            alignment: Alignment.center,
            children: [
              Opacity(
                opacity: widget.loading ? 0 : 1,
                child: content,
              ),
              if (widget.loading)
                SizedBox.square(
                  dimension: labelStyle.fontSize ?? 15,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: spec.foreground,
                  ),
                ),
            ],
          ),
        ),
      ),
    );

    final button = Semantics(
      button: true,
      enabled: widget.isEnabled,
      label: widget.semanticLabel,
      onTap: widget.isEnabled ? widget.onPressed : null,
      child: SizedBox(
        width: widget.fullWidth ? double.infinity : null,
        height: height < AimSizes.touchTarget ? AimSizes.touchTarget : height,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.isEnabled ? widget.onPressed : null,
            onHighlightChanged: (value) {
              if (mounted && widget.isEnabled) {
                setState(() => _pressed = value);
              }
            },
            splashColor: spec.overlay,
            highlightColor: spec.overlay,
            borderRadius: radius,
            child: Center(child: visualButton),
          ),
        ),
      ),
    );

    if (widget.fullWidth) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }
}

final class _AIMButtonSpec {
  const _AIMButtonSpec({
    required this.background,
    required this.foreground,
    required this.border,
    required this.overlay,
  });

  final Color background;
  final Color foreground;
  final Color border;
  final Color overlay;

  static _AIMButtonSpec resolve({
    required AIMButtonVariant variant,
    required bool disabled,
    required bool pressed,
    required AimSurfaceTheme surfaces,
    required AimSoftFillTheme soft,
  }) {
    if (disabled) {
      return _AIMButtonSpec(
        background: surfaces.disabledBg,
        foreground: surfaces.disabledFg,
        border: surfaces.disabledBorder,
        overlay: const Color(0x00000000),
      );
    }

    return switch (variant) {
      AIMButtonVariant.primary => _AIMButtonSpec(
          background: pressed ? AimColors.primary700 : AimColors.primary500,
          foreground: surfaces.textOnPrimary,
          border: const Color(0x00000000),
          overlay: surfaces.statePressed,
        ),
      AIMButtonVariant.secondary => _AIMButtonSpec(
          background: pressed ? AimColors.secondary700 : AimColors.secondary500,
          foreground: AimColors.neutral0,
          border: const Color(0x00000000),
          overlay: surfaces.statePressed,
        ),
      AIMButtonVariant.outline => _AIMButtonSpec(
          background: pressed ? AimColors.primary100 : const Color(0x00000000),
          foreground: AimColors.primary600,
          border: surfaces.borderStrong,
          overlay: soft.primary,
        ),
      AIMButtonVariant.ghost => _AIMButtonSpec(
          background: pressed ? AimColors.primary100 : const Color(0x00000000),
          foreground: AimColors.primary600,
          border: const Color(0x00000000),
          overlay: soft.primary,
        ),
      AIMButtonVariant.destructive => _AIMButtonSpec(
          background: pressed ? AimColors.error700 : AimColors.error500,
          foreground: AimColors.neutral0,
          border: const Color(0x00000000),
          overlay: surfaces.statePressed,
        ),
    };
  }
}

extension on AIMButtonSize {
  double get height {
    return switch (this) {
      AIMButtonSize.small => AimSizes.buttonSm,
      AIMButtonSize.medium => AimSizes.buttonMd,
      AIMButtonSize.large => AimSizes.buttonLg,
    };
  }
}
