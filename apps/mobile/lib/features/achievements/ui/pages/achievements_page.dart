// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Achievements"
//   docs/design/ui-for-all-system-mobile/screenshots/light/59-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/59-screen.png
// Endpoint: GET /student/achievements
// Widgets: AIMFullScreenLoading, AIMFullScreenError, AIMEmptyState,
//   AIMGradientButton, AIMCard
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/routing.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../data/models/achievement_model.dart';
import '../../logic/provider/achievements_provider.dart';

/// Achievements screen — Student Mobile App.
///
/// Flow:
/// 1. On first frame, loads `GET /student/achievements` via
///    [AchievementsNotifier] (studentId is JWT-resolved server-side; Flutter
///    never passes it).
/// 2. Renders one of four states: loading, error (with retry), empty (no
///    achievements yet), or a badge gallery of unlocked/locked achievements.
///
/// Backend authority: achievement unlocking, badge criteria, XP, streaks,
/// and milestone tracking are never computed in Flutter — every field shown
/// here is backend-supplied verbatim.
///
/// Design system: all colours, typography, spacing, and interactive widgets
/// use AIM Mobile Design System tokens. No hard-coded values.
///
/// RTL/Arabic: no [TextDirection] is hard-coded. [EdgeInsetsDirectional] and
/// [AlignmentDirectional] are used throughout so the layout mirrors correctly.
class AchievementsPage extends ConsumerStatefulWidget {
  const AchievementsPage({super.key});

  @override
  ConsumerState<AchievementsPage> createState() => _AchievementsPageState();
}

class _AchievementsPageState extends ConsumerState<AchievementsPage> {
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

  void _goToMainShell() {
    Navigator.of(context).pushNamedAndRemoveUntil(
      AppRoutePaths.mainShell,
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(achievementsProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        children: [
          _GradientHeader(onBack: () => Navigator.of(context).pop()),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() || AppAsyncIdle() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading achievements',
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: _load,
                ),
              AppAsyncSuccess(:final data) => data.isEmpty
                  ? _EmptyAchievements(onStartLearning: _goToMainShell)
                  : _AchievementsGallery(achievements: data),
            },
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Gradient header — mirrors RegisterPage's bespoke back-button/title pattern.
// ---------------------------------------------------------------------------

class _GradientHeader extends StatelessWidget {
  const _GradientHeader({required this.onBack});

  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: 'Back',
              child: InkWell(
                onTap: onBack,
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.arrow_back,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.componentGap),
            Text(
              'Achievements',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty state — matches light/59-screen.png & dark/59-screen.png exactly.
// ---------------------------------------------------------------------------

class _EmptyAchievements extends StatelessWidget {
  const _EmptyAchievements({required this.onStartLearning});

  final VoidCallback onStartLearning;

  @override
  Widget build(BuildContext context) {
    return AIMEmptyState(
      icon: const Icon(Icons.emoji_events_outlined),
      title: 'No achievements yet',
      subtitle:
          'Complete lessons and practice sessions to earn badges and milestones.',
      action: AIMGradientButton(
        label: 'Start learning',
        onPressed: onStartLearning,
        semanticLabel: 'Start learning',
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Badge gallery — non-empty state.
// ---------------------------------------------------------------------------

class _AchievementsGallery extends StatelessWidget {
  const _AchievementsGallery({required this.achievements});

  final List<AchievementModel> achievements;

  @override
  Widget build(BuildContext context) {
    // Group by category, preserving first-seen order. Categories are
    // backend-supplied raw values; only the display label is derived here.
    final byCategory = <String, List<AchievementModel>>{};
    for (final achievement in achievements) {
      byCategory.putIfAbsent(achievement.category, () => []).add(achievement);
    }

    return ListView(
      padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
      children: [
        for (final entry in byCategory.entries) ...[
          Padding(
            padding: const EdgeInsetsDirectional.only(
              bottom: AimSpacing.componentGap,
            ),
            child: Text(
              _titleCase(entry.key),
              style: AimTextStyles.title.copyWith(
                color: aimSurfacesOf(context).textPrimary,
              ),
            ),
          ),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: entry.value.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: AimSpacing.componentGap,
              crossAxisSpacing: AimSpacing.componentGap,
              childAspectRatio: 0.72,
            ),
            itemBuilder: (context, index) =>
                _AchievementBadgeCard(achievement: entry.value[index]),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
        ],
      ],
    );
  }

  String _titleCase(String value) {
    if (value.isEmpty) return value;
    return value[0].toUpperCase() + value.substring(1);
  }
}

class _AchievementBadgeCard extends StatelessWidget {
  const _AchievementBadgeCard({required this.achievement});

  final AchievementModel achievement;

  static const _iconsByName = {
    'emoji_events': Icons.emoji_events,
    'local_fire_department': Icons.local_fire_department,
    'workspace_premium': Icons.workspace_premium,
  };

  IconData get _iconData => _iconsByName[achievement.icon] ?? Icons.military_tech;

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr);
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      return '${months[date.month - 1]} ${date.day}, ${date.year}';
    } catch (_) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final unlocked = achievement.unlocked;
    final iconBg = unlocked ? AimColors.primary500 : surfaces.disabledBg;
    final iconFg = unlocked ? AimColors.neutral0 : surfaces.disabledFg;

    return AIMCard(
      padding: const EdgeInsets.all(AimSpacing.space12),
      semanticLabel: unlocked
          ? '${achievement.title}, unlocked'
          : '${achievement.title}, locked',
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: iconBg,
              shape: BoxShape.circle,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space12),
              child: Icon(_iconData, size: AimSizes.iconLg, color: iconFg),
            ),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          Text(
            achievement.title,
            style: AimTextStyles.label.copyWith(
              color: unlocked ? surfaces.textPrimary : surfaces.textMuted,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            achievement.description,
            style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          if (unlocked && achievement.unlockedAt != null) ...[
            const SizedBox(height: AimSpacing.space4),
            Text(
              _formatDate(achievement.unlockedAt),
              style: AimTextStyles.caption.copyWith(color: surfaces.textLink),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}
