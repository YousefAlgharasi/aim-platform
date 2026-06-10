import 'package:flutter/material.dart';

import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';

class ProfilePlaceholderPage extends StatelessWidget {
  const ProfilePlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: _ProfilePlaceholderAppBar(),
      body: MainShellPlaceholderCard(
        title: 'Profile',
        description: 'Profile placeholder. Real account data will come from the Backend API.',
      ),
    );
  }
}

class _ProfilePlaceholderAppBar extends StatelessWidget implements PreferredSizeWidget {
  const _ProfilePlaceholderAppBar();

  @override
  Widget build(BuildContext context) {
    return AppBar(title: const Text('AIM Profile'));
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
