// Phase 6 — P6-062
// HomeWeaknessChip — renders a single AIM weakness record as a chip.
//
// Severity is backend-computed. Flutter maps the string to a badge tone for
// display only — no computation of severity occurs in Flutter.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';

/// Chip for a single backend-computed weakness record.
///
/// [severity] is mapped to a badge tone purely for visual rendering.
/// The backend remains the sole authority for what severity the record has.
class HomeWeaknessChip extends StatelessWidget {
  const HomeWeaknessChip({
    required this.model,
    super.key,
  });

  final HomeWeaknessRecordModel model;

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
      semanticLabel: '${model.topic} weakness: ${model.severity}',
      child: Text(model.topic),
    );
  }
}
