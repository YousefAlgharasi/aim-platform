// Phase 6 — P6-089
// AttemptAcknowledgementCard — shown after the backend acknowledges a
// submitted attempt.
//
// CRITICAL SECURITY RULE:
// - This card displays ONLY what the backend returned in AttemptResult.
// - There is no is_correct, no correctness verdict, no AIM score shown.
// - aimOutcome is displayed as an opaque status string — never used to
//   gate UI logic or infer correctness.
// - The backend will deliver full feedback via the session state endpoint
//   (separate flow, out of scope for P6-089).

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/question_answer/logic/entity/attempt_result.dart';

class AttemptAcknowledgementCard extends StatelessWidget {
  const AttemptAcknowledgementCard({required this.result, super.key});

  final AttemptResult result;

  @override
  Widget build(BuildContext context) {
    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: 'Answer submitted',
      child: Row(
        children: [
          Icon(
            Icons.check_circle_outline,
            size: AimSizes.iconMd,
            color: AimColors.success500,
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Answer submitted',
                  style: AimTextStyles.label
                      .copyWith(color: AimColors.success500),
                ),
                const SizedBox(height: AimSpacing.space2),
                Text(
                  'AIM is analysing your response.',
                  style: AimTextStyles.bodySm.copyWith(
                    color: aimSurfacesOf(context).textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
