// Phase 6 — P6-067
// LearningPathWeaknessChip — renders a single AIM weakness record as a chip.
//
// Severity is backend-computed. Flutter maps the string to a badge tone for
// display only — no computation of severity occurs in Flutter.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';

class LearningPathWeaknessChip extends StatelessWidget {
  const LearningPathWeaknessChip({
    required this.model,
    super.key,
  });

  final LearningPathWeaknessRecordModel model;

  AIMBadgeTone get _tone {
    return switch (model.severity.toLowerCase()) {
      'high' => AIMBadgeTone.error,
      'medium' => AIMBadgeTone.warning,
      _ => AIMBadgeTone.neutral,
    };
  }

  @override
  Widget build(BuildContext context) {
    return AIMBadge(
      tone: _tone,
      variant: AIMBadgeVariant.soft,
      pill: true,
      semanticLabel: '${model.skillId} weakness: ${model.severity}',
      child: Text(model.skillId),
    );
  }
}
