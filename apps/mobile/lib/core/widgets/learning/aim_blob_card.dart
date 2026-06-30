import 'package:flutter/material.dart';

import '../../theme/theme.dart';

/// Rounded "blob" card used on the dashboard and course list.
///
/// Fills with either a [gradient] or a flat [backgroundColor] (mutually
/// exclusive — supply only one; defaults to [AimGradients.gzHero] when
/// neither is given).
///
/// ```dart
/// AIMBlobCard(
///   gradient: AimGradients.gzLime,
///   icon: Icon(Icons.local_fire_department_rounded),
///   title: '5-day streak',
///   subtitle: 'Keep it going today',
///   trailing: Icon(Icons.chevron_right_rounded),
///   onTap: onOpenStreak,
/// )
/// ```
class AIMBlobCard extends StatelessWidget {
  const AIMBlobCard({
    required this.icon,
    required this.title,
    super.key,
    this.gradient,
    this.backgroundColor,
    this.subtitle,
    this.trailing,
    this.onTap,
    this.semanticLabel,
  }) : assert(
          gradient == null || backgroundColor == null,
          'Provide either gradient or backgroundColor, not both.',
        );

  final LinearGradient? gradient;
  final Color? backgroundColor;
  final Widget icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final resolvedGradient =
        gradient ?? (backgroundColor == null ? AimGradients.gzHero : null);
    final resolvedColor = resolvedGradient == null
        ? (backgroundColor ?? soft.primary)
        : null;
    final foreground =
        resolvedGradient != null ? AimColors.neutral0 : surfaces.textPrimary;
    final subtitleColor = resolvedGradient != null
        ? AimColors.neutral0.withValues(alpha: 0.85)
        : surfaces.textSecondary;

    final content = ConstrainedBox(
      constraints: const BoxConstraints(minHeight: AimSizes.touchTarget),
      child: Padding(
        padding: const EdgeInsets.all(AimSpacing.cardLg),
        child: Row(
          children: [
            IconTheme(
              data: IconThemeData(color: foreground, size: AimSizes.iconLg),
              child: icon,
            ),
            const SizedBox(width: AimSpacing.componentGap),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: AimTextStyles.title.copyWith(color: foreground),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: AimSpacing.space4),
                    Text(
                      subtitle!,
                      style:
                          AimTextStyles.bodySm.copyWith(color: subtitleColor),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
            if (trailing != null) ...[
              const SizedBox(width: AimSpacing.componentGap),
              IconTheme(
                data: IconThemeData(color: foreground, size: AimSizes.iconMd),
                child: trailing!,
              ),
            ],
          ],
        ),
      ),
    );

    final card = DecoratedBox(
      decoration: BoxDecoration(
        gradient: resolvedGradient,
        color: resolvedColor,
        borderRadius: AimRadius.borderX2l,
      ),
      child: content,
    );

    return Semantics(
      button: onTap != null,
      label: semanticLabel ?? title,
      onTap: onTap,
      child: Material(
        color: Colors.transparent,
        borderRadius: AimRadius.borderX2l,
        clipBehavior: Clip.antiAlias,
        child: onTap == null
            ? card
            : InkWell(
                onTap: onTap,
                splashColor: surfaces.statePressed,
                highlightColor: surfaces.statePressed,
                child: card,
              ),
      ),
    );
  }
}
