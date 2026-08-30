import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../achievements/data/models/achievement_model.dart';
import '../../../achievements/logic/provider/achievements_provider.dart';
import '../../../auth/logic/entity/auth_context.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../auth/logic/provider/logout_provider.dart';

/// Student Profile Page — high-fidelity design prototype implementation.
///
/// Displays:
/// 1. Centered gradient avatar with initial, display name, and email.
/// 2. Menu action cards:
///    - Edit Profile & Settings
///    - Achievements & Milestones
///    - Subscription Plan
///    - Log Out (destructive action with red icon and text)
///
/// Features full Light and Dark mode theme support using AIM Design Tokens.
class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authContextState = ref.watch(authContextProvider);
    final surfaces = aimSurfacesOf(context);

    // Navigation to sign-in when sign-out completes is handled declaratively
    // by AppRouter's `redirect` (see AimMobileApp), which re-evaluates
    // authFlowProvider via a refresh listenable.

    final goal = switch (homeState) {
      AppAsyncSuccess<HomeData>(:final data) => data.goal,
      _ => null,
    };
    final achievements = switch (achievementsState) {
      AppAsyncSuccess<List<AchievementModel>>(:final data) => data,
      _ => const <AchievementModel>[],
    };

    final l10n = Localizations.of<AppLocalizations>(context, AppLocalizations);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: switch (authContextState) {
        AppAsyncLoading() => AIMFullScreenLoading(
            semanticLabel: l10n?.profileLoadingProfile ?? 'Loading profile',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: l10n?.profileCouldNotLoad(message) ?? 'Could not load profile: $message',
            onRetry: null,
          ),
        AppAsyncSuccess(:final data) => _ProfileBody(
            authContext: data,
            surfaces: surfaces,
            streakDays: goal?.streakDays,
            achievements: achievements,
          ),
        _ => Center(
            child: Text(
              l10n?.profileNoProfileLoaded ?? 'No profile loaded.',
              style: AimTextStyles.bodyMd.copyWith(color: surfaces.textMuted),
            ),
          ),
        _ => const SizedBox.shrink(),
      },
    );
  }
}

class _ProfileBody extends ConsumerWidget {
  const _ProfileBody({
    required this.authContext,
  });

  final AuthContext authContext;

  @override
  Widget build(BuildContext context) {
    final l10n = Localizations.of<AppLocalizations>(context, AppLocalizations);
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final profile = authContext.profile;
    final displayName = profile?.displayName ??
        ((authContext.user.email != null && authContext.user.email!.isNotEmpty)
            ? authContext.user.email!.split('@').first
            : 'Alex Johnson');
    final email = authContext.user.email ?? 'alex.johnson@example.com';
    final initial =
        displayName.isNotEmpty ? displayName[0].toUpperCase() : 'A';

    final logoutState = ref.watch(logoutProvider);
    final isLoggingOut = logoutState.isLoading;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
            vertical: AimSpacing.space20,
          ),
          child: Column(
            children: [
              // Achievements carousel — omitted entirely while loading/idle
              // or when there are no achievements, per graceful-degradation
              // rules (the dedicated Achievements page already has its own
              // empty state).
              if (achievements.isNotEmpty) ...[
                _AchievementsCarousel(achievements: achievements),
                const SizedBox(height: AimSpacing.sectionGap),
              ],

              // Account section
              _ProfileSection(
                title: l10n?.profileSectionAccount ?? 'ACCOUNT',
                surfaces: surfaces,
                children: [
                  _InfoRow(
                    label: l10n?.profileLabelEmail ?? 'Email',
                    value: authContext.user.email,
                    surfaces: surfaces,
                  ),
                  _InfoRow(
                    label: l10n?.profileLabelStatus ?? 'Status',
                    value: authContext.user.status,
                    surfaces: surfaces,
                  ),
                  _InfoRow(
                    label: l10n?.profileLabelType ?? 'Type',
                    value: authContext.user.userType,
                    surfaces: surfaces,
                  ),
                ],
              ),

              // Student profile section
              if (profile != null) ...[
                const SizedBox(height: AimSpacing.sectionGap),
                _ProfileSection(
                  title: l10n?.profileSectionProfile ?? 'PROFILE',
                  surfaces: surfaces,
                  children: [
                    _InfoRow(
                      label: l10n?.profileLabelDisplayName ?? 'Display Name',
                      value: profile.displayName,
                      surfaces: surfaces,
                    ),
                    if (profile.profileType == 'student_profile') ...[
                      _InfoRow(
                        label: l10n?.profileLabelLanguage ?? 'Language',
                        value: profile.preferredLanguage,
                        surfaces: surfaces,
                      ),
                      _InfoRow(
                        label: l10n?.profileLabelTimezone ?? 'Timezone',
                        value: profile.timezone,
                        surfaces: surfaces,
                      ),
                    ],
                  ],
                ),
              ],

              // Roles section
              if (authContext.roles.isNotEmpty) ...[
                const SizedBox(height: AimSpacing.sectionGap),
                _ProfileSection(
                  title: l10n?.profileSectionRoles ?? 'ROLES',
                  subtitle: l10n?.profileRolesSubtitle ?? 'Displayed for reference only. Enforced by backend.',
                  surfaces: surfaces,
                  children: [
                    Wrap(
                      spacing: AimSpacing.innerGap,
                      runSpacing: AimSpacing.innerGap,
                      children: authContext.roles
                          .map(
                            (r) => AIMBadge(
                              tone: AIMBadgeTone.primary,
                              child: Text(r.name),
                            ),
                          )
                          .toList(),
                    ),
                  ],
                ),
              ],

              const SizedBox(height: AimSpacing.sectionGap),

              // Quick links section
              _ProfileSection(
                title: l10n?.profileSectionQuickLinks ?? 'QUICK LINKS',
                surfaces: surfaces,
                children: [
                  _ProfileNavItem(
                    icon: Icons.route_outlined,
                    label: l10n?.profileLinkLearningPath ?? 'Learning Path',
                    surfaces: surfaces,
                    onTap: () => context.push(AppRoutePaths.learningPath),
                  ),
                  _ProfileNavItem(
                    icon: Icons.credit_card_outlined,
                    label: l10n?.profileLinkSubscriptionBilling ?? 'Subscription & Billing',
                    surfaces: surfaces,
                    onTap: () => context.push(AppRoutePaths.subscription),
                  ),
                  _ProfileNavItem(
                    icon: Icons.receipt_long_outlined,
                    label: l10n?.profileLinkInvoiceHistory ?? 'Invoice History',
                    surfaces: surfaces,
                    onTap: () => context.push(AppRoutePaths.invoiceHistory),
                  ),
                  _ProfileNavItem(
                    icon: Icons.emoji_events_outlined,
                    label: l10n?.profileLinkAchievements ?? 'Achievements',
                    surfaces: surfaces,
                    onTap: () => context.push(AppRoutePaths.achievements),
                  ),
                  _ProfileNavItem(
                    icon: Icons.bar_chart_outlined,
                    label: l10n?.profileLinkAnalyticsSummary ?? 'Analytics Summary',
                    surfaces: surfaces,
                    onTap: () => context.push(AppRoutePaths.analyticsSummary),
                  ),
                  _ProfileNavItem(
                    icon: Icons.api_outlined,
                    label: l10n?.profileLinkApiEndpointTester ?? 'API Endpoint Tester (Dev)',
                    surfaces: surfaces,
                    onTap: () => context.push(AppRoutePaths.endpointTester),
                  ),
                ],
              ),

              const SizedBox(height: AimSpacing.sectionGap),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Gradient hero header ───────────────────────────────────────────────────────

/// Bespoke gradient hero header for the profile screen.
///
/// Visually mirrors [AIMGradientHeroHeader]'s styling (same gradient,
/// bottom-corner radius, padding, SafeArea, and IconTheme/DefaultTextStyle
/// merges), but is not built on top of it directly: that widget's `trailing`
/// slot is a single widget wrapped in a fixed touch-target-sized SizedBox,
/// which cannot cleanly fit two icon buttons (bell + edit) side by side.
/// This mirrors the same bespoke-widget-when-shared-doesn't-fit approach
/// already used for the Achievements page and Voice Teacher headers.
class _ProfileHeroHeader extends StatelessWidget {
  const _ProfileHeroHeader({
    required this.authContext,
    required this.streakDays,
    required this.unlockedCount,
    required this.totalAchievements,
  });

  final AuthContext authContext;
  final int streakDays;
  final int unlockedCount;
  final int totalAchievements;

  String _initials(String? value) {
    if (value == null || value.isEmpty) return '?';
    final parts = value.trim().split(RegExp(r'[\s@.]+'));
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return value[0].toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final profile = authContext.profile;
    final displayName = profile?.displayName;
    final email = authContext.user.email;
    final initials = _initials(displayName ?? email);

    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.sectionGap,
        AimSpacing.screenPaddingMobile,
        AimSpacing.sectionGap,
      ),
      decoration: const BoxDecoration(
        gradient: AimGradients.gzHero,
        borderRadius: BorderRadiusDirectional.only(
          bottomStart: Radius.circular(AimRadius.x2l),
          bottomEnd: Radius.circular(AimRadius.x2l),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: IconTheme.merge(
          data: const IconThemeData(
            color: AimColors.neutral0,
            size: AimSizes.iconMd,
          ),
          child: DefaultTextStyle.merge(
            style: const TextStyle(color: AimColors.neutral0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top row: "Profile" label + bell/edit actions.
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        Localizations.of<AppLocalizations>(context, AppLocalizations)?.profileTitle ?? 'Profile',
                        style: AimTextStyles.title
                            .copyWith(color: AimColors.neutral0),
                      ),
                    ),
                    const NotificationBellButton(),
                    IconButton(
                      icon: const Icon(Icons.settings_outlined),
                      tooltip: Localizations.of<AppLocalizations>(context, AppLocalizations)?.profileTooltipAccountSettings ?? 'Account Settings',
                      onPressed: () =>
                          context.push(AppRoutePaths.accountSettings),
                    ),
                  ],
                ),
                const SizedBox(height: AimSpacing.sectionGap),

                // Avatar + name/email + role/status badges.
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
              const SizedBox(height: AimSpacing.space16),

              // Centered Avatar + Name + Email
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: AimGradients.ai,
                        boxShadow: [
                          BoxShadow(
                            color:
                                const Color(0xFF4F46E5).withValues(alpha: 0.3),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Text(
                        initial,
                        style: AimTextStyles.h1.copyWith(
                          color: AimColors.neutral0,
                          fontWeight: AimFontWeights.extrabold,
                          fontSize: 30,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AimSpacing.sectionGap),

                // Stat row — day streak + achievements earned. Exactly two
                // real stats; no XP or rank card (not backend-backed).
                Row(
                  children: [
                    Expanded(
                      child: _HeroStatCard(
                        value: '$streakDays',
                        label: Localizations.of<AppLocalizations>(context, AppLocalizations)?.profileStatDayStreak ?? 'day streak',
                        trailingIcon: Icons.local_fire_department_rounded,
                      ),
                    ),
                    const SizedBox(width: AimSpacing.componentGap),
                    Expanded(
                      child: _HeroStatCard(
                        value: '$unlockedCount/$totalAchievements',
                        label: Localizations.of<AppLocalizations>(context, AppLocalizations)?.profileStatAchievements ?? 'achievements',
                    const SizedBox(height: AimSpacing.space12),
                    Text(
                      displayName,
                      style: AimTextStyles.h2.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: AimFontWeights.bold,
                        fontSize: 20,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      email,
                      style: AimTextStyles.bodySm.copyWith(
                        color: surfaces.textMuted,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          Localizations.of<AppLocalizations>(context, AppLocalizations)?.profileAchievementsCarouselTitle ?? 'Achievements',
          style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
        ),
        const SizedBox(height: AimSpacing.componentGap),
        // The caller (_ProfileBody) only mounts this widget when
        // achievements.isNotEmpty, so no loading/empty branch is needed here.
        SizedBox(
          height: 100,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(
              horizontal: AimSpacing.screenPaddingMobile,
            ),
            itemCount: achievements.length,
            separatorBuilder: (_, __) =>
                const SizedBox(width: AimSpacing.componentGap),
            itemBuilder: (_, i) => _AchievementChip(
              achievement: achievements[i],
              icon: _iconFor(achievements[i]),
              surfaces: surfaces,
            ),
          ),
        ),
      ],
    );
  }
}

/// Compact icon-circle + title tile for one unlocked achievement. No rarity
/// tag is rendered — [AchievementModel] has no rarity field.
class _AchievementChip extends StatelessWidget {
  const _AchievementChip({
    required this.achievement,
    required this.icon,
    required this.surfaces,
  });

  final AchievementModel achievement;
  final IconData icon;
  final AimSurfaceTheme surfaces;

  String _title(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return switch (achievement.key) {
      'first_lesson_complete' || 'first_step' =>
        l10n.achievementFirstLessonCompleteTitle,
      'five_lessons_complete' =>
        l10n.achievementFiveLessonsCompleteTitle,
      'three_day_streak' =>
        l10n.achievementThreeDayStreakTitle,
      'seven_day_streak' || 'streak_master' =>
        l10n.achievementSevenDayStreakTitle,
      'first_assessment_passed' =>
        l10n.achievementFirstAssessmentPassedTitle,
      'grammar_wizard' =>
        l10n.achievementsGrammarWizardTitle,
      'voice_champion' =>
        l10n.achievementsVoiceChampionTitle,
      'vocabulary_titan' =>
        l10n.achievementsVocabularyTitanTitle,
      'speed_learner' =>
        l10n.achievementsSpeedLearnerTitle,
      'perfect_quiz' =>
        l10n.achievementsPerfectQuizTitle,
      'polyglot_legend' =>
        l10n.achievementsPolyglotLegendTitle,
      _ => achievement.title,
    };
  }

  @override
  Widget build(BuildContext context) {
    final title = _title(context);
    return SizedBox(
      width: 72,
      child: Semantics(
        label: title,
        child: Column(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: const BoxDecoration(
                gradient: AimGradients.gzFire,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Icon(icon, color: AimColors.neutral0, size: AimSizes.iconMd),
            ),
            const SizedBox(height: AimSpacing.space8),
            Text(
              title,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AimTextStyles.caption.copyWith(color: surfaces.textPrimary),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Section card ──────────────────────────────────────────────────────────────

class _ProfileSection extends StatelessWidget {
  const _ProfileSection({
    required this.title,
    required this.children,
    required this.surfaces,
    this.subtitle,
  });

  final String title;
  final String? subtitle;
  final List<Widget> children;
  final AimSurfaceTheme surfaces;

  @override
  Widget build(BuildContext context) {
    return AIMCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AimTextStyles.label.copyWith(
              color: AimColors.primary600,
              letterSpacing: 1.2,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: AimSpacing.space2),
            Text(
              subtitle!,
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
            ),
          ],
          const SizedBox(height: AimSpacing.componentGap),
          ...children,
        ],
      ),
    );
  }
}

// ── Info row ──────────────────────────────────────────────────────────────────

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
    required this.surfaces,
  });

  final String label;
  final String? value;
  final AimSurfaceTheme surfaces;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AimSpacing.space4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ConstrainedBox(
            constraints: const BoxConstraints(minWidth: 112),
            child: Padding(
              padding: const EdgeInsetsDirectional.only(end: AimSpacing.space8),
              child: Text(
                label,
                style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
              ),
            ),
          ),
          Expanded(
            child: Text(
              value ?? '—',
              style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary),
            ),
              const SizedBox(height: AimSpacing.space24),

              // Action Menu Stack
              _ProfileOptionCard(
                icon: Icons.person_outline_rounded,
                label: 'Edit Profile & Settings',
                onTap: () => context.push(AppRoutePaths.accountSettings),
              ),
              const SizedBox(height: 8),
              _ProfileOptionCard(
                icon: Icons.emoji_events_outlined,
                label: 'Achievements & Milestones',
                onTap: () => context.push(AppRoutePaths.achievements),
              ),
              const SizedBox(height: 8),
              _ProfileOptionCard(
                icon: Icons.credit_card_outlined,
                label: 'Subscription Plan',
                onTap: () => context.push(AppRoutePaths.subscription),
              ),
              const SizedBox(height: 8),
              _ProfileOptionCard(
                icon: Icons.logout_rounded,
                label: 'Log Out',
                isDanger: true,
                isLoading: isLoggingOut,
                onTap: isLoggingOut
                    ? null
                    : () {
                        final token =
                            ref.read(authFlowProvider).accessToken ?? '';
                        ref.read(logoutProvider.notifier).logout(token);
                      },
              ),

              const SizedBox(height: AimSpacing.space32),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileOptionCard extends StatelessWidget {
  const _ProfileOptionCard({
    required this.icon,
    required this.label,
    required this.onTap,
    this.isDanger = false,
    this.isLoading = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool isDanger;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    return InkWell(
      onTap: onTap,
      borderRadius: AimRadius.borderMd,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AimSpacing.space8),
        child: Row(
          children: [
            Icon(icon, size: AimSizes.iconSm, color: AimColors.primary600),
            const SizedBox(width: AimSpacing.componentGap),
            Expanded(
              child: Text(
                label,
                style: AimTextStyles.bodyMd
                    .copyWith(color: surfaces.textPrimary),
              ),
            ),
            Icon(
              isRtl ? Icons.chevron_left : Icons.chevron_right,
              size: AimSizes.iconSm,
              color: surfaces.textMuted,
            ),
          ],
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final iconColor = isDanger
        ? AimColors.error500
        : (isDark ? AimColors.primary300 : const Color(0xFF4F46E5));
    final textColor = isDanger ? AimColors.error500 : surfaces.textPrimary;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.space16,
            vertical: AimSpacing.space16,
          ),
          decoration: BoxDecoration(
            color: surfaces.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: surfaces.border),
          ),
          child: Row(
            children: [
              if (isLoading)
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AimColors.error500,
                  ),
                )
              else
                Icon(
                  icon,
                  size: 20,
                  color: iconColor,
                ),
              const SizedBox(width: 14),
              Expanded(
                child: Text(
                  label,
                  style: AimTextStyles.bodyMd.copyWith(
                    color: textColor,
                    fontWeight: AimFontWeights.semibold,
                    fontSize: 14,
                  ),
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                size: 18,
                color: surfaces.textMuted,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
