// Phase 6 — P6-062
// HomeSectionHeader — shared section header for home screen sections.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// A titled section header used across all home screen sections.
class HomeSectionHeader extends StatelessWidget {
  const HomeSectionHeader({
    required this.title,
    super.key,
  });

  final String title;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Text(
      title,
      style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
    );
  }
}
