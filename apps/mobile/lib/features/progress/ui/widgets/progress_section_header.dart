// Phase 6 — P6-098
// ProgressSectionHeader — section title for progress screen sections.

import 'package:flutter/material.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';

class ProgressSectionHeader extends StatelessWidget {
  const ProgressSectionHeader({required this.title, super.key});
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
