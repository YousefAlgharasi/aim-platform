// Phase 6 — P6-067
// LearningPathSectionHeader — section title for learning path page sections.
//
// Uses AimTextStyles.h3 from the AIM Mobile Design System.
// RTL-safe: Text inherits ambient directionality.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// Section title for the learning path screen. [trailing] is an optional
/// widget shown after the title (design screen 37's "AI picked" tag on the
/// "Next up" section).
class LearningPathSectionHeader extends StatelessWidget {
  const LearningPathSectionHeader({
    required this.title,
    this.trailing,
    super.key,
  });

  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final text = Text(
      title,
      style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
    );
    if (trailing == null) return text;
    return Row(
      children: [
        text,
        const SizedBox(width: AimSpacing.space8),
        trailing!,
      ],
    );
  }
}
