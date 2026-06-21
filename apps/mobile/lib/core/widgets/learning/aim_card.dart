import 'package:flutter/material.dart';

import '../../theme/theme.dart';

enum AIMCardVariant {
  standard,
  elevated,
  ai,
  gradient,
}

class AIMCard extends StatefulWidget {
  const AIMCard({
    required this.child,
    super.key,
    this.variant = AIMCardVariant.standard,
    this.padded = true,
    this.interactive = false,
    this.onTap,
    this.semanticLabel,
    this.padding,
  });

  final Widget child;
  final AIMCardVariant variant;
  final bool padded;
  final bool interactive;
  final VoidCallback? onTap;
  final String? semanticLabel;
  final EdgeInsetsGeometry? padding;

  bool get isInteractive => interactive || onTap != null;

  @override
  State<AIMCard> createState() => _AIMCardState();
}

class _AIMCardState extends State<AIMCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final gradients = aimGradientsOf(context);
    final shadows = aimShadowsOf(context);
    final isGradient = widget.variant == AIMCardVariant.gradient;
    final foreground = isGradient ? AimColors.neutral0 : surfaces.textPrimary;
    final innerPadding =
        widget.padding ?? (widget.padded ? AimSpacing.cardLg : EdgeInsets.zero);

    final body = IconTheme.merge(
      data: IconThemeData(
        color: foreground,
        size: AimSizes.iconMd,
      ),
      child: DefaultTextStyle.merge(
        style: AimTextStyles.bodyMd.copyWith(color: foreground),
        child: Padding(
          padding: innerPadding,
          child: widget.child,
        ),
      ),
    );

    final decoratedCard = AnimatedScale(
      scale: _pressed && widget.isInteractive ? 0.99 : 1,
      duration: AimMotion.durationBase,
      curve: AimMotion.easeStandard,
      child: AnimatedContainer(
        duration: AimMotion.durationBase,
        curve: AimMotion.easeStandard,
        decoration: _decorationFor(
          surfaces: surfaces,
          shadows: shadows,
          gradients: gradients,
        ),
        clipBehavior: Clip.antiAlias,
        child: widget.variant == AIMCardVariant.ai
            ? Padding(
                padding: const EdgeInsets.all(1.5),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: surfaces.surface,
                    borderRadius: AimRadius.borderLg,
                  ),
                  child: body,
                ),
              )
            : body,
      ),
    );

    if (!widget.isInteractive) {
      if (widget.semanticLabel == null) return decoratedCard;

      return Semantics(
        label: widget.semanticLabel,
        child: decoratedCard,
      );
    }

    return Semantics(
      button: true,
      enabled: true,
      label: widget.semanticLabel,
      onTap: widget.onTap,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.onTap,
          onHighlightChanged: (value) {
            if (mounted) {
              setState(() => _pressed = value);
            }
          },
          borderRadius: AimRadius.borderLg,
          splashColor: surfaces.statePressed,
          highlightColor: surfaces.statePressed,
          child: decoratedCard,
        ),
      ),
    );
  }

  BoxDecoration _decorationFor({
    required AimSurfaceTheme surfaces,
    required AimShadowTheme shadows,
    required AimGradientTheme gradients,
  }) {
    return switch (widget.variant) {
      AIMCardVariant.standard => BoxDecoration(
          color: surfaces.surface,
          border: Border.all(color: surfaces.border),
          borderRadius: AimRadius.borderLg,
        ),
      AIMCardVariant.elevated => BoxDecoration(
          color: surfaces.surface,
          borderRadius: AimRadius.borderLg,
          boxShadow: shadows.card,
        ),
      AIMCardVariant.ai => BoxDecoration(
          gradient: gradients.ai,
          borderRadius: AimRadius.borderLg,
        ),
      AIMCardVariant.gradient => BoxDecoration(
          gradient: gradients.ai,
          borderRadius: AimRadius.borderLg,
          boxShadow: shadows.card,
        ),
    };
  }
}
