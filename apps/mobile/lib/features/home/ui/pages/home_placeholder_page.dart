import 'package:flutter/material.dart';

import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';

class HomePlaceholderPage extends StatelessWidget {
  const HomePlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: _HomePlaceholderAppBar(),
      body: MainShellPlaceholderCard(
        title: 'Home',
        description: 'Learner dashboard placeholder. No feature logic is implemented.',
      ),
    );
  }
}

class _HomePlaceholderAppBar extends StatelessWidget implements PreferredSizeWidget {
  const _HomePlaceholderAppBar();

  @override
  Widget build(BuildContext context) {
    return AppBar(title: const Text('AIM Home'));
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
