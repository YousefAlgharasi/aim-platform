import 'package:flutter/material.dart';
import '../../../../core/theme/theme.dart';

/// Section title + subtitle header matching Modern Auth Pages (3)-1 design.
///
/// Title: 28px bold, tracking -0.5 | Subtitle: 14px slate-400
class PlacementPageHeader extends StatelessWidget {
  const PlacementPageHeader({
    super.key,
    required this.title,
    required this.subtitle,
    this.padding = const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile),
  });

  final String title;
  final String subtitle;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AimTextStyles.h1.copyWith(
              color: surfaces.textPrimary,
              fontSize: 28,
              fontWeight: FontWeight.bold,
              height: 1.2,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF94A3B8),
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
