// Phase 6 — P6-067
// LearningPathWeaknessChip — renders a single AIM weakness record as a chip.
//
// Severity is backend-computed. Flutter maps the string to a badge tone for
// display only — no computation of severity occurs in Flutter.
//
// TASK-31: skillId is prettified for display (e.g. "skill-fractions" ->
// "Skill Fractions"), matching design screen 37's readable chip labels.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';

/// Same prettification approach as `_prettifySkillId` in review_page.dart.
String _prettifySkillId(String skillId) {
  final lastSegment = skillId.split(':').last;
  final words = lastSegment
      .split(RegExp(r'[_\-]+'))
      .where((w) => w.isNotEmpty)
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase());
  final label = words.join(' ');
  return label.isEmpty ? skillId : label;
}

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
      dot: true,
      semanticLabel:
          '${_prettifySkillId(model.skillId)} weakness: ${model.severity}',
      child: Text(_prettifySkillId(model.skillId)),
    );
  }
}
