// Phase 6 — P6-106
// AiTeacherPlaceholderPage — shell placeholder for the AI Teacher feature.
//
// The AI Teacher feature is out of scope for Phase 6 (Student Mobile App MVP).
// This page holds the navigation slot and signals to the user that the feature
// is not yet available, using the AIM Mobile Design System.
//
// SHELL RULES (P6-105):
// - No AI provider imports (OpenAI, Anthropic, Gemini, etc.).
// - No AIM Engine calls from Flutter.
// - No conversation state, message history, or chat input.
// - No API keys or credentials.
// - Placeholder UI only — real AI Teacher text mode ships in Phase 8.
//
// RTL/Arabic rules:
// - AIMTopAppBar handles icon mirroring internally.
// - AIMAlertBanner and AIMCard respect ambient Directionality.
// - No hard-coded LTR alignment.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/shell/ui/widgets/main_shell_placeholder_card.dart';

/// Shell placeholder for the AI Teacher tab.
///
/// Shown in Phase 6 while the AI Teacher feature is not yet implemented.
/// Replace with the real AI Teacher page when Phase 8 is executed.
class AiTeacherPlaceholderPage extends StatelessWidget {
  const AiTeacherPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AIMTopAppBar(title: 'AI Teacher'),
      body: MainShellPlaceholderCard(
        title: 'AI Teacher',
        description:
            'Interactive AI tutoring is coming in a future update. '
            'Your personalised AI Teacher will guide you through lessons '
            'and answer questions in real time.',
      ),
    );
  }
}
