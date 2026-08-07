import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/design_tokens/aim_colors.dart';
import '../../../../core/design_tokens/aim_sizes.dart';
import '../../../../core/design_tokens/aim_spacing.dart';
import '../../../../core/design_tokens/aim_typography.dart';
import '../../../../core/state/app_async_state.dart';

import '../../../auth/data/models/auth_context_model.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../data/models/achievement_model.dart';
import '../../logic/provider/achievements_provider.dart';

/// Data class representing a display badge item (unlocked or in progress).
class _BadgeItem {
  const _BadgeItem({
    required this.key,
    required this.title,
    required this.description,
    required this.icon,
    required this.isUnlocked,
    this.currentProgress = 0,
    this.maxProgress = 0,
  });

  final String key;
  final String title;
  final String description;
  final IconData icon;
  final bool isUnlocked;
  final int currentProgress;
  final int maxProgress;
}

class AchievementsPage extends ConsumerStatefulWidget {
  const AchievementsPage({super.key});

  @override
  ConsumerState<AchievementsPage> createState() => _AchievementsPageState();
}

class _AchievementsPageState extends ConsumerState<AchievementsPage> {
  int _selectedTab = 0; // 0: All, 1: Unlocked, 2: In Progress

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(achievementsProvider.notifier).load(bearerToken: token);
  }

  /// Default badges matching Figma prototype
  List<_BadgeItem> _getDefaultBadges() {
    return const [
      _BadgeItem(
        key: 'first_step',
        title: 'First Step',
        description: 'Complete your first English lesson',
        icon: Icons.menu_book_rounded,
        isUnlocked: true,
      ),
      _BadgeItem(
        key: 'streak_master',
        title: 'Streak Master',
        description: 'Maintain a 7-day learning streak',
        icon: Icons.local_fire_department_outlined,
        isUnlocked: true,
      ),
      _BadgeItem(
        key: 'grammar_wizard',
        title: 'Grammar Wizard',
        description: 'Score 90%+ in Grammar assessment',
        icon: Icons.check_circle_outline_rounded,
        isUnlocked: true,
      ),
      _BadgeItem(
        key: 'voice_champion',
        title: 'Voice Champion',
        description: 'Complete 5 Live AI Voice practice sessions',
        icon: Icons.mic_none_rounded,
        isUnlocked: true,
      ),
      _BadgeItem(
        key: 'vocabulary_titan',
        title: 'Vocabulary Titan',
        description: 'Master 200+ active words',
        icon: Icons.emoji_events_outlined,
        isUnlocked: true,
      ),
      _BadgeItem(
        key: 'speed_learner',
        title: 'Speed Learner',
        description: 'Finish 3 lessons in a single day',
        icon: Icons.bolt_rounded,
        isUnlocked: false,
        currentProgress: 2,
        maxProgress: 3,
      ),
      _BadgeItem(
        key: 'perfect_quiz',
        title: 'Perfect Quiz Accuracy',
        description: 'Score 100% on 5 practice quizzes',
        icon: Icons.star_outline_rounded,
        isUnlocked: false,
        currentProgress: 3,
        maxProgress: 5,
      ),
      _BadgeItem(
        key: 'polyglot_legend',
        title: 'Polyglot Legend',
        description: 'Reach Level 20 in English',
        icon: Icons.workspace_premium_outlined,
        isUnlocked: false,
        currentProgress: 12,
        maxProgress: 20,
      ),
    ];
  }

  List<_BadgeItem> _buildBadgeList(List<AchievementModel>? backendAchievements) {
    if (backendAchievements == null || backendAchievements.isEmpty) {
      return _getDefaultBadges();
    }

    final Map<String, IconData> iconLookup = {
      'emoji_events': Icons.emoji_events_outlined,
      'local_fire_department': Icons.local_fire_department_outlined,
      'workspace_premium': Icons.workspace_premium_outlined,
      'menu_book': Icons.menu_book_rounded,
      'check_circle': Icons.check_circle_outline_rounded,
      'mic': Icons.mic_none_rounded,
      'bolt': Icons.bolt_rounded,
      'star': Icons.star_outline_rounded,
    };

    return backendAchievements.map((ach) {
      final icon = iconLookup[ach.icon] ?? Icons.emoji_events_outlined;
      return _BadgeItem(
        key: ach.key,
        title: ach.title,
        description: ach.description,
        icon: icon,
        isUnlocked: ach.unlocked,
        currentProgress: ach.unlocked ? 1 : 0,
        maxProgress: 1,
      );
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(achievementsProvider);
    final authContextState = ref.watch(authContextProvider);
    final authData = switch (authContextState) {
      AppAsyncSuccess(:final data) => data,
      _ => null,
    };

    final backendList = switch (state) {
      AppAsyncSuccess(:final data) => data,
      _ => null,
    };

    final allBadges = _buildBadgeList(backendList);
    final unlockedBadges = allBadges.where((b) => b.isUnlocked).toList();
    final inProgressBadges = allBadges.where((b) => !b.isUnlocked).toList();

    final displayedBadges = switch (_selectedTab) {
      1 => unlockedBadges,
      2 => inProgressBadges,
      _ => allBadges,
    };

    return Scaffold(
      backgroundColor: AimColors.neutral50,
      body: SafeArea(
        child: Column(
          children: [
            // Top Header
            _buildTopHeader(context, authData),
            const SizedBox(height: AimSpacing.space8),

            // Scrollable Content
            Expanded(
              child: ListView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.only(bottom: AimSpacing.space24),
                children: [
                  // Milestone Banner Card
                  _buildMilestoneBanner(
                    unlockedBadges.length,
                    allBadges.length,
                  ),

                  // Filter Segment Tabs
                  _buildFilterTabs(
                    selectedTab: _selectedTab,
                    onTabSelected: (index) {
                      setState(() => _selectedTab = index);
                    },
                    unlockedCount: unlockedBadges.length,
                    inProgressCount: inProgressBadges.length,
                  ),

                  // Badges List
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AimSpacing.space16,
                    ),
                    child: Column(
                      children: [
                        for (final badge in displayedBadges) ...[
                          _BadgeCard(badge: badge),
                          const SizedBox(height: AimSpacing.space12),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopHeader(BuildContext context, AuthContextModel? authContext) {
    final displayName = authContext?.profile?.displayName ??
        ((authContext?.user.email != null && authContext!.user.email!.isNotEmpty)
            ? authContext.user.email!.split('@').first
            : 'Alex Johnson');
    final avatarLetter =
        displayName.isNotEmpty ? displayName[0].toUpperCase() : 'A';

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.space16,
        vertical: AimSpacing.space12,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          GestureDetector(
            onTap: () => context.pop(),
            child: Container(
              width: 40,
              height: 40,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AimColors.secondary50.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.arrow_back_rounded,
                size: AimSizes.iconMd,
                color: AimColors.neutral800,
              ),
            ),
          ),
          Text(
            'Achievements',
            style: AimTextStyles.h3.copyWith(
              color: AimColors.neutral900,
              fontWeight: AimFontWeights.bold,
            ),
          ),
          Container(
            width: 40,
            height: 40,
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              color: AimColors.secondary500,
              shape: BoxShape.circle,
            ),
            child: Text(
              avatarLetter,
              style: AimTextStyles.bodyLg.copyWith(
                color: AimColors.neutral0,
                fontWeight: AimFontWeights.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMilestoneBanner(int unlockedCount, int totalCount) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AimSpacing.space16),
      padding: const EdgeInsets.all(AimSpacing.space16),
      decoration: BoxDecoration(
        color: AimColors.neutral0,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AimColors.neutral200),
        boxShadow: [
          BoxShadow(
            color: AimColors.neutral900.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.emoji_events_outlined,
                    color: Color(0xFFD97706),
                    size: 22,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'AIM Milestones',
                    style: AimTextStyles.bodyLg.copyWith(
                      color: AimColors.neutral900,
                      fontWeight: AimFontWeights.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                '$unlockedCount of $totalCount badges unlocked',
                style: AimTextStyles.bodySm.copyWith(
                  color: AimColors.neutral500,
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AimColors.secondary50,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'Gold League #3',
              style: AimTextStyles.caption.copyWith(
                color: AimColors.secondary600,
                fontWeight: AimFontWeights.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTabs({
    required int selectedTab,
    required ValueChanged<int> onTabSelected,
    required int unlockedCount,
    required int inProgressCount,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: AimSpacing.space16,
        vertical: AimSpacing.space16,
      ),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AimColors.neutral100,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Expanded(
            child: _TabPill(
              label: 'All Badges',
              isSelected: selectedTab == 0,
              onTap: () => onTabSelected(0),
            ),
          ),
          Expanded(
            child: _TabPill(
              label: 'Unlocked ($unlockedCount)',
              isSelected: selectedTab == 1,
              onTap: () => onTabSelected(1),
            ),
          ),
          Expanded(
            child: _TabPill(
              label: 'In Progress ($inProgressCount)',
              isSelected: selectedTab == 2,
              onTap: () => onTabSelected(2),
            ),
          ),
        ],
      ),
    );
  }
}

class _TabPill extends StatelessWidget {
  const _TabPill({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 10),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? AimColors.neutral0 : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AimColors.neutral900.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: AimTextStyles.caption.copyWith(
            color: isSelected
                ? AimColors.secondary600
                : AimColors.neutral600,
            fontWeight:
                isSelected ? AimFontWeights.bold : AimFontWeights.medium,
            fontSize: 11,
          ),
        ),
      ),
    );
  }
}

class _BadgeCard extends StatelessWidget {
  const _BadgeCard({required this.badge});

  final _BadgeItem badge;

  @override
  Widget build(BuildContext context) {
    final bool hasProgress =
        !badge.isUnlocked && badge.maxProgress > 0;
    final double progressRatio = hasProgress
        ? (badge.currentProgress / badge.maxProgress).clamp(0.0, 1.0)
        : 0.0;

    return Container(
      padding: const EdgeInsets.all(AimSpacing.space16),
      decoration: BoxDecoration(
        color: AimColors.neutral0,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AimColors.neutral200),
        boxShadow: [
          BoxShadow(
            color: AimColors.neutral900.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Squircle Icon
              Container(
                width: 48,
                height: 48,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: badge.isUnlocked
                      ? AimColors.secondary50
                      : AimColors.neutral100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  badge.icon,
                  color: badge.isUnlocked
                      ? AimColors.secondary600
                      : AimColors.neutral500,
                  size: 24,
                ),
              ),
              const SizedBox(width: AimSpacing.componentGap),

              // Title and Subtitle
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      badge.title,
                      style: AimTextStyles.bodyLg.copyWith(
                        color: AimColors.neutral900,
                        fontWeight: AimFontWeights.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      badge.description,
                      style: AimTextStyles.bodySm.copyWith(
                        color: AimColors.neutral500,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              // Unlocked Tag Badge
              if (badge.isUnlocked) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFD1FAE5),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Unlocked',
                    style: AimTextStyles.caption.copyWith(
                      color: const Color(0xFF059669),
                      fontWeight: AimFontWeights.bold,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ],
          ),

          // Progress Bar for In-Progress Items
          if (hasProgress) ...[
            const SizedBox(height: AimSpacing.space12),
            Row(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: progressRatio,
                      minHeight: 6,
                      backgroundColor: AimColors.neutral200,
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        AimColors.secondary500,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '${badge.currentProgress}/${badge.maxProgress}',
                  style: AimTextStyles.caption.copyWith(
                    color: AimColors.neutral500,
                    fontWeight: AimFontWeights.bold,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
