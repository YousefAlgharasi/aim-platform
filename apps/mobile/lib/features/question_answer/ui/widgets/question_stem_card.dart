// Phase 6 — P6-089
// QuestionStemCard — renders the question stem and optional difficulty badge.
//
// All content is backend-supplied verbatim. Flutter never infers difficulty
// or modifies the stem.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';

class QuestionStemCard extends StatelessWidget {
  const QuestionStemCard({required this.question, super.key});

  final QuestionModel question;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return AIMCard(
      variant: AIMCardVariant.elevated,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  question.stem,
                  style: AimTextStyles.title
                      .copyWith(color: surfaces.textPrimary),
                ),
              ),
              const SizedBox(width: AimSpacing.innerGap),
              AIMBadge(
                tone: AIMBadgeTone.neutral,
                variant: AIMBadgeVariant.soft,
                pill: true,
                semanticLabel: 'Difficulty: ${question.difficulty}',
                child: Text(question.difficulty),
              ),
            ],
          ),
          if (question.hint != null) ...[
            const SizedBox(height: AimSpacing.componentGap),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.lightbulb_outline,
                  size: AimSizes.iconSm,
                  color: AimColors.warning500,
                ),
                const SizedBox(width: AimSpacing.space4),
                Expanded(
                  child: Text(
                    question.hint!,
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textSecondary),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
