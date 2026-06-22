import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../notifications/ui/widgets/notification_bell_button.dart';
import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';

class HomePlaceholderPage extends StatelessWidget {
  const HomePlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AIMTopAppBar(
        title: 'Home',
        actions: [NotificationBellButton()],
      ),
      body: MainShellPlaceholderCard(
        title: 'Home',
        description:
            'Learner dashboard placeholder. No feature logic is implemented.',
      ),
    );
  }
}
