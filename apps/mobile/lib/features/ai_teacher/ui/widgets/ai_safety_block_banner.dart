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

class AiSafetyBlockBanner extends StatelessWidget {
  const AiSafetyBlockBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return const AIMAlertBanner(
      tone: AIMAlertTone.warning,
      title: 'AI Teacher is limited right now',
      semanticLabel: 'AI Teacher safety limited banner',
      child: Text(
        "Some responses in this conversation were held back to keep things "
        'safe. You can keep chatting, or start a new conversation.',
      ),
    );
  }
}
