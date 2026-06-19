// Phase 6 — P6-067
// LearningPathSectionHeader — section title for learning path page sections.
//
// Uses AimTextStyles.h3 from the AIM Mobile Design System.
// RTL-safe: Text inherits ambient directionality.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// Section title for the learning path screen.
class LearningPathSectionHeader extends StatelessWidget {
  const LearningPathSectionHeader({
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
