// Phase 6 — P6-098
// ProgressWeaknessChip — renders a backend-persisted weakness record.
// severity and status are AIM Engine outputs; displayed verbatim.

import 'package:flutter/material.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';

class ProgressWeaknessChip extends StatelessWidget {
  const ProgressWeaknessChip({required this.model, super.key});
  final AimWeaknessRecordModel model;

  AIMBadgeTone get _tone => switch (model.severity.toLowerCase()) {
        'high' => AIMBadgeTone.error,
        'medium' => AIMBadgeTone.warning,
        _ => AIMBadgeTone.neutral,
      };

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
