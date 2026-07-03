// Phase 6 — P6-067
// LearningPathSkillStateCard — renders a single AIM skill-state summary card.
//
// Displays skillId, masteryScore, and masteryTrend exactly as returned
// by the backend. Flutter never computes or infers these values locally.
//
// TASK-31: restyled to match design screen 37's "Skill coverage" rows —
// title + percent on one line, full-width progress bar below. skillId is
// prettified for display (e.g. "skill-algebra" -> "Skill Algebra"); the
// design shows no trend indicator, but masteryTrend is real backend data so
// it is kept as a small trailing pill rather than dropped.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

/// Converts a raw, machine-oriented `skillId` slug (e.g. `skill-algebra` or
/// `past_simple`) into a readable label for display. Same approach as
/// `_prettifySkillId` in review_page.dart.
String _prettifySkillId(String skillId) {
  final lastSegment = skillId.split(':').last;
  final words = lastSegment
      .split(RegExp(r'[_\-]+'))
      .where((w) => w.isNotEmpty)
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase());
  final label = words.join(' ');
  return label.isEmpty ? skillId : label;
}

class LearningPathSkillStateCard extends StatelessWidget {
  const LearningPathSkillStateCard({
    required this.model,
    super.key,
  });

  final LearningPathSkillStateModel model;

  AIMBadgeTone get _trendTone {
    return switch (model.masteryTrend.toLowerCase()) {
      'improving' => AIMBadgeTone.success,
      'stable' => AIMBadgeTone.primary,
      'declining' => AIMBadgeTone.error,
      _ => AIMBadgeTone.neutral,
    };
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final scorePercent = (model.masteryScore * 100).toStringAsFixed(0);
    final title = _prettifySkillId(model.skillId);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: AppLocalizations.of(context)
          .learningPathSkillMasterySemantic(
              title, scorePercent, model.masteryTrend),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: AimTextStyles.title
                      .copyWith(color: surfaces.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: AimSpacing.space8),
              Text(
                '$scorePercent%',
                style:
                    AimTextStyles.title.copyWith(color: surfaces.textPrimary),
              ),
              const SizedBox(width: AimSpacing.space8),
              AIMBadge(
                tone: _trendTone,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(model.masteryTrend),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          ClipRRect(
            borderRadius: AimRadius.borderMd,
            child: LinearProgressIndicator(
              value: model.masteryScore.clamp(0.0, 1.0),
              backgroundColor: surfaces.surfaceSunken,
              color: AimColors.primary500,
              minHeight: AimSpacing.space8,
            ),
          ),
        ],
      ),
    );
  }
}
