// Phase 18 — P18-064
// AiSafetyBlockBanner — safe "limited" status banner for the AI Teacher
// chat screen.
//
// Renders only the fixed, student-safe `status: 'limited'` outcome from
// GET /ai-teacher/sessions/:id/safety-status. Never displays the raw
// reason_category taxonomy or any rejected message/response content
// (docs/phase-18/ai-teacher-api-contracts.md), and never references
// mastery/level/weakness/difficulty/recommendation/review-schedule.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class AiSafetyBlockBanner extends StatelessWidget {
  const AiSafetyBlockBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AIMAlertBanner(
      tone: AIMAlertTone.warning,
      title: l10n.aiTeacherSafetyLimitedTitle,
      semanticLabel: l10n.aiTeacherSafetyLimitedBannerSemantic,
      child: Text(l10n.aiTeacherSafetyLimitedBody),
    );
  }
}
