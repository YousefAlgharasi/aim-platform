// Phase 6 — P6-110
// AchievementsPlaceholderPage — skeleton placeholder for the Achievements
// feature.
//
// Achievements are backend-owned: unlocking logic, badge criteria, and
// milestone tracking are never computed in Flutter.
//
// RTL/Arabic rules:
// - AIMTopAppBar handles back-icon mirroring internally.
// - MainShellPlaceholderCard uses AIMCard which respects Directionality.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/shell/ui/widgets/main_shell_placeholder_card.dart';

/// Skeleton placeholder for the Achievements feature.
///
/// Replace with the real Achievements page when the feature is implemented.
class AchievementsPlaceholderPage extends StatelessWidget {
  const AchievementsPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AIMTopAppBar(title: 'Achievements'),
      body: MainShellPlaceholderCard(
        title: 'Achievements',
        description:
            'Badges and milestones placeholder. '
            'Achievement unlocking is backend-owned.',
      ),
    );
  }
}
