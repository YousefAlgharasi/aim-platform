import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';

class HomePlaceholderPage extends StatelessWidget {
  const HomePlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AIMTopAppBar(title: 'Home'),
      body: const MainShellPlaceholderCard(
        title: 'Home',
        description:
            'Learner dashboard placeholder. No feature logic is implemented.',
      ),
    );
  }
}
