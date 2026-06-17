import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';

class ProgressPlaceholderPage extends StatelessWidget {
  const ProgressPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AIMTopAppBar(title: 'Progress'),
      body: const MainShellPlaceholderCard(
        title: 'Progress',
        description:
            'Progress placeholder. Mastery and level are never calculated in Flutter.',
      ),
    );
  }
}
