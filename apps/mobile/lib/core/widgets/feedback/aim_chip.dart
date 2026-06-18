import 'package:flutter/material.dart';

import '../../theme/theme.dart';

class AIMChip extends StatefulWidget {
  const AIMChip({
    required this.child,
    super.key,
    this.selected = false,
    this.removable = false,
    this.disabled = false,
    this.icon,
    this.onPressed,
    this.onRemove,
    this.semanticLabel,
    this.removeSemanticLabel = 'Remove',
  });

  final Widget child;
  final bool selected;
  final bool removable;
  final bool disabled;
  final Widget? icon;
  final VoidCallback? onPressed;
  final VoidCallback? onRemove;
  final String? semanticLabel;
  final String removeSemanticLabel;

  bool get isInteractive => !disabled && onPressed != null;
  bool get canRemove => !disabled && removable && onRemove != null;

  @override
  State<AIMChip> createState() => _AIMChipState();
}

class _AIMChipState extends State<AIMChip> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final colors = _colorsFor(surfaces, soft);
    final isEnabled = !widget.disabled;

    final chipContent = IconTheme.merge(
      data: IconThemeData(color: colors.foreground, size: AimSizes.iconSm),
      child: DefaultTextStyle.merge(
        style: AimTextStyles.bodySm.copyWith(
          color: colors.foreground,
          fontWeight: AimFontWeights.medium,
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (widget.icon != null) ...[
              widget.icon!,
              const SizedBox(width: AimSpacing.space8),
            ],
            widget.child,
            if (widget.removable) ...[
              const SizedBox(width: AimSpacing.space8),
              _ChipRemoveButton(
                enabled: widget.canRemove,
                semanticLabel: widget.removeSemanticLabel,
                onRemove: widget.onRemove,
              ),
            ],
          ],
        ),
      ),
    );

    final visualChip = AnimatedContainer(
      duration: AimMotion.durationFast,
      curve: AimMotion.easeStandard,
      height: 34,
      padding: const EdgeInsetsDirectional.only(
        start: AimSpacing.space16,
        end: AimSpacing.space12,
      ),
      decoration: BoxDecoration(
        color: colors.background,
        border: Border.all(color: colors.border),
        borderRadius: AimRadius.borderPill,
      ),
      child: Center(child: chipContent),
    );

    return Semantics(
      button: widget.onPressed != null,
      enabled: isEnabled,
      selected: widget.selected,
      label: widget.semanticLabel,
      onTap: widget.isInteractive ? widget.onPressed : null,
      child: SizedBox(
        height: AimSizes.touchTarget,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.isInteractive ? widget.onPressed : null,
            onHighlightChanged: (value) {
              if (mounted && widget.isInteractive) {
                setState(() => _pressed = value);
              }
            },
            borderRadius: AimRadius.borderPill,
            splashColor: surfaces.statePressed,
            highlightColor: surfaces.statePressed,
            child: Center(
              child: AnimatedScale(
                scale: _pressed && widget.isInteractive ? 0.98 : 1,
                duration: AimMotion.durationFast,
                curve: AimMotion.easeStandard,
                child: visualChip,
              ),
            ),
          ),
        ),
      ),
    );
  }

  _AIMChipColors _colorsFor(
    AimSurfaceTheme surfaces,
    AimSoftFillTheme soft,
  ) {
    if (widget.disabled) {
      return _AIMChipColors(
        background: surfaces.disabledBg,
        foreground: surfaces.disabledFg,
        border: surfaces.disabledBorder,
      );
    }

    if (widget.selected) {
      return _AIMChipColors(
        background: soft.primary,
        foreground: soft.onPrimary,
        border: AimColors.primary200,
      );
    }

    return _AIMChipColors(
      background: _pressed ? surfaces.surfaceSunken : surfaces.surface,
      foreground: surfaces.textSecondary,
      border: surfaces.border,
    );
  }
}

class _ChipRemoveButton extends StatelessWidget {
  const _ChipRemoveButton({
    required this.enabled,
    required this.semanticLabel,
    this.onRemove,
  });

  final bool enabled;
  final String semanticLabel;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      enabled: enabled,
      label: semanticLabel,
      onTap: enabled ? onRemove : null,
      child: ExcludeSemantics(
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: enabled ? onRemove : null,
          child: const Padding(
            padding: EdgeInsets.all(1),
            child: Icon(Icons.close_rounded, size: 14),
          ),
        ),
      ),
    );
  }
}

final class _AIMChipColors {
  const _AIMChipColors({
    required this.background,
    required this.foreground,
    required this.border,
  });

  final Color background;
  final Color foreground;
  final Color border;
}
