import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../theme/theme.dart';

/// Gradient hero header used at the top of home, profile, and the placement
/// result screen.
///
/// Renders a gradient-filled banner with optional [leading] (e.g. avatar) and
/// [trailing] (e.g. notification bell) widgets framing a [title]/[subtitle],
/// and an optional [child] overlaid near the bottom (e.g. a stat row).
///
/// ```dart
/// AIMGradientHeroHeader(
///   title: 'Good evening, Sara',
///   subtitle: 'Keep your 5-day streak going',
///   leading: AIMAvatar(...),
///   trailing: AIMIconButton(icon: Icon(Icons.notifications_outlined)),
///   child: Row(children: [AIMStatTile(...), AIMStatTile(...)]),
/// )
/// ```
class AIMGradientHeroHeader extends StatelessWidget {
  const AIMGradientHeroHeader({
    required this.title,
    super.key,
    this.gradient = AimGradients.gzHero,
    this.subtitle,
    this.leading,
    this.trailing,
    this.child,
    this.semanticLabel,
  });

  /// Background gradient. Defaults to the signature purple→blue hero.
  final LinearGradient gradient;

  /// Primary heading text.
  final String title;

  /// Secondary text shown beneath [title].
  final String? subtitle;

  /// Widget rendered before the title row, e.g. an avatar.
  final Widget? leading;

  /// Widget rendered after the title row, e.g. a notification bell.
  final Widget? trailing;

  /// Content overlaid at the bottom of the header, e.g. a stat row.
  final Widget? child;

  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    // Without this, the OS paints its default status bar background (dark
    // icons on an opaque strip) above the gradient instead of light icons
    // sitting transparently on it — visible as a seam/border along the top
    // edge that isn't in the design. AnnotatedRegion applies for exactly as
    // long as this header is in the tree.
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Semantics(
        label: semanticLabel,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsetsDirectional.fromSTEB(
            AimSpacing.screenPaddingMobile,
            AimSpacing.sectionGap,
            AimSpacing.screenPaddingMobile,
            AimSpacing.sectionGap,
          ),
          decoration: BoxDecoration(
            gradient: gradient,
            borderRadius: const BorderRadiusDirectional.only(
              bottomStart: Radius.circular(AimRadius.x2l),
              bottomEnd: Radius.circular(AimRadius.x2l),
            ),
          ),
          child: SafeArea(
            bottom: false,
            child: IconTheme.merge(
              data: const IconThemeData(
                color: AimColors.neutral0,
                size: AimSizes.iconMd,
              ),
              child: DefaultTextStyle.merge(
                style: const TextStyle(color: AimColors.neutral0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        if (leading != null) ...[
                          leading!,
                          const SizedBox(width: AimSpacing.componentGap),
                        ],
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                title,
                                style: AimTextStyles.h2
                                    .copyWith(color: AimColors.neutral0),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (subtitle != null) ...[
                                const SizedBox(height: AimSpacing.space4),
                                Text(
                                  subtitle!,
                                  style: AimTextStyles.bodySm.copyWith(
                                    color: AimColors.neutral0.withValues(
                                      alpha: 0.85,
                                    ),
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ],
                          ),
                        ),
                        if (trailing != null) ...[
                          const SizedBox(width: AimSpacing.componentGap),
                          SizedBox(
                            width: AimSizes.touchTarget,
                            height: AimSizes.touchTarget,
                            child: trailing,
                          ),
                        ],
                      ],
                    ),
                    if (child != null) ...[
                      const SizedBox(height: AimSpacing.sectionGap),
                      child!,
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
