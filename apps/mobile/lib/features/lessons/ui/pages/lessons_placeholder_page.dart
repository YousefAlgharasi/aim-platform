// Phase 6 — P6-069
// LessonsPlaceholderPage — placeholder until lessons UI is built.
//
// RTL/Arabic: AIMTopAppBar handles icon mirroring internally.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/shell/ui/widgets/main_shell_placeholder_card.dart';

class LessonsPlaceholderPage extends StatelessWidget {
  const LessonsPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AIMTopAppBar(title: 'Lessons'),
      body: MainShellPlaceholderCard(
        title: 'Lessons',
        description:
            'Course and lesson browser placeholder. No feature logic is implemented.',
      ),
    );
  }
}
