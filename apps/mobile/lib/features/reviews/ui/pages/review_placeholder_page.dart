import 'package:flutter/material.dart';

import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';

class ReviewPlaceholderPage extends StatelessWidget {
  const ReviewPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: _ReviewPlaceholderAppBar(),
      body: MainShellPlaceholderCard(
        title: 'Review',
        description: 'Review and retention placeholder. Retention scheduling is backend-owned.',
      ),
    );
  }
}

class _ReviewPlaceholderAppBar extends StatelessWidget implements PreferredSizeWidget {
  const _ReviewPlaceholderAppBar();

  @override
  Widget build(BuildContext context) {
    return AppBar(title: const Text('AIM Review'));
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
