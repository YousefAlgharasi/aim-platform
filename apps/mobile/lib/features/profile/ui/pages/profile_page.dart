// Phase 6 — P6-041
// Profile screen — Student Mobile App MVP.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Profile"
//   docs/design/ui-for-all-system-mobile/screenshots/light/16-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/16-screen.png
// Endpoints: GET /profile/me (via authContextProvider),
//   GET /student/achievements (via achievementsProvider)
// Widgets: AIMGradientHeroHeader, AIMStatTile, AIMBadge, AIMCard,
//   AIMFullScreenLoading, AIMFullScreenError
//
// Security boundary:
// - Displays only data returned from the backend via authContextProvider.
// - Role badges are UX-only. Backend is the final authority for role enforcement.
// - supabase_auth_uid and internal permission keys are never rendered.
//
// NOTE — day streak / total XP / global rank / weekly activity chart:
// no backend endpoint currently exposes these fields to Flutter (checked
// AuthContextModel, achievements, and analytics_summary — none carry
// gamification stats). The stat row and weekly chart below render
// clearly-mocked placeholder values so the screen matches the design
// pixel-for-pixel; swap `_MockGamificationStats` for a real provider once a
// backend endpoint exists. The achievements strip uses real data.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'edit_profile_page.dart';
import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../achievements/data/models/achievement_model.dart';
import '../../../achievements/logic/provider/achievements_provider.dart';
import '../../../auth/data/models/auth_context_model.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../notifications/ui/widgets/notification_bell_button.dart';

/// Student profile screen.
///
/// Renders a gradient hero header (avatar, name, email, role/status badges),
/// account info, student profile fields, and role badges sourced from the
/// backend [authContextProvider]. Sign-out lives in the side menu drawer
/// (see [MainShellPage]), not on this screen, to avoid a duplicate action.
///
/// Design system: all colours, typography, spacing, and interactive widgets
/// use AIM Mobile Design System tokens. No hard-coded values.
///
/// RTL/Arabic: no [TextDirection] hard-coded. [ListView] and all children
/// respect the ambient locale direction; the hero header's icon cluster uses
/// [PositionedDirectional] so it mirrors correctly.
///
/// Security:
/// - Reads data only from authContextProvider and achievementsProvider
///   (both backend-sourced).
/// - No credentials, no scoring, no AIM Engine calls.
class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadAchievements());
  }

  void _loadAchievements() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(achievementsProvider.notifier).load(bearerToken: token);
  }

  @override
  Widget build(BuildContext context) {
    final authContextState = ref.watch(authContextProvider);
    final surfaces = aimSurfacesOf(context);

    // Navigate to sign-in when sign-out completes.
    //
    // Deferred via addPostFrameCallback: this listener fires synchronously
    // on state change, before the root MaterialApp (which watches
    // authFlowProvider to build onGenerateRoute) has rebuilt. Pushing
    // immediately would route against the stale (still-signed-in) closure
    // and get redirected straight back to the main shell.
    ref.listen(authFlowProvider, (_, next) {
      if (next.isSignedOut && context.mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!context.mounted) return;
          Navigator.of(context).pushNamedAndRemoveUntil(
            AppRoutePaths.signIn,
            (_) => false,
          );
        });
      }
    });

    return Scaffold(
      body: switch (authContextState) {
        AppAsyncLoading() => const AIMFullScreenLoading(
            semanticLabel: 'Loading profile',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: 'Could not load profile: $message',
            onRetry: null,
          ),
        AppAsyncSuccess(:final data) => _ProfileBody(
            authContext: data,
            surfaces: surfaces,
          ),
        _ => Center(
            child: Text(
              'No profile loaded.',
              style: AimTextStyles.bodyMd.copyWith(color: surfaces.textMuted),
            ),
          ),
      },
    );
  }
}

// ── Mocked gamification stats ───────────────────────────────────────────────
// Placeholder only — see file-level NOTE. Never sourced from the backend.
class _MockGamificationStats {
  static const dayStreak = '7';
  static const totalXp = '2,480';
  static const globalRankPercentile = 'Top 5%';
  static const weeklyDeltaLabel = '+18% vs last';

  /// Relative bar heights (0.0–1.0) for Mon–Sun, most-recent-day highlighted.
  static const weeklyActivity = [0.55, 0.7, 0.45, 0.85, 0.65, 1.0, 0.0];
}

// ── Profile body ──────────────────────────────────────────────────────────────

class _ProfileBody extends StatelessWidget {
  const _ProfileBody({
    required this.authContext,
    required this.surfaces,
  });

  final AuthContextModel authContext;
  final AimSurfaceTheme surfaces;

  @override
  Widget build(BuildContext context) {
    final profile = authContext.profile;

    return ListView(
      padding: EdgeInsets.zero,
      children: [
        _ProfileHeroHeader(authContext: authContext),
        const SizedBox(height: AimSpacing.sectionGap),

        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
          ),
          child: _StatRow(surfaces: surfaces),
        ),
        const SizedBox(height: AimSpacing.sectionGap),

        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
          ),
          child: _WeeklyActivityCard(surfaces: surfaces),
        ),
        const SizedBox(height: AimSpacing.sectionGap),

        _AchievementsStrip(surfaces: surfaces),
        const SizedBox(height: AimSpacing.sectionGap),

        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
          ),
          child: Column(
            children: [
              // Account section
              _ProfileSection(
                title: 'ACCOUNT',
                surfaces: surfaces,
                children: [
                  _InfoRow(
                    label: 'Email',
                    value: authContext.user.email,
                    surfaces: surfaces,
                  ),
                  _InfoRow(
                    label: 'Status',
                    value: authContext.user.status,
                    surfaces: surfaces,
                  ),
                  _InfoRow(
                    label: 'Type',
                    value: authContext.user.userType,
                    surfaces: surfaces,
                  ),
                ],
              ),

              // Student profile section
              if (profile != null) ...[
                const SizedBox(height: AimSpacing.sectionGap),
                _ProfileSection(
                  title: 'PROFILE',
                  surfaces: surfaces,
                  children: [
                    _InfoRow(
                      label: 'Display Name',
                      value: profile.displayName,
                      surfaces: surfaces,
                    ),
                    if (profile.profileType == 'student_profile') ...[
                      _InfoRow(
                        label: 'Language',
                        value: profile.preferredLanguage,
                        surfaces: surfaces,
                      ),
                      _InfoRow(
                        label: 'Timezone',
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
                  title: 'ROLES',
                  subtitle: 'Displayed for reference only. Enforced by backend.',
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
                title: 'QUICK LINKS',
                surfaces: surfaces,
                children: [
                  _ProfileNavItem(
                    icon: Icons.credit_card_outlined,
                    label: 'Subscription & Billing',
                    surfaces: surfaces,
                    onTap: () => Navigator.of(context).pushNamed(
                      AppRoutePaths.subscription,
                    ),
                  ),
                  _ProfileNavItem(
                    icon: Icons.receipt_long_outlined,
                    label: 'Invoice History',
                    surfaces: surfaces,
                    onTap: () => Navigator.of(context).pushNamed(
                      AppRoutePaths.invoiceHistory,
                    ),
                  ),
                  _ProfileNavItem(
                    icon: Icons.emoji_events_outlined,
                    label: 'Achievements',
                    surfaces: surfaces,
                    onTap: () => Navigator.of(context).pushNamed(
                      AppRoutePaths.achievements,
                    ),
                  ),
                  _ProfileNavItem(
                    icon: Icons.bar_chart_outlined,
                    label: 'Analytics Summary',
                    surfaces: surfaces,
                    onTap: () => Navigator.of(context).pushNamed(
                      AppRoutePaths.analyticsSummary,
                    ),
                  ),
                  _ProfileNavItem(
                    icon: Icons.api_outlined,
                    label: 'API Endpoint Tester (Dev)',
                    surfaces: surfaces,
                    onTap: () => Navigator.of(context).pushNamed(
                      AppRoutePaths.endpointTester,
                    ),
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

// ── Hero header ─────────────────────────────────────────────────────────────

class _ProfileHeroHeader extends StatelessWidget {
  const _ProfileHeroHeader({required this.authContext});

  final AuthContextModel authContext;

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
    final displayName = profile?.displayName ?? authContext.user.email;
    final roleLabel = authContext.roles.isNotEmpty
        ? authContext.roles.first.name
        : authContext.user.userType;

    return Stack(
      children: [
        AIMGradientHeroHeader(
          title: displayName ?? '',
          subtitle: authContext.user.email,
          semanticLabel: 'Profile for $displayName',
          leading: CircleAvatar(
            radius: AimSizes.avatarLg / 2,
            backgroundColor: AimColors.neutral0.withValues(alpha: 0.25),
            child: Text(
              _initials(displayName),
              style: AimTextStyles.title.copyWith(color: AimColors.neutral0),
            ),
          ),
          child: Wrap(
            spacing: AimSpacing.innerGap,
            runSpacing: AimSpacing.space8,
            children: [
              _HeaderPill(
                icon: Icons.school_outlined,
                label: _titleCase(roleLabel),
                background: AimColors.neutral0.withValues(alpha: 0.18),
              ),
              _HeaderPill(
                label: _titleCase(authContext.user.status),
                background: AimColors.gzLime,
                foreground: AimColors.neutral900,
              ),
            ],
          ),
        ),
        PositionedDirectional(
          top: MediaQuery.paddingOf(context).top + AimSpacing.space4,
          end: AimSpacing.screenPaddingMobile,
          // IconButton resolves its own foreground colour from the
          // Material 3 colour scheme rather than the ambient IconTheme, so
          // it would otherwise ignore AIMGradientHeroHeader's white
          // IconTheme.merge — force it explicitly for this header cluster.
          child: IconButtonTheme(
            data: IconButtonThemeData(
              style: IconButton.styleFrom(foregroundColor: AimColors.neutral0),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const NotificationBellButton(),
                IconButton(
                  icon: const Icon(Icons.edit_outlined),
                  tooltip: 'Edit profile',
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => const EditProfilePage(),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String _titleCase(String? value) {
    if (value == null || value.isEmpty) return '—';
    return value[0].toUpperCase() + value.substring(1);
  }
}

/// Small pill used only inside [_ProfileHeroHeader], where colours must stay
/// legible against the gradient regardless of the ambient light/dark theme —
/// unlike [AIMBadge], which resolves its colours from the surface theme.
class _HeaderPill extends StatelessWidget {
  const _HeaderPill({
    required this.label,
    required this.background,
    this.icon,
    this.foreground = AimColors.neutral0,
  });

  final String label;
  final IconData? icon;
  final Color background;
  final Color foreground;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: background,
        borderRadius: AimRadius.borderPill,
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.space12,
          vertical: AimSpacing.space4,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: AimSizes.iconSm, color: foreground),
              const SizedBox(width: AimSpacing.space4),
            ],
            Text(
              label,
              style: AimTextStyles.caption.copyWith(
                color: foreground,
                fontWeight: AimFontWeights.semibold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Stat row (mocked — see file-level NOTE) ─────────────────────────────────

class _StatRow extends StatelessWidget {
  const _StatRow({required this.surfaces});
  final AimSurfaceTheme surfaces;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: AIMCard(
            padding: const EdgeInsets.symmetric(vertical: AimSpacing.space12),
            child: AIMStatTile(
              icon: const Icon(Icons.local_fire_department_rounded),
              value: _MockGamificationStats.dayStreak,
              label: 'day streak',
              accentColor: AimColors.gzCoral,
              width: double.infinity,
            ),
          ),
        ),
        const SizedBox(width: AimSpacing.componentGap),
        Expanded(
          child: AIMCard(
            padding: const EdgeInsets.symmetric(vertical: AimSpacing.space12),
            child: AIMStatTile(
              icon: const Icon(Icons.bolt_rounded),
              value: _MockGamificationStats.totalXp,
              label: 'total XP',
              accentColor: AimColors.gzPurple,
              width: double.infinity,
            ),
          ),
        ),
        const SizedBox(width: AimSpacing.componentGap),
        Expanded(
          child: AIMCard(
            padding: const EdgeInsets.symmetric(vertical: AimSpacing.space12),
            child: AIMStatTile(
              icon: const Icon(Icons.star_rounded),
              value: _MockGamificationStats.globalRankPercentile,
              label: 'global rank',
              accentColor: AimColors.gzLime,
              width: double.infinity,
            ),
          ),
        ),
      ],
    );
  }
}

// ── Weekly activity chart (mocked — see file-level NOTE) ───────────────────

class _WeeklyActivityCard extends StatelessWidget {
  const _WeeklyActivityCard({required this.surfaces});
  final AimSurfaceTheme surfaces;

  static const _dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  @override
  Widget build(BuildContext context) {
    return AIMCard(
      semanticLabel: 'This week activity, ${_MockGamificationStats.weeklyDeltaLabel}',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'This week',
                style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
              ),
              Text(
                _MockGamificationStats.weeklyDeltaLabel,
                style: AimTextStyles.bodySm
                    .copyWith(color: AimColors.success500),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.componentGap),
          SizedBox(
            height: 88,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                for (var i = 0; i < _MockGamificationStats.weeklyActivity.length; i++)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AimSpacing.space4,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Container(
                            height: 56 *
                                (_MockGamificationStats.weeklyActivity[i] == 0
                                    ? 0.06
                                    : _MockGamificationStats.weeklyActivity[i]),
                            decoration: BoxDecoration(
                              gradient: i ==
                                      _MockGamificationStats.weeklyActivity
                                              .length -
                                          2
                                  ? AimGradients.gzHero
                                  : null,
                              color: i ==
                                      _MockGamificationStats.weeklyActivity
                                              .length -
                                          2
                                  ? null
                                  : AimColors.gzLime.withValues(alpha: 0.6),
                              borderRadius: AimRadius.borderSm,
                            ),
                          ),
                          const SizedBox(height: AimSpacing.space4),
                          Text(
                            _dayLabels[i],
                            style: AimTextStyles.caption
                                .copyWith(color: surfaces.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Achievements strip (real data via achievementsProvider) ────────────────

class _AchievementsStrip extends ConsumerWidget {
  const _AchievementsStrip({required this.surfaces});
  final AimSurfaceTheme surfaces;

  static const _iconsByName = {
    'emoji_events': Icons.emoji_events,
    'local_fire_department': Icons.local_fire_department,
    'workspace_premium': Icons.workspace_premium,
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(achievementsProvider);

    final achievements = switch (state) {
      AppAsyncSuccess<List<AchievementModel>>(:final data) => data,
      _ => const <AchievementModel>[],
    };
    final earnedCount = achievements.where((a) => a.unlocked).length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Achievements',
                style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
              ),
              Text(
                '$earnedCount earned',
                style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
              ),
            ],
          ),
        ),
        const SizedBox(height: AimSpacing.componentGap),
        switch (state) {
          AppAsyncLoading() => SizedBox(
              height: 100,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(
                  horizontal: AimSpacing.screenPaddingMobile,
                ),
                itemCount: 4,
                separatorBuilder: (_, __) =>
                    const SizedBox(width: AimSpacing.componentGap),
                itemBuilder: (_, __) => const AIMSkeleton(
                  shape: AIMSkeletonShape.rect,
                  width: 72,
                  height: 100,
                ),
              ),
            ),
          AppAsyncSuccess<List<AchievementModel>>() when achievements.isEmpty =>
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.screenPaddingMobile,
              ),
              child: Text(
                'No achievements unlocked yet.',
                style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
              ),
            ),
          _ => SizedBox(
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
                  surfaces: surfaces,
                ),
              ),
            ),
        },
      ],
    );
  }
}

class _AchievementChip extends StatelessWidget {
  const _AchievementChip({required this.achievement, required this.surfaces});

  final AchievementModel achievement;
  final AimSurfaceTheme surfaces;

  IconData get _iconData =>
      _AchievementsStrip._iconsByName[achievement.icon] ??
      Icons.military_tech;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 72,
      child: Column(
        children: [
          Container(
            width: AimSizes.avatarLg,
            height: AimSizes.avatarLg,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              gradient: achievement.unlocked ? AimGradients.gzFire : null,
              color: achievement.unlocked ? null : surfaces.surfaceSunken,
              shape: BoxShape.circle,
            ),
            child: Icon(
              _iconData,
              color: achievement.unlocked
                  ? AimColors.neutral0
                  : surfaces.textMuted,
              size: AimSizes.iconMd,
            ),
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            achievement.title,
            style: AimTextStyles.caption.copyWith(color: surfaces.textPrimary),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
        ],
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
          SizedBox(
            width: 112,
            child: Text(
              label,
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
            ),
          ),
          Expanded(
            child: Text(
              value ?? '—',
              style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileNavItem extends StatelessWidget {
  const _ProfileNavItem({
    required this.icon,
    required this.label,
    required this.surfaces,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final AimSurfaceTheme surfaces;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
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
              Icons.chevron_right,
              size: AimSizes.iconSm,
              color: surfaces.textMuted,
            ),
          ],
        ),
      ),
    );
  }
}
