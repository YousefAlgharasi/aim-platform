import 'package:flutter/material.dart';

import '../../theme/theme.dart';

class AIMFab extends StatefulWidget {
  const AIMFab({
    required this.semanticLabel,
    super.key,
    this.onPressed,
    this.icon,
    this.child,
    this.extended = false,
    this.gradient = true,
    this.disabled = false,
  });

  final String semanticLabel;
  final VoidCallback? onPressed;
  final Widget? icon;
  final Widget? child;
  final bool extended;
  final bool gradient;
  final bool disabled;

  bool get isEnabled => !disabled && onPressed != null;

  @override
  State<AIMFab> createState() => _AIMFabState();
}

class _AIMFabState extends State<AIMFab> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final gradients = aimGradientsOf(context);
    final shadows = aimShadowsOf(context);
    final foreground =
        widget.isEnabled ? AimColors.neutral0 : surfaces.disabledFg;
    final decoration = BoxDecoration(
      color: widget.isEnabled
          ? (widget.gradient ? null : AimColors.primary500)
          : surfaces.disabledBg,
      gradient: widget.isEnabled && widget.gradient ? gradients.ai : null,
      borderRadius: AimRadius.borderPill,
      boxShadow: widget.isEnabled ? shadows.fab : AimShadows.none,
    );

    final labelStyle = AimTextStyles.button.copyWith(color: foreground);
    final content = IconTheme.merge(
      data: IconThemeData(color: foreground, size: AimSizes.iconLg),
      child: DefaultTextStyle.merge(
        style: labelStyle,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (widget.icon != null) widget.icon!,
            if (widget.extended && widget.child != null) ...[
              if (widget.icon != null) const SizedBox(width: AimSpacing.space8),
              Flexible(child: widget.child!),
            ],
          ],
        ),
      ),
    );

    return Semantics(
      button: true,
      enabled: widget.isEnabled,
      label: widget.semanticLabel,
      onTap: widget.isEnabled ? widget.onPressed : null,
      excludeSemantics: true,
      child: AnimatedScale(
        scale: _pressed && widget.isEnabled ? 0.96 : 1,
        duration: AimMotion.durationFast,
        curve: AimMotion.easeStandard,
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            minWidth: AimSizes.touchTarget,
            minHeight: AimSizes.touchTarget,
          ),
          child: Material(
            color: const Color(0x00000000),
            borderRadius: AimRadius.borderPill,
            clipBehavior: Clip.antiAlias,
            child: Ink(
              decoration: decoration,
              child: InkWell(
                onTap: widget.isEnabled ? widget.onPressed : null,
                onHighlightChanged: (value) {
                  if (mounted && widget.isEnabled) {
                    setState(() => _pressed = value);
                  }
                },
                splashColor: surfaces.statePressed,
                highlightColor: surfaces.statePressed,
                borderRadius: AimRadius.borderPill,
                child: Container(
                  height: AimSizes.fab,
                  constraints: const BoxConstraints(minWidth: AimSizes.fab),
                  padding: EdgeInsets.symmetric(
                    horizontal: widget.extended ? AimSpacing.space20 : 0,
                  ),
                  alignment: Alignment.center,
                  child: content,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
