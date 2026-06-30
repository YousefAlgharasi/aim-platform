import 'package:flutter/material.dart';

import '../../theme/theme.dart';

/// Pill-shaped button filled with a gradient instead of a solid color.
///
/// Used on login, register, and checkout for the primary call-to-action.
/// Disabled state falls back to [AimColorTheme.disabledBg]/[disabledFg]
/// rather than desaturating the gradient.
///
/// ```dart
/// AIMGradientButton(
///   label: 'Continue',
///   onPressed: onContinue,
///   loading: isSubmitting,
/// )
/// ```
class AIMGradientButton extends StatefulWidget {
  const AIMGradientButton({
    required this.label,
    super.key,
    this.gradient = AimGradients.gzHero,
    this.onPressed,
    this.loading = false,
    this.icon,
    this.enabled = true,
    this.fullWidth = false,
    this.semanticLabel,
  });

  final String label;
  final LinearGradient gradient;
  final VoidCallback? onPressed;
  final bool loading;
  final Widget? icon;
  final bool enabled;
  final bool fullWidth;
  final String? semanticLabel;

  bool get isEnabled => enabled && !loading && onPressed != null;

  @override
  State<AIMGradientButton> createState() => _AIMGradientButtonState();
}

class _AIMGradientButtonState extends State<AIMGradientButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    final content = IconTheme.merge(
      data: const IconThemeData(
        color: AimColors.neutral0,
        size: AimSizes.iconMd,
      ),
      child: DefaultTextStyle.merge(
        style: AimTextStyles.button.copyWith(color: AimColors.neutral0),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (widget.icon != null) ...[
              widget.icon!,
              const SizedBox(width: AimSpacing.space8),
            ],
            Flexible(child: Text(widget.label)),
          ],
        ),
      ),
    );

    final body = AnimatedScale(
      scale: _pressed && widget.isEnabled ? 0.97 : 1,
      duration: AimMotion.durationFast,
      curve: AimMotion.easeStandard,
      child: Container(
        height: AimSizes.buttonLg,
        width: widget.fullWidth ? double.infinity : null,
        padding: const EdgeInsets.symmetric(horizontal: AimSpacing.space24),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: widget.isEnabled ? widget.gradient : null,
          color: widget.isEnabled ? null : surfaces.disabledBg,
          borderRadius: AimRadius.borderPill,
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Opacity(
              opacity: widget.loading ? 0 : 1,
              child: widget.isEnabled
                  ? content
                  : DefaultTextStyle.merge(
                      style: AimTextStyles.button
                          .copyWith(color: surfaces.disabledFg),
                      child: Text(widget.label),
                    ),
            ),
            if (widget.loading)
              SizedBox.square(
                dimension: AimTypography.buttonSize,
                child: const CircularProgressIndicator(
                  strokeWidth: 2,
                  color: AimColors.neutral0,
                ),
              ),
          ],
        ),
      ),
    );

    final button = Semantics(
      button: true,
      enabled: widget.isEnabled,
      label: widget.semanticLabel ?? widget.label,
      onTap: widget.isEnabled ? widget.onPressed : null,
      child: SizedBox(
        width: widget.fullWidth ? double.infinity : null,
        height: AimSizes.buttonLg < AimSizes.touchTarget
            ? AimSizes.touchTarget
            : AimSizes.buttonLg,
        child: Material(
          color: Colors.transparent,
          borderRadius: AimRadius.borderPill,
          child: InkWell(
            onTap: widget.isEnabled ? widget.onPressed : null,
            onHighlightChanged: (value) {
              if (mounted && widget.isEnabled) {
                setState(() => _pressed = value);
              }
            },
            borderRadius: AimRadius.borderPill,
            splashColor: surfaces.statePressed,
            highlightColor: surfaces.statePressed,
            child: Center(child: body),
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
