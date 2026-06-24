import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

class AchievementsPage extends StatelessWidget {
  const AchievementsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AIMTopAppBar(title: 'Achievements'),
      body: AIMEmptyState(
        icon: Icon(Icons.emoji_events_outlined),
        title: 'No achievements yet',
        subtitle:
            'Complete lessons and practice sessions to earn badges and milestones.',
      ),
    );
  }
}
