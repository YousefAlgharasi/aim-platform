import 'package:flutter/material.dart';
import '../../../../core/theme/theme.dart';

/// Reusable section title & subtitle header for placement flow screens.
class PlacementPageHeader extends StatelessWidget {
  const PlacementPageHeader({
    super.key,
    required this.title,
    required this.subtitle,
    this.padding = const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
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
              height: 1.2,
            ),
          ),
          const SizedBox(height: AimSpacing.innerGap),
          Text(
            subtitle,
            style: AimTextStyles.bodySm.copyWith(
              color: surfaces.textSecondary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
