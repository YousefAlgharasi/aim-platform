import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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

/// Main shell page — holds the bottom-navigation [IndexedStack].
///
/// Uses [AIMBottomNav] from the AIM Mobile Design System. Raw [NavigationBar]
/// has been replaced as part of P6-028 component adoption.
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

    return Scaffold(
      drawer: _buildDrawer(context, ref, selectedIndex),
      floatingActionButton: Builder(
        builder: (context) => FloatingActionButton(
          backgroundColor: AimColors.primary500,
          foregroundColor: AimColors.neutral0,
          tooltip: 'Open menu',
          onPressed: () => Scaffold.of(context).openDrawer(),
          child: const Icon(Icons.menu),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
      body: IndexedStack(
        index: selectedIndex,
        children: MainShellPage._screens,
      ),
      bottomNavigationBar: AIMBottomNav<int>(
        value: selectedIndex,
        onChanged: (index) =>
            ref.read(mainShellTabIndexProvider.notifier).state = index,
        items: const [
          AIMBottomNavDestination(
            value: 0,
            label: 'Home',
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            semanticLabel: 'Home tab',
          ),
          AIMBottomNavDestination(
            value: 1,
            label: 'Learn',
            icon: Icon(Icons.menu_book_outlined),
            activeIcon: Icon(Icons.menu_book),
            semanticLabel: 'Learn tab',
          ),
          AIMBottomNavDestination(
            value: 2,
            label: 'Review',
            icon: Icon(Icons.replay_outlined),
            activeIcon: Icon(Icons.replay),
            semanticLabel: 'Review tab',
          ),
          AIMBottomNavDestination(
            value: 3,
            label: 'Progress',
            icon: Icon(Icons.insights_outlined),
            activeIcon: Icon(Icons.insights),
            semanticLabel: 'Progress tab',
          ),
          AIMBottomNavDestination(
            value: 4,
            label: 'Profile',
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            semanticLabel: 'Profile tab',
          ),
        ],
      ),
    );
  }

  /// Builds the side navigation drawer: app-branding header, a "MENU"
  /// section mirroring the 5 bottom-nav tabs, a "MORE" section of
  /// secondary destinations, a theme toggle, and a sign-out footer.
  Widget _buildDrawer(BuildContext context, WidgetRef ref, int selectedIndex) {
    final unreadCountState = ref.watch(notificationUnreadCountProvider);
    final unreadCount = switch (unreadCountState) {
      AppAsyncSuccess<int>(:final data) => data,
      _ => 0,
    };

    void selectTab(int index) {
      Navigator.of(context).pop();
      ref.read(mainShellTabIndexProvider.notifier).state = index;
    }

    void navigateTo(String routeName) {
      Navigator.of(context).pop();
      Navigator.of(context).pushNamed(routeName);
    }

    return AIMAppDrawer(
      header: const _AIMDrawerBrandHeader(),
      menuLabel: 'MENU',
      items: [
        AIMDrawerItemData(
          icon: const Icon(Icons.home_outlined),
          label: 'Home',
          selected: selectedIndex == 0,
          onTap: () => selectTab(0),
        ),
        AIMDrawerItemData(
          icon: const Icon(Icons.menu_book_outlined),
          label: 'Learn',
          selected: selectedIndex == 1,
          onTap: () => selectTab(1),
        ),
        AIMDrawerItemData(
          icon: const Icon(Icons.replay_outlined),
          label: 'Review',
          selected: selectedIndex == 2,
          onTap: () => selectTab(2),
          // No unread/due-count badge: no real due-count data source exists
          // for the Review tab in this codebase today (checked
          // features/reviews/) — omitted rather than fabricated.
        ),
        AIMDrawerItemData(
          icon: const Icon(Icons.insights_outlined),
          label: 'Progress',
          selected: selectedIndex == 3,
          onTap: () => selectTab(3),
        ),
        AIMDrawerItemData(
          icon: const Icon(Icons.person_outline),
          label: 'Profile',
          selected: selectedIndex == 4,
          onTap: () => selectTab(4),
        ),
      ],
      moreLabel: 'MORE',
      moreItems: [
        AIMDrawerItemData(
          icon: const _AIMDrawerIconAvatar(
            color: AimColors.error500,
            icon: Icons.notifications_outlined,
          ),
          label: 'Notifications',
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
          label: 'Achievements',
          onTap: () => navigateTo(AppRoutePaths.achievements),
          trailing: Icon(Icons.chevron_right, color: aimSurfacesOf(context).textMuted),
        ),
        AIMDrawerItemData(
          icon: const _AIMDrawerIconAvatar(
            color: AimColors.primary500,
            icon: Icons.workspace_premium_outlined,
          ),
          label: 'AIM Plus',
          onTap: () => navigateTo(AppRoutePaths.pricing),
          trailing: Icon(Icons.chevron_right, color: aimSurfacesOf(context).textMuted),
        ),
        AIMDrawerItemData(
          icon: const _AIMDrawerIconAvatar(
            color: AimColors.success500,
            icon: Icons.help_outline,
          ),
          label: 'Support',
          onTap: () => navigateTo(AppRoutePaths.helpCenter),
          trailing: Icon(Icons.chevron_right, color: aimSurfacesOf(context).textMuted),
        ),
      ],
      footer: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const _AIMThemeToggleRow(),
          const SizedBox(height: AimSpacing.componentGap),
          const LogoutButton(),
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
                'AIM Learning',
                style: AimTextStyles.title.copyWith(
                  color: surfaces.textPrimary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                'English, smarter',
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
    return AIMBadge(
      tone: AIMBadgeTone.error,
      variant: AIMBadgeVariant.solid,
      pill: true,
      semanticLabel: '$count unread notifications',
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

    return Row(
      children: [
        Expanded(
          child: _ThemeToggleButton(
            label: 'Light',
            icon: Icons.light_mode_outlined,
            selected: mode == ThemeMode.light,
            surfaces: surfaces,
            onTap: () =>
                ref.read(themeModeProvider.notifier).state = ThemeMode.light,
          ),
        ),
        const SizedBox(width: AimSpacing.componentGap),
        Expanded(
          child: _ThemeToggleButton(
            label: 'Dark',
            icon: Icons.dark_mode_outlined,
            selected: mode == ThemeMode.dark,
            surfaces: surfaces,
            onTap: () =>
                ref.read(themeModeProvider.notifier).state = ThemeMode.dark,
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
  });

  final String label;
  final IconData icon;
  final bool selected;
  final AimSurfaceTheme surfaces;
  final VoidCallback onTap;

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
          label: '$label theme',
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
