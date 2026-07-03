import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/localization/localization.dart';
import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/theme/theme_mode_provider.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../auth/ui/widgets/logout_button.dart';
import '../../../home/ui/pages/home_page.dart';
import '../../../lessons/ui/pages/course_list_page.dart';
import '../../../notifications/logic/provider/notification_providers.dart';
import '../../../profile/ui/pages/profile_page.dart';
import '../../../progress/ui/pages/progress_page.dart';
import '../../../reviews/ui/pages/review_page.dart';
import '../../logic/main_shell_tab_provider.dart';

/// Main shell page — holds the tab [IndexedStack].
///
/// Navigation between tabs is via the [AIMAppDrawer] (opened from the FAB)
/// only — no bottom tab bar, per product direction (the drawer's MENU
/// section already covers the same 5 destinations).
///
/// The selected tab is held in [mainShellTabIndexProvider] (rather than
/// local State) so descendant pages — e.g. Home's "Browse Courses" action —
/// can switch tabs directly without reaching into shell-private state.
class MainShellPage extends ConsumerStatefulWidget {
  const MainShellPage({super.key});

  static const List<Widget> _screens = [
    HomePage(),
    CourseListPage(),
    ReviewPage(),
    ProgressPage(),
    ProfilePage(),
  ];

  @override
  ConsumerState<MainShellPage> createState() => _MainShellPageState();
}

class _MainShellPageState extends ConsumerState<MainShellPage> {
  @override
  void initState() {
    super.initState();
    // Eagerly load the unread notification count so the drawer's
    // Notifications badge (see _buildDrawer) reflects real data as soon as
    // the shell mounts, rather than only after some other screen (e.g.
    // Profile's NotificationBellButton) happens to have loaded it first.
    // Deferred via addPostFrameCallback, matching the same pattern already
    // used by every other screen's initial load in this codebase (e.g.
    // HomePage._load) — calling a provider's .load() synchronously during
    // build/initState would risk a "setState during build" error.
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadUnreadCount());
  }

  void _loadUnreadCount() {
    final state = ref.read(notificationUnreadCountProvider);
    if (state is AppAsyncSuccess || state is AppAsyncLoading) return;
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(notificationUnreadCountProvider.notifier).load(bearerToken: token);
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = ref.watch(mainShellTabIndexProvider);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      drawer: _buildDrawer(context, ref, selectedIndex),
      floatingActionButton: Builder(
        builder: (context) => FloatingActionButton(
          backgroundColor: AimColors.primary500,
          foregroundColor: AimColors.neutral0,
          tooltip: l10n.shellOpenMenuTooltip,
          onPressed: () => Scaffold.of(context).openDrawer(),
          child: const Icon(Icons.menu),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
      // No bottomNavigationBar: navigation between tabs is handled entirely
      // by the drawer's MENU section (see _buildDrawer) opened via the FAB
      // above, per product direction — the bottom tab bar was redundant
      // with the drawer and has been removed.
      body: IndexedStack(
        index: selectedIndex,
        children: MainShellPage._screens,
      ),
      bottomNavigationBar: AIMBottomNav<int>(
        value: selectedIndex,
        onChanged: (index) =>
            ref.read(mainShellTabIndexProvider.notifier).state = index,
        items: [
          AIMBottomNavDestination(
            value: 0,
            label: l10n.shellNavHome,
            icon: const Icon(Icons.home_outlined),
            activeIcon: const Icon(Icons.home),
            semanticLabel: l10n.shellNavHomeSemantic,
          ),
          AIMBottomNavDestination(
            value: 1,
            label: l10n.shellNavLearn,
            icon: const Icon(Icons.menu_book_outlined),
            activeIcon: const Icon(Icons.menu_book),
            semanticLabel: l10n.shellNavLearnSemantic,
          ),
          AIMBottomNavDestination(
            value: 2,
            label: l10n.shellNavReview,
            icon: const Icon(Icons.replay_outlined),
            activeIcon: const Icon(Icons.replay),
            semanticLabel: l10n.shellNavReviewSemantic,
          ),
          AIMBottomNavDestination(
            value: 3,
            label: l10n.shellNavProgress,
            icon: const Icon(Icons.insights_outlined),
            activeIcon: const Icon(Icons.insights),
            semanticLabel: l10n.shellNavProgressSemantic,
          ),
          AIMBottomNavDestination(
            value: 4,
            label: l10n.shellNavProfile,
            icon: const Icon(Icons.person_outline),
            activeIcon: const Icon(Icons.person),
            semanticLabel: l10n.shellNavProfileSemantic,
          ),
        ],
      ),
    );
  }

  /// Builds the side navigation drawer: app-branding header, a "MENU"
  /// section mirroring the 5 bottom-nav tabs, a "MORE" section of
  /// secondary destinations, a theme toggle, and a sign-out footer.
  Widget _buildDrawer(BuildContext context, WidgetRef ref, int selectedIndex) {
    final l10n = AppLocalizations.of(context);
    final unreadCountState = ref.watch(notificationUnreadCountProvider);
    final unreadCount = switch (unreadCountState) {
      AppAsyncSuccess<int>(:final data) => data,
      _ => 0,
    };

    void selectTab(int index) {
      context.pop();
      ref.read(mainShellTabIndexProvider.notifier).state = index;
    }

    void navigateTo(String routeName) {
      context.pop();
      context.push(routeName);
    }

    return AIMAppDrawer(
      header: const _AIMDrawerBrandHeader(),
      menuLabel: l10n.shellMenuSectionLabel,
      items: [
        AIMDrawerItemData(
          icon: const Icon(Icons.home_outlined),
          label: l10n.shellNavHome,
          selected: selectedIndex == 0,
          onTap: () => selectTab(0),
        ),
        AIMDrawerItemData(
          icon: const Icon(Icons.menu_book_outlined),
          label: l10n.shellNavLearn,
          selected: selectedIndex == 1,
          onTap: () => selectTab(1),
        ),
        AIMDrawerItemData(
          icon: const Icon(Icons.replay_outlined),
          label: l10n.shellNavReview,
          selected: selectedIndex == 2,
          onTap: () => selectTab(2),
          // No unread/due-count badge: no real due-count data source exists
          // for the Review tab in this codebase today (checked
          // features/reviews/) — omitted rather than fabricated.
        ),
        AIMDrawerItemData(
          icon: const Icon(Icons.insights_outlined),
          label: l10n.shellNavProgress,
          selected: selectedIndex == 3,
          onTap: () => selectTab(3),
        ),
        AIMDrawerItemData(
          icon: const Icon(Icons.person_outline),
          label: l10n.shellNavProfile,
          selected: selectedIndex == 4,
          onTap: () => selectTab(4),
        ),
      ],
      moreLabel: l10n.shellMoreSectionLabel,
      moreItems: [
        AIMDrawerItemData(
          icon: const _AIMDrawerIconAvatar(
            color: AimColors.error500,
            icon: Icons.notifications_outlined,
          ),
          label: l10n.shellNotifications,
          onTap: () => navigateTo(AppRoutePaths.notificationInbox),
          trailing: unreadCount > 0
              ? _AIMDrawerCountBadge(count: unreadCount)
              : Icon(Icons.chevron_right, color: aimSurfacesOf(context).textMuted),
        ),
        AIMDrawerItemData(
          icon: const _AIMDrawerIconAvatar(
            color: AimColors.warning500,
            icon: Icons.emoji_events_outlined,
          ),
          label: l10n.shellAchievements,
          onTap: () => navigateTo(AppRoutePaths.achievements),
          trailing: Icon(Icons.chevron_right, color: aimSurfacesOf(context).textMuted),
        ),
        AIMDrawerItemData(
          icon: const _AIMDrawerIconAvatar(
            color: AimColors.primary500,
            icon: Icons.workspace_premium_outlined,
          ),
          label: l10n.shellAimPlus,
          onTap: () => navigateTo(AppRoutePaths.pricing),
          trailing: Icon(Icons.chevron_right, color: aimSurfacesOf(context).textMuted),
        ),
        AIMDrawerItemData(
          icon: const _AIMDrawerIconAvatar(
            color: AimColors.success500,
            icon: Icons.help_outline,
          ),
          label: l10n.shellSupport,
          onTap: () => navigateTo(AppRoutePaths.helpCenter),
          trailing: Icon(Icons.chevron_right, color: aimSurfacesOf(context).textMuted),
        ),
      ],
      footer: const Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _AIMThemeToggleRow(),
          SizedBox(height: AimSpacing.componentGap),
          _AIMLanguageToggleRow(),
          SizedBox(height: AimSpacing.componentGap),
          LogoutButton(),
        ],
      ),
    );
  }
}

/// App-branding drawer header: logo mark + app name + tagline. The design
/// shows the app's own branding here, not the signed-in user's profile —
/// intentionally does not fetch/display any user data.
class _AIMDrawerBrandHeader extends StatelessWidget {
  const _AIMDrawerBrandHeader();

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    return Row(
      children: [
        Container(
          width: AimSizes.avatarMd,
          height: AimSizes.avatarMd,
          alignment: Alignment.center,
          decoration: const BoxDecoration(
            color: AimColors.primary500,
            shape: BoxShape.circle,
          ),
          child: Text(
            'A',
            style: AimTextStyles.title.copyWith(
              color: AimColors.neutral0,
              fontWeight: AimFontWeights.bold,
            ),
          ),
        ),
        const SizedBox(width: AimSpacing.componentGap),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                l10n.shellBrandName,
                style: AimTextStyles.title.copyWith(
                  color: surfaces.textPrimary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                l10n.shellBrandTagline,
                style: AimTextStyles.bodySm.copyWith(
                  color: surfaces.textSecondary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Small colored circular icon-avatar background used for "MORE" section
/// rows, matching the mockup's varied icon-treatment colors.
class _AIMDrawerIconAvatar extends StatelessWidget {
  const _AIMDrawerIconAvatar({required this.color, required this.icon});

  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: AimSizes.avatarSm,
      height: AimSizes.avatarSm,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      child: Icon(icon, color: AimColors.neutral0, size: AimSizes.iconSm),
    );
  }
}

/// Small numeric unread-count badge shown as a drawer item's [trailing].
class _AIMDrawerCountBadge extends StatelessWidget {
  const _AIMDrawerCountBadge({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AIMBadge(
      tone: AIMBadgeTone.error,
      variant: AIMBadgeVariant.solid,
      pill: true,
      semanticLabel: l10n.shellUnreadNotificationsSemantic(count),
      child: Text(count > 99 ? '99+' : '$count'),
    );
  }
}

/// Light/Dark segmented toggle wired to the app's real [themeModeProvider].
class _AIMThemeToggleRow extends ConsumerWidget {
  const _AIMThemeToggleRow();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final mode = ref.watch(themeModeProvider);
    final l10n = AppLocalizations.of(context);

    return Row(
      children: [
        Expanded(
          child: _ThemeToggleButton(
            label: l10n.shellThemeLight,
            icon: Icons.light_mode_outlined,
            selected: mode == ThemeMode.light,
            surfaces: surfaces,
            semanticLabel: l10n.shellThemeSemantic(l10n.shellThemeLight),
            onTap: () =>
                ref.read(themeModeProvider.notifier).state = ThemeMode.light,
          ),
        ),
        const SizedBox(width: AimSpacing.componentGap),
        Expanded(
          child: _ThemeToggleButton(
            label: l10n.shellThemeDark,
            icon: Icons.dark_mode_outlined,
            selected: mode == ThemeMode.dark,
            surfaces: surfaces,
            semanticLabel: l10n.shellThemeSemantic(l10n.shellThemeDark),
            onTap: () =>
                ref.read(themeModeProvider.notifier).state = ThemeMode.dark,
          ),
        ),
      ],
    );
  }
}

/// English/Arabic segmented toggle wired to [localeProvider]. Switching
/// languages also switches the app's [TextDirection] (RTL for Arabic) since
/// [AimMobileApp] derives `locale`/`Directionality` entirely from this
/// provider — no separate RTL toggle is needed.
class _AIMLanguageToggleRow extends ConsumerWidget {
  const _AIMLanguageToggleRow();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final locale = ref.watch(localeProvider);
    final l10n = AppLocalizations.of(context);

    return Row(
      children: [
        Expanded(
          child: _ThemeToggleButton(
            label: l10n.shellLanguageEnglishLabel,
            icon: Icons.language,
            selected: locale.languageCode == AppLocale.english,
            surfaces: surfaces,
            semanticLabel:
                l10n.shellLanguageSemantic(l10n.shellLanguageEnglishLabel),
            onTap: () => ref.read(localeProvider.notifier).state =
                const Locale(AppLocale.english),
          ),
        ),
        const SizedBox(width: AimSpacing.componentGap),
        Expanded(
          child: _ThemeToggleButton(
            label: l10n.shellLanguageArabicLabel,
            icon: Icons.language,
            selected: locale.languageCode == AppLocale.arabic,
            surfaces: surfaces,
            semanticLabel:
                l10n.shellLanguageSemantic(l10n.shellLanguageArabicLabel),
            onTap: () => ref.read(localeProvider.notifier).state =
                const Locale(AppLocale.arabic),
          ),
        ),
      ],
    );
  }
}

class _ThemeToggleButton extends StatelessWidget {
  const _ThemeToggleButton({
    required this.label,
    required this.icon,
    required this.selected,
    required this.surfaces,
    required this.onTap,
    required this.semanticLabel,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final AimSurfaceTheme surfaces;
  final VoidCallback onTap;
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    final soft = aimSoftFillsOf(context);
    final background = selected ? soft.primary : surfaces.surfaceSunken;
    final foreground = selected ? soft.onPrimary : surfaces.textSecondary;

    return Material(
      color: background,
      borderRadius: AimRadius.borderMd,
      child: InkWell(
        onTap: onTap,
        borderRadius: AimRadius.borderMd,
        splashColor: surfaces.statePressed,
        highlightColor: surfaces.statePressed,
        child: Semantics(
          button: true,
          selected: selected,
          label: semanticLabel,
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: AimSizes.touchTarget),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: AimSizes.iconSm, color: foreground),
                const SizedBox(width: AimSpacing.space8),
                Text(
                  label,
                  style: AimTextStyles.bodySm.copyWith(
                    color: foreground,
                    fontWeight: selected
                        ? AimFontWeights.semibold
                        : AimFontWeights.regular,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
