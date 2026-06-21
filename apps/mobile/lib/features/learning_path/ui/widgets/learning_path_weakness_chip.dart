// Phase 6 — P6-067
// LearningPathWeaknessChip — renders a single AIM weakness record as a chip.
//
// Severity is backend-computed. Flutter maps the string to a badge tone for
// display only — no computation of severity occurs in Flutter.
//
// RTL/Arabic: AIMBadge handles internal directionality.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';

/// Chip for a single backend-computed learning path weakness record.
///
/// [severity] is mapped to a badge tone purely for visual rendering.
/// The backend remains the sole authority for what severity the record has.
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
      semanticLabel:
          '${model.topic} weakness: ${model.severity}. Focus: ${model.recommendedFocus}',
      child: Text(model.topic),
    );
  }
}
