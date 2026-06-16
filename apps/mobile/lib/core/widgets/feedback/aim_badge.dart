import 'package:flutter/material.dart';

import '../../theme/theme.dart';

enum AIMBadgeTone {
  primary,
  secondary,
  accent,
  success,
  warning,
  error,
  info,
  neutral,
}

enum AIMBadgeVariant {
  soft,
  solid,
  outline,
}

class AIMBadge extends StatelessWidget {
  const AIMBadge({
    required this.child,
    super.key,
    this.tone = AIMBadgeTone.neutral,
    this.variant = AIMBadgeVariant.soft,
    this.pill = false,
    this.dot = false,
    this.icon,
    this.semanticLabel,
  });

  final Widget child;
  final AIMBadgeTone tone;
  final AIMBadgeVariant variant;
  final bool pill;
  final bool dot;
  final Widget? icon;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final colors = _AIMBadgeColors.resolve(context, tone, variant);
    final radius = pill ? AimRadius.borderPill : AimRadius.borderSm;
    final horizontalPadding = pill ? AimSpacing.space12 : AimSpacing.space8;

    final badge = DecoratedBox(
      decoration: BoxDecoration(
        color: colors.background,
        border: Border.all(color: colors.border),
        borderRadius: radius,
      ),
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: horizontalPadding,
          vertical: 3,
        ),
        child: IconTheme.merge(
          data: IconThemeData(color: colors.foreground, size: AimSizes.iconSm),
          child: DefaultTextStyle.merge(
            style: AimTextStyles.caption.copyWith(
              color: colors.foreground,
              fontWeight: AimFontWeights.semibold,
              height: 1.4,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (dot) ...[
                  SizedBox.square(
                    dimension: 6,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: colors.foreground,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  const SizedBox(width: AimSpacing.space4),
                ],
                if (icon != null) ...[
                  icon!,
                  const SizedBox(width: AimSpacing.space4),
                ],
                child,
              ],
            ),
          ),
        ),
      ),
    );

    if (semanticLabel == null) return badge;

    return Semantics(
      label: semanticLabel,
      child: ExcludeSemantics(child: badge),
    );
  }
}

final class _AIMBadgeColors {
  const _AIMBadgeColors({
    required this.background,
    required this.foreground,
    required this.border,
  });

  final Color background;
  final Color foreground;
  final Color border;

  static _AIMBadgeColors resolve(
    BuildContext context,
    AIMBadgeTone tone,
    AIMBadgeVariant variant,
  ) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);

    return switch (variant) {
      AIMBadgeVariant.soft => _softColors(tone, surfaces, soft),
      AIMBadgeVariant.solid => _solidColors(tone),
      AIMBadgeVariant.outline => _outlineColors(tone, surfaces, soft),
    };
  }

  static _AIMBadgeColors _softColors(
    AIMBadgeTone tone,
    AimSurfaceTheme surfaces,
    AimSoftFillTheme soft,
  ) {
    return switch (tone) {
      AIMBadgeTone.primary => _AIMBadgeColors(
          background: soft.primary,
          foreground: soft.onPrimary,
          border: Colors.transparent,
        ),
      AIMBadgeTone.secondary => _AIMBadgeColors(
          background: soft.secondary,
          foreground: soft.onSecondary,
          border: Colors.transparent,
        ),
      AIMBadgeTone.accent => _AIMBadgeColors(
          background: soft.accent,
          foreground: soft.onAccent,
          border: Colors.transparent,
        ),
      AIMBadgeTone.success => _AIMBadgeColors(
          background: soft.success,
          foreground: soft.onSuccess,
          border: Colors.transparent,
        ),
      AIMBadgeTone.warning => _AIMBadgeColors(
          background: soft.warning,
          foreground: soft.onWarning,
          border: Colors.transparent,
        ),
      AIMBadgeTone.error => _AIMBadgeColors(
          background: soft.error,
          foreground: soft.onError,
          border: Colors.transparent,
        ),
      AIMBadgeTone.info => _AIMBadgeColors(
          background: soft.info,
          foreground: soft.onInfo,
          border: Colors.transparent,
        ),
      AIMBadgeTone.neutral => _AIMBadgeColors(
          background: surfaces.surfaceSunken,
          foreground: surfaces.textSecondary,
          border: Colors.transparent,
        ),
    };
  }

  static _AIMBadgeColors _solidColors(AIMBadgeTone tone) {
    return _AIMBadgeColors(
      background: switch (tone) {
        AIMBadgeTone.primary => AimColors.primary500,
        AIMBadgeTone.secondary => AimColors.secondary500,
        AIMBadgeTone.accent => AimColors.accent600,
        AIMBadgeTone.success => AimColors.success500,
        AIMBadgeTone.warning => AimColors.warning500,
        AIMBadgeTone.error => AimColors.error500,
        AIMBadgeTone.info => AimColors.info500,
        AIMBadgeTone.neutral => AimColors.neutral600,
      },
      foreground: AimColors.neutral0,
      border: Colors.transparent,
    );
  }

  static _AIMBadgeColors _outlineColors(
    AIMBadgeTone tone,
    AimSurfaceTheme surfaces,
    AimSoftFillTheme soft,
  ) {
    final softColors = _softColors(tone, surfaces, soft);

    return _AIMBadgeColors(
      background: Colors.transparent,
      foreground: softColors.foreground,
      border: switch (tone) {
        AIMBadgeTone.primary => AimColors.primary200,
        AIMBadgeTone.secondary => AimColors.secondary200,
        AIMBadgeTone.accent => AimColors.accent200,
        AIMBadgeTone.success => AimColors.success100,
        AIMBadgeTone.warning => AimColors.warning100,
        AIMBadgeTone.error => AimColors.error100,
        AIMBadgeTone.info => AimColors.info100,
        AIMBadgeTone.neutral => surfaces.borderStrong,
      },
    );
  }
}
