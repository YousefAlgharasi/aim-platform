import 'package:flutter/material.dart';

import '../../theme/theme.dart';

/// Small fixed-width stat tile: icon, big numeric value, label underneath.
///
/// Designed to sit inside a horizontal scroll row, so it sizes itself with a
/// fixed [width] rather than relying on [Expanded].
///
/// ```dart
/// SingleChildScrollView(
///   scrollDirection: Axis.horizontal,
///   child: Row(
///     children: [
///       AIMStatTile(icon: Icon(Icons.local_fire_department_rounded), value: '5', label: 'Day streak'),
///       AIMStatTile(icon: Icon(Icons.bolt_rounded), value: '320', label: 'XP'),
///     ],
///   ),
/// )
/// ```
class AIMStatTile extends StatelessWidget {
  const AIMStatTile({
    required this.icon,
    required this.value,
    required this.label,
    super.key,
    this.accentColor,
    this.width = 96,
    this.semanticLabel,
  });

  final Widget icon;
  final String value;
  final String label;
  final Color? accentColor;
  final double width;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final accent = accentColor ?? AimColors.primary500;

    return Semantics(
      label: semanticLabel ?? '$value $label',
      child: SizedBox(
        width: width,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconTheme(
              data: IconThemeData(color: accent, size: AimSizes.iconLg),
              child: icon,
            ),
            const SizedBox(height: AimSpacing.space8),
            Text(
              value,
              style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.space4),
            Text(
              label,
              style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
