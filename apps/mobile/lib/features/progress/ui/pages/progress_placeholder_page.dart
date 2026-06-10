import 'package:flutter/material.dart';

import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';

class ProgressPlaceholderPage extends StatelessWidget {
  const ProgressPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: _ProgressPlaceholderAppBar(),
      body: MainShellPlaceholderCard(
        title: 'Progress',
        description: 'Progress placeholder. Mastery and level are never calculated in Flutter.',
      ),
    );
  }
}

class _ProgressPlaceholderAppBar extends StatelessWidget implements PreferredSizeWidget {
  const _ProgressPlaceholderAppBar();

  @override
  Widget build(BuildContext context) {
    return AppBar(title: const Text('AIM Progress'));
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
