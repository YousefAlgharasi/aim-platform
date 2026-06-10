import 'package:flutter/material.dart';

import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';

class LearnPlaceholderPage extends StatelessWidget {
  const LearnPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: _LearnPlaceholderAppBar(),
      body: MainShellPlaceholderCard(
        title: 'Learn',
        description: 'Lessons and learning path placeholder. No local AIM logic is implemented.',
      ),
    );
  }
}

class _LearnPlaceholderAppBar extends StatelessWidget implements PreferredSizeWidget {
  const _LearnPlaceholderAppBar();

  @override
  Widget build(BuildContext context) {
    return AppBar(title: const Text('AIM Learn'));
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
