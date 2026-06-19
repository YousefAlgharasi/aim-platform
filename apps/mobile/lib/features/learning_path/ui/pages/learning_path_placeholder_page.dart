// Phase 6 — P6-063
// LearningPathPlaceholderPage — shell placeholder for the learning path screen.
//
// Uses AIM Mobile Design System components only (AIMTopAppBar,
// MainShellPlaceholderCard). No feature logic is implemented here.
// Backend remains the sole authority for all AIM learning-path values.

import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';

/// Placeholder page for the Learning Path feature.
/// Rendered until the full learning-path UI is built in later tasks.
/// No AIM Engine calls, no AI provider calls, no local learning computation.
class LearningPathPlaceholderPage extends StatelessWidget {
  const LearningPathPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AIMTopAppBar(title: 'Learning Path'),
      body: MainShellPlaceholderCard(
        title: 'Learning Path',
        description:
            'Learning path placeholder. No feature logic is implemented.',
      ),
    );
  }
}
