// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Profile"
//   docs/design/ui-for-all-system-mobile/screenshots/light/16-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/16-screen.png
// Endpoints: GET /auth/me (via authContextProvider); Home engagement summary
//   (via homeProvider, for the day-streak stat only); GET /student/achievements
//   (via achievementsProvider, for the achievements-earned stat and the
//   achievements carousel).
// Widgets: AIMCard, AIMBadge, AIMFullScreenLoading, AIMFullScreenError
//
// Phase 6 — P6-041 (restyled — TASK-19)
// Profile screen — Student Mobile App MVP.
//
// This is a real-data-only visual restyle (confirmed with the end user,
// scope: "Gradient header, real stats only"). The plain AIMTopAppBar is
// replaced with a bespoke gradient hero header (mirrors AIMGradientHeroHeader
// styling, but built locally because its `trailing` slot cannot cleanly fit
// two icon buttons — bell + edit — side by side; see _ProfileHeroHeader).
// The header shows the avatar, name/email, role + status pill badges, and
// exactly two real stat cards: day streak (homeProvider) and achievements
// earned (achievementsProvider). Below the header, a compact achievements
// carousel is shown (real title/icon only). The following are intentionally
// NOT shown because no backend field backs them: total XP, global/percentile
// rank, the "this week" daily-activity bar chart, and achievement rarity
// tags. The existing ACCOUNT/PROFILE/ROLES/QUICK LINKS sections below are
// unchanged.
//
// Security boundary:
// - Displays only data returned from the backend via authContextProvider,
//   homeProvider, and achievementsProvider.
// - Role badges are UX-only. Backend is the final authority for role enforcement.
// - supabase_auth_uid and internal permission keys are never rendered.
// - homeProvider/achievementsProvider are secondary: their failure or
//   loading state never blocks the primary profile content — stats are
//   simply omitted/zeroed, matching the same graceful-degradation pattern
//   already used in progress_page.dart.
//
// RTL/Arabic rules:
// - EdgeInsetsDirectional / BorderRadiusDirectional used throughout the new
//   header so it mirrors correctly.
// - ListView and all children respect the ambient locale direction.

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
import '../../../home/logic/entity/home_data.dart';
import '../../../home/logic/provider/home_provider.dart';
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
/// respect the ambient locale direction.
///
/// Security:
/// - Reads data only from authContextProvider (backend-sourced), homeProvider,
///   and achievementsProvider.
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
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final authContext = ref.read(authContextProvider);
    final authFlow = ref.read(authFlowProvider);
    final contextData = switch (authContext) {
      AppAsyncSuccess(:final data) => data,
      _ => null,
    };
    if (contextData == null) return;
    final token = authFlow.accessToken;
    if (token == null || token.isEmpty) return;

    // Secondary stats — day streak (homeProvider) and achievements
    // (achievementsProvider). Neither blocks the primary profile content;
    // see class doc comment.
    ref.read(homeProvider.notifier).load(
          bearerToken: token,
          studentId: contextData.user.id,
        );
    ref.read(achievementsProvider.notifier).load(bearerToken: token);
  }

  @override
  Widget build(BuildContext context) {
    final authContextState = ref.watch(authContextProvider);
    final homeState = ref.watch(homeProvider);
    final achievementsState = ref.watch(achievementsProvider);
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

    final goal = switch (homeState) {
      AppAsyncSuccess<HomeData>(:final data) => data.goal,
      _ => null,
    };
    final achievements = switch (achievementsState) {
      AppAsyncSuccess<List<AchievementModel>>(:final data) => data,
      _ => const <AchievementModel>[],
    };

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
            streakDays: goal?.streakDays,
            achievements: achievements,
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

// ── Profile body ──────────────────────────────────────────────────────────────

class _ProfileBody extends StatelessWidget {
  const _ProfileBody({
    required this.authContext,
    required this.surfaces,
    required this.streakDays,
    required this.achievements,
  });

  final AuthContextModel authContext;
  final AimSurfaceTheme surfaces;

  /// Backend-computed day streak from homeProvider, or null if that
  /// secondary call hasn't succeeded yet / failed — rendered as 0.
  final int? streakDays;

  /// Backend-supplied achievements from achievementsProvider, or an empty
  /// list while loading / on failure — the stat and carousel simply omit
  /// gracefully in that case.
  final List<AchievementModel> achievements;

  @override
  Widget build(BuildContext context) {
    final profile = authContext.profile;
    final unlockedCount = achievements.where((a) => a.unlocked).length;

    return ListView(
      padding: EdgeInsets.zero,
      children: [
        _ProfileHeroHeader(
          authContext: authContext,
          streakDays: streakDays ?? 0,
          unlockedCount: unlockedCount,
          totalAchievements: achievements.length,
        ),
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
            vertical: AimSpacing.space24,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
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

  final AuthContextModel authContext;
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
                        'Profile',
                        style: AimTextStyles.title
                            .copyWith(color: AimColors.neutral0),
                      ),
                    ),
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
                const SizedBox(height: AimSpacing.sectionGap),

                // Avatar + name/email + role/status badges.
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: AimSizes.iconLg,
                      backgroundColor:
                          AimColors.neutral0.withValues(alpha: 0.18),
                      child: Text(
                        initials,
                        style: AimTextStyles.title
                            .copyWith(color: AimColors.neutral0),
                      ),
                    ),
                    const SizedBox(width: AimSpacing.componentGap),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (displayName != null)
                            Text(
                              displayName,
                              style: AimTextStyles.h3
                                  .copyWith(color: AimColors.neutral0),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          if (email != null)
                            Text(
                              email,
                              style: AimTextStyles.bodySm.copyWith(
                                color: AimColors.neutral0.withValues(alpha: 0.85),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          const SizedBox(height: AimSpacing.space8),
                          Wrap(
                            spacing: AimSpacing.space8,
                            runSpacing: AimSpacing.space8,
                            children: [
                              for (final role in authContext.roles)
                                AIMBadge(
                                  tone: AIMBadgeTone.neutral,
                                  variant: AIMBadgeVariant.solid,
                                  pill: true,
                                  child: Text(role.name),
                                ),
                              if (authContext.user.status != null)
                                AIMBadge(
                                  tone: AIMBadgeTone.success,
                                  variant: AIMBadgeVariant.solid,
                                  pill: true,
                                  child: Text(authContext.user.status!),
                                ),
                            ],
                          ),
                        ],
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
                        label: 'day streak',
                        trailingEmoji: '🔥',
                      ),
                    ),
                    const SizedBox(width: AimSpacing.componentGap),
                    Expanded(
                      child: _HeroStatCard(
                        value: '$unlockedCount/$totalAchievements',
                        label: 'achievements',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Small semi-transparent white-on-gradient stat card used in the profile
/// hero header. Not a reuse of progress_page.dart's `_StatCard`, which is
/// styled for a white/surface background rather than a gradient one.
class _HeroStatCard extends StatelessWidget {
  const _HeroStatCard({
    required this.value,
    required this.label,
    this.trailingEmoji,
  });

  final String value;
  final String label;
  final String? trailingEmoji;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$value $label',
      child: Container(
        padding: const EdgeInsetsDirectional.symmetric(
          horizontal: AimSpacing.componentGap,
          vertical: AimSpacing.space12,
        ),
        decoration: BoxDecoration(
          color: AimColors.neutral0.withValues(alpha: 0.15),
          borderRadius: AimRadius.borderMd,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              trailingEmoji == null ? value : '$value $trailingEmoji',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: AimSpacing.space4),
            Text(
              label,
              style: AimTextStyles.caption.copyWith(
                color: AimColors.neutral0.withValues(alpha: 0.85),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Achievements carousel ───────────────────────────────────────────────────────

/// Compact horizontal carousel of real achievements (icon + title only — no
/// rarity tag, since [AchievementModel] has no rarity field). Mirrors the
/// design's compact carousel look without inventing any unbacked data.
class _AchievementsCarousel extends StatelessWidget {
  const _AchievementsCarousel({required this.achievements});

  final List<AchievementModel> achievements;

  static const _iconsByName = {
    'emoji_events': Icons.emoji_events,
    'local_fire_department': Icons.local_fire_department,
    'workspace_premium': Icons.workspace_premium,
  };

  IconData _iconFor(AchievementModel achievement) =>
      _iconsByName[achievement.icon] ?? Icons.military_tech;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Achievements',
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

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 72,
      child: Semantics(
        label: achievement.title,
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
              achievement.title,
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
