// Phase 6 — P6-091
// SessionFeedbackCard — displays the backend-approved AIM session summary
// after an attempt is acknowledged.
//
// All values (itemsAttempted, itemsCorrect, overallMasteryShift,
// skillsTouched) are backend-computed and displayed verbatim.
// Flutter never computes, modifies, or re-interprets these values.
//
// CRITICAL SECURITY RULES:
// - itemsCorrect is a backend aggregate — never used to derive per-question
//   correctness or compute mastery locally.
// - overallMasteryShift is an opaque AIM Engine output; Flutter displays as
//   a label only.
// - skillsTouched are backend-resolved skill keys; displayed verbatim.
// - found == false means AIM pipeline hasn't finished — show pending state.
//
// RTL/Arabic rules:
// - Column/CrossAxisAlignment.start: direction-aware.
// - EdgeInsets.symmetric: RTL-safe.
// - AIMBadge: direction-agnostic pill.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/question_answer/logic/entity/session_feedback.dart';

class SessionFeedbackCard extends StatelessWidget {
  const SessionFeedbackCard({required this.feedback, super.key});

  final SessionFeedback feedback;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    if (!feedback.found) {
      return AIMCard(
        variant: AIMCardVariant.elevated,
        child: Row(
          children: [
            const SizedBox(
              width: AimSizes.iconMd,
              height: AimSizes.iconMd,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            const SizedBox(width: AimSpacing.componentGap),
            Expanded(
              child: Text(
                'AIM is analysing your session…',
                style: AimTextStyles.bodySm
                    .copyWith(color: surfaces.textSecondary),
              ),
            ),
          ],
        ),
      );
    }

    return AIMCard(
      variant: AIMCardVariant.ai,
      semanticLabel: 'Session feedback from AIM',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.auto_awesome_outlined,
                size: AimSizes.iconSm,
                color: AimColors.primary400,
              ),
              const SizedBox(width: AimSpacing.space4),
              Text(
                'Session Summary',
                style: AimTextStyles.label
                    .copyWith(color: AimColors.primary500),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.componentGap),
          if (feedback.itemsAttempted != null) ...[
            _SummaryRow(
              label: 'Questions attempted',
              value: '${feedback.itemsAttempted}',
              surfaces: surfaces,
            ),
          ],
          if (feedback.itemsCorrect != null) ...[
            const SizedBox(height: AimSpacing.space4),
            _SummaryRow(
              label: 'Correct (backend score)',
              value: '${feedback.itemsCorrect}',
              surfaces: surfaces,
            ),
          ],
          if (feedback.overallMasteryShift != null) ...[
            const SizedBox(height: AimSpacing.space4),
            _SummaryRow(
              label: 'Mastery shift',
              value: feedback.overallMasteryShift!,
              surfaces: surfaces,
            ),
          ],
          if (feedback.skillsTouched != null &&
              feedback.skillsTouched!.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.componentGap),
            Text(
              'Skills covered',
              style: AimTextStyles.label
                  .copyWith(color: surfaces.textSecondary),
            ),
            const SizedBox(height: AimSpacing.space8),
            Wrap(
              spacing: AimSpacing.space8,
              runSpacing: AimSpacing.space8,
              children: feedback.skillsTouched!
                  .map((s) => AIMBadge(
                        tone: AIMBadgeTone.primary,
                        variant: AIMBadgeVariant.soft,
                        pill: true,
                        child: Text(s),
                      ))
                  .toList(),
            ),
          ],
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    required this.surfaces,
  });

  final String label;
  final String value;
  final AimSurfaceTheme surfaces;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style:
                AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary)),
        Text(value,
            style: AimTextStyles.label.copyWith(color: surfaces.textPrimary)),
      ],
    );
  }
}
