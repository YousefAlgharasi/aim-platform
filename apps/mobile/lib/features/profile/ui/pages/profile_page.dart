// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Profile"
//   docs/design/ui-for-all-system-mobile/screenshots/light/16-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/16-screen.png
// Endpoints: GET /auth/me (via authContextProvider); Home engagement summary
//   (via homeProvider, for the day-streak stat only); GET /student/achievements
//   (via achievementsProvider, for the achievements-earned stat and the
//   achievements carousel).
// Widgets: AIMCard, AIMBadge, AIMFullScreenLoading, AIMFullScreenError
//
// Phase 6 — P6-041 (redesigned)
// Profile screen — avatar, name, email, two real stats (day streak and
// achievements earned), and a short menu: certificates, achievements,
// learning path, my course payments, settings. Account internals (status, user
// type, roles, timezone) and developer tools are intentionally not shown.
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
import 'package:go_router/go_router.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../achievements/data/models/achievement_model.dart';
import '../../../achievements/logic/provider/achievements_provider.dart';
import '../../../auth/logic/entity/auth_context.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../home/logic/entity/home_data.dart';
import '../../../home/logic/provider/home_provider.dart';

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

    final l10n = AppLocalizations.of(context);

    return Scaffold(
      body: switch (authContextState) {
        AppAsyncLoading() => AIMFullScreenLoading(
            semanticLabel: l10n.profileLoadingProfile,
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: l10n.profileCouldNotLoad(message),
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
              l10n.profileLoadingProfile,
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

  final AuthContext authContext;
  final AimSurfaceTheme surfaces;

  /// Backend-computed day streak from homeProvider, or null if that
  /// secondary call hasn't succeeded yet / failed — rendered as 0.
  final int? streakDays;

  /// Backend-supplied achievements from achievementsProvider, or an empty
  /// list while loading / on failure.
  final List<AchievementModel> achievements;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final unlockedCount = achievements.where((a) => a.unlocked).length;

    return ListView(
      padding: const EdgeInsets.only(top: AimSpacing.space12, bottom: 72),
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
            vertical: AimSpacing.space20,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _MenuCard(
                surfaces: surfaces,
                items: [
                  _ProfileNavItem(
                    icon: Icons.workspace_premium_outlined,
                    label: l10n.profileLinkCertificates,
                    surfaces: surfaces,
                    onTap: () => context.push(AppRoutePaths.certificates),
                  ),
                  _ProfileNavItem(
                    icon: Icons.emoji_events_outlined,
                    label: l10n.profileLinkAchievements,
                    surfaces: surfaces,
                    onTap: () => context.push(AppRoutePaths.achievements),
                  ),
                  _ProfileNavItem(
                    icon: Icons.route_outlined,
                    label: l10n.profileLinkLearningPath,
                    surfaces: surfaces,
                    onTap: () => context.push(AppRoutePaths.learningPath),
                  ),
                ],
              ),
              const SizedBox(height: AimSpacing.componentGap),
              _MenuCard(
                surfaces: surfaces,
                items: [
                  _ProfileNavItem(
                    icon: Icons.receipt_long_outlined,
                    label: l10n.billingMyPayments,
                    surfaces: surfaces,
                    onTap: () => context.push(AppRoutePaths.myCoursePayments),
                  ),
                  _ProfileNavItem(
                    icon: Icons.settings_outlined,
                    label: l10n.settingsPageTitle,
                    surfaces: surfaces,
                    onTap: () => context.push(AppRoutePaths.accountSettings),
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

// ── Hero ─────────────────────────────────────────────────────────────────────

/// Royal-blue profile card: avatar, name, email and two real stats (day
/// streak, achievements earned). Flat colour with one faint corner detail.
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

  static const Color _royal = Color(0xFF2F4FE0);
  static const Color _royalDark = Color(0xFF2840C4);

  String _initials(String? value) {
    if (value == null || value.trim().isEmpty) return '?';
    final parts = value.trim().split(RegExp(r'[\s@.]+'));
    if (parts.length >= 2 && parts[0].isNotEmpty && parts[1].isNotEmpty) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return value.trim()[0].toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final displayName = authContext.profile?.displayName;
    final email = authContext.user.email;
    final name = (displayName != null && displayName.trim().isNotEmpty)
        ? displayName
        : l10n.commonLearner;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
      child: Container(
        width: double.infinity,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: dark ? _royalDark : _royal,
          borderRadius: BorderRadius.circular(AimRadius.x2l),
          border: dark ? Border.all(color: Colors.white.withValues(alpha: 0.08)) : null,
        ),
        child: Stack(
          children: [
            // One quiet detail in the corner, nothing more.
            PositionedDirectional(
              top: -46,
              end: -34,
              child: Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.06),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsetsDirectional.fromSTEB(
                AimSpacing.space16,
                AimSpacing.space24,
                AimSpacing.space16,
                AimSpacing.space16,
              ),
              child: Column(
                children: [
                  Container(
                    width: 76,
                    height: 76,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withValues(alpha: 0.16),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.35), width: 1.5),
                    ),
                    child: Text(
                      _initials(displayName ?? email),
                      style: AimTextStyles.h2.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space12),
                  Text(
                    name,
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AimTextStyles.h3.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  if (email != null && email.isNotEmpty) ...[
                    const SizedBox(height: AimSpacing.space2),
                    Text(
                      email,
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AimTextStyles.bodySm.copyWith(
                        color: Colors.white.withValues(alpha: 0.78),
                      ),
                    ),
                  ],
                  const SizedBox(height: AimSpacing.space20),
                  Row(
                    children: [
                      Expanded(
                        child: _HeroStatCard(
                          value: '$streakDays',
                          label: l10n.profileStatDayStreak,
                          icon: Icons.local_fire_department_rounded,
                        ),
                      ),
                      const SizedBox(width: AimSpacing.componentGap),
                      Expanded(
                        child: _HeroStatCard(
                          value: '$unlockedCount/$totalAchievements',
                          label: l10n.profileStatAchievements,
                          icon: Icons.emoji_events_rounded,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroStatCard extends StatelessWidget {
  const _HeroStatCard({
    required this.value,
    required this.label,
    required this.icon,
  });

  final String value;
  final String label;
  final IconData icon;

  static const Color _accent = Color(0xFFFFC857);

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$value $label',
      child: Container(
        padding: const EdgeInsetsDirectional.symmetric(
          horizontal: AimSpacing.space12,
          vertical: AimSpacing.space12,
        ),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.10),
          borderRadius: BorderRadius.circular(AimRadius.lg),
          border: Border.all(color: Colors.white.withValues(alpha: 0.14)),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: AimSizes.iconMd, color: _accent),
            ),
            const SizedBox(width: AimSpacing.space12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    value,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AimTextStyles.title.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    label,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AimTextStyles.caption.copyWith(
                      color: Colors.white.withValues(alpha: 0.78),
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
}

// ── Menu ─────────────────────────────────────────────────────────────────────

/// A group of rows in one container, separated by thin dividers that start
/// where the labels start. Same tokens in both themes; only the surface and
/// border colours come from the theme.
class _MenuCard extends StatelessWidget {
  const _MenuCard({required this.items, required this.surfaces});

  final List<Widget> items;
  final AimSurfaceTheme surfaces;

  /// Row padding (16) + icon tile (36) + gap (12): where the label begins.
  static const double dividerIndent = 64;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(AimRadius.xl),
        border: Border.all(color: surfaces.border),
        boxShadow: dark
            ? null
            : [
                BoxShadow(
                  color: AimColors.primary500.withValues(alpha: 0.05),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
      ),
      child: Material(
        color: Colors.transparent,
        child: Column(
          children: [
            for (var i = 0; i < items.length; i++) ...[
              if (i > 0)
                Divider(
                  height: 1,
                  thickness: 1,
                  indent: dividerIndent,
                  endIndent: AimSpacing.space16,
                  color: surfaces.divider,
                ),
              items[i],
            ],
          ],
        ),
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
    final dark = Theme.of(context).brightness == Brightness.dark;
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    return Semantics(
      button: true,
      label: label,
      child: InkWell(
        onTap: onTap,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: 60),
          child: Padding(
            padding: const EdgeInsetsDirectional.symmetric(
              horizontal: AimSpacing.space16,
              vertical: AimSpacing.space12,
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AimColors.primary500.withValues(alpha: dark ? 0.22 : 0.10),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    icon,
                    size: AimSizes.iconMd,
                    color: dark ? AimColors.primary300 : AimColors.primary600,
                  ),
                ),
                const SizedBox(width: AimSpacing.space12),
                Expanded(
                  child: Text(
                    label,
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Icon(
                  isRtl ? Icons.chevron_left_rounded : Icons.chevron_right_rounded,
                  size: AimSizes.iconMd,
                  color: surfaces.textMuted,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
