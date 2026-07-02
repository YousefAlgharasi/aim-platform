// Phase 6 — P6-089
// QuestionStemCard — renders the question's topic tag (if any) and stem.
//
// All content is backend-supplied verbatim. Flutter never infers difficulty
// or modifies the stem. Design screen 32 shows the first backend tag as a
// small-caps topic label above the stem, not the difficulty level.

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
          if (question.tags.isNotEmpty) ...[
            Text(
              question.tags.first.toUpperCase(),
              style: AimTextStyles.caption.copyWith(
                color: surfaces.textSecondary,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: AimSpacing.space4),
          ],
          Text(
            question.stem,
            style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
          ),
          if (question.hint != null) ...[
            const SizedBox(height: AimSpacing.componentGap),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
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
