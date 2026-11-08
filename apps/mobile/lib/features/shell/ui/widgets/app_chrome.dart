import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/localization/inline_tr.dart';
import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../notifications/logic/provider/notification_providers.dart';
import '../../logic/main_shell_tab_provider.dart';
import '../../logic/shell_providers.dart';
import 'app_menu_drawer.dart';

/// The frame around every main page, matching the student web app on a phone:
/// a top bar (AIM, day streak, notifications), the page, and a bottom tab bar
/// (Dashboard, Courses, Improve, Practice, Menu) whose Menu button opens the
/// slide-in menu. Full-screen flows (lessons, practice, tests, chat, sign-in)
/// are outside it, like the web app hides its tab bar there.
class AppChrome extends ConsumerStatefulWidget {
  const AppChrome({super.key, required this.location, required this.child});

  /// Current route path, used to highlight the active tab.
  final String location;
  final Widget child;

  @override
  ConsumerState<AppChrome> createState() => _AppChromeState();
}

class _AppChromeState extends ConsumerState<AppChrome> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadUnread());
  }

  @override
  void didUpdateWidget(AppChrome old) {
    super.didUpdateWidget(old);
    if (old.location != widget.location) {
      final leftInbox = old.location == AppRoutePaths.notificationInbox;
      WidgetsBinding.instance
          .addPostFrameCallback((_) => _loadUnread(force: leftInbox));
    }
  }

  /// Refreshes the unread count and the streak, but at most once a minute:
  /// every page change used to send two extra requests, which on a slow
  /// connection competed with the page the student was actually opening.
  /// Leaving the notifications page always refreshes, so the badge clears.
  void _loadUnread({bool force = false}) {
    if (!mounted) return;
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    final last = ref.read(chromeLastRefreshProvider);
    final fresh = last != null &&
        DateTime.now().difference(last) < const Duration(seconds: 60);
    if (fresh && !force) return;
    ref.read(chromeLastRefreshProvider.notifier).state = DateTime.now();
    ref.read(notificationUnreadCountProvider.notifier).load(bearerToken: token);
    ref.invalidate(streakDaysProvider);
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Scaffold(
      backgroundColor: surfaces.background,
      drawer: const AppMenuDrawer(),
      appBar: _AppTopBar(location: widget.location),
      // The chrome already handles the top and bottom screen edges, so the
      // page inside must not add its own safe-area padding a second time.
      body: MediaQuery.removePadding(
        context: context,
        removeTop: true,
        removeBottom: true,
        child: widget.child,
      ),
      bottomNavigationBar: _BottomTabBar(location: widget.location),
    );
  }
}

class _AppTopBar extends ConsumerWidget implements PreferredSizeWidget {
  const _AppTopBar({required this.location});

  final String location;

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final streak = ref.watch(streakDaysProvider).valueOrNull;
    final unread = switch (ref.watch(notificationUnreadCountProvider)) {
      AppAsyncSuccess(:final data) => data,
      _ => 0,
    };

    return Material(
      color: surfaces.background,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: surfaces.border)),
        ),
        child: SafeArea(
          bottom: false,
          child: SizedBox(
            height: 56,
            child: Padding(
              padding: const EdgeInsetsDirectional.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Text(
                    'AIM',
                    style: AimTextStyles.h2.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: AimFontWeights.bold,
                      fontSize: 22,
                      letterSpacing: context.isArabic ? 0 : -0.5,
                    ),
                  ),
                  const Spacer(),
                  if (streak != null)
                    Semantics(
                      label: '$streak ${context.tr('Day streak', 'أيام متتالية')}',
                      child: Padding(
                        padding: const EdgeInsetsDirectional.only(end: 8),
                        child: Row(
                          children: [
                            Icon(Icons.local_fire_department_outlined,
                                size: 20, color: surfaces.textPrimary),
                            const SizedBox(width: 4),
                            Text(
                              '$streak',
                              style: AimTextStyles.bodyMd.copyWith(
                                color: surfaces.textPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      IconButton(
                        tooltip: unread > 0
                            ? fill(
                                context.tr('Notifications, {n} unread',
                                    'الإشعارات، {n} غير مقروءة'),
                                {'n': unread})
                            : context.tr('Notifications', 'الإشعارات'),
                        icon: Icon(Icons.notifications_none_rounded,
                            color: surfaces.textSecondary),
                        onPressed: () =>
                            context.push(AppRoutePaths.notificationInbox),
                      ),
                      if (unread > 0)
                        PositionedDirectional(
                          top: 4,
                          end: 4,
                          child: IgnorePointer(
                            child: Container(
                              constraints: const BoxConstraints(
                                  minWidth: 18, minHeight: 18),
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 4),
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: AimColors.error500,
                                borderRadius: BorderRadius.circular(9),
                                border: Border.all(
                                    color: surfaces.background, width: 2),
                              ),
                              child: Text(
                                unread > 9 ? '9+' : '$unread',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  height: 1.1,
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _BottomTabBar extends ConsumerWidget {
  const _BottomTabBar({required this.location});

  final String location;

  bool get _onMain =>
      location == AppRoutePaths.mainShell ||
      location.startsWith('${AppRoutePaths.mainShell}/');

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final tab = ref.watch(mainShellTabIndexProvider);

    Widget item({
      required IconData icon,
      required String label,
      required bool selected,
      required VoidCallback onTap,
    }) {
      final color = selected ? surfaces.textPrimary : surfaces.textMuted;
      return Expanded(
        child: InkWell(
          onTap: onTap,
          child: Semantics(
            button: true,
            selected: selected,
            label: label,
            child: SizedBox(
              height: 56,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(icon, size: 22, color: color),
                  const SizedBox(height: 2),
                  Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: color,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    void openTab(int index) {
      ref.read(mainShellTabIndexProvider.notifier).state = index;
      context.go(AppRoutePaths.mainShell);
    }

    return Material(
      color: surfaces.background,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: surfaces.border)),
        ),
        child: SafeArea(
          top: false,
          child: Row(
            children: [
              item(
                icon: Icons.home_outlined,
                label: context.tr('Dashboard', 'لوحة التحكم'),
                selected: _onMain && tab == 0,
                onTap: () => openTab(0),
              ),
              item(
                icon: Icons.menu_book_outlined,
                label: context.tr('Courses', 'الدورات'),
                selected: _onMain && tab == 1,
                onTap: () => openTab(1),
              ),
              item(
                icon: Icons.track_changes_rounded,
                label: context.tr('Improve', 'تحسين'),
                selected: location.startsWith(AppRoutePaths.improve),
                onTap: () => context.go(AppRoutePaths.improve),
              ),
              item(
                icon: Icons.bolt_rounded,
                label: context.tr('Practice', 'تدرّب'),
                selected: location == AppRoutePaths.practiceHub ||
                    location.startsWith('${AppRoutePaths.practiceHub}/'),
                onTap: () => context.go(AppRoutePaths.practiceHub),
              ),
              Builder(
                builder: (ctx) => item(
                  icon: Icons.menu_rounded,
                  label: context.tr('Menu', 'القائمة'),
                  selected: false,
                  onTap: () => Scaffold.of(ctx).openDrawer(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
