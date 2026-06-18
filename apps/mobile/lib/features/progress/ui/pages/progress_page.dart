// Phase 6 — P6-097
// ProgressPage — placeholder for the progress screen.
//
// Rendered until the full progress UI is built in P6-098..P6-101.
// No AIM Engine calls, no AI provider calls, no local AIM computation.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/shell/ui/widgets/main_shell_placeholder_card.dart';

class ProgressPage extends StatelessWidget {
  const ProgressPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AIMTopAppBar(title: 'Progress'),
      body: MainShellPlaceholderCard(
        title: 'Progress',
        description: 'Progress placeholder. Full UI built in P6-098..P6-101.',
      ),
    );
  }
}
