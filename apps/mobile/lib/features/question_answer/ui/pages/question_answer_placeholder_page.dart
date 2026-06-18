// Phase 6 — P6-083
// QuestionAnswerPlaceholderPage — placeholder until question/answer UI is built.
//
// RTL/Arabic: AIMTopAppBar handles icon mirroring internally.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/shell/ui/widgets/main_shell_placeholder_card.dart';

class QuestionAnswerPlaceholderPage extends StatelessWidget {
  const QuestionAnswerPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AIMTopAppBar(title: 'Practice'),
      body: MainShellPlaceholderCard(
        title: 'Practice',
        description:
            'Question and answer session placeholder. No feature logic is implemented.',
      ),
    );
  }
}
