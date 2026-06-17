import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';

class LearnPlaceholderPage extends StatelessWidget {
  const LearnPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AIMTopAppBar(title: 'Learn'),
      body: const MainShellPlaceholderCard(
        title: 'Learn',
        description:
            'Lessons and learning path placeholder. No local AIM logic is implemented.',
      ),
    );
  }
}
