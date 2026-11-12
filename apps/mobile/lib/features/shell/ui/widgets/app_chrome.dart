import 'package:flutter/material.dart';
import 'package:aim_mobile/core/widgets/aim_logo_mark.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/localization/inline_tr.dart';
import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
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
  /// The top-bar requests of the pages inside the frame.
  final ChromeBarHost _bar = ChromeBarHost();

  @override
  void dispose() {
    _bar.dispose();
    super.dispose();
  }

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
    final mode = chromeModeFor(widget.location);
    final hasBottomBar = mode != ChromeBarMode.detail;

    return Scaffold(
      backgroundColor: surfaces.background,
      drawer: const AppMenuDrawer(),
      // The bar's real height is whatever it draws (0 when a page has not
      // asked for one); the Scaffold lays out the slot from that.
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(56),
        child: ListenableBuilder(
          listenable: _bar,
          builder: (context, _) => _AppTopBar(mode: mode, spec: _bar.active),
        ),
      ),
      body: ListenableBuilder(
        listenable: _bar,
        builder: (context, child) {
          final hasTopBar = mode == ChromeBarMode.root || _bar.active != null;
          // The frame handles the screen edges it covers, so the page inside
          // must not add its own safe-area padding there a second time.
          return MediaQuery.removePadding(
            context: context,
            removeTop: hasTopBar,
            removeBottom: hasBottomBar,
            child: child!,
          );
        },
        child: AppChromeScope(host: _bar, mode: mode, child: widget.child),
      ),
      // Screens you drill into have no tab bar, like a full-screen page.
      bottomNavigationBar:
          hasBottomBar ? _BottomTabBar(location: widget.location) : null,
    );
  }
}

/// Where each location sits in the app: which kind of top bar it gets.
///
/// - Main screens (the four bottom tabs and the Home tabs): AIM, streak, bell.
/// - Menu screens (the web menu's pages): back + title + streak + bell.
/// - Everything else you drill into: back + title.
ChromeBarMode chromeModeFor(String location) {
  bool isUnder(String base) => location == base || location.startsWith('$base/');
  if (isUnder(AppRoutePaths.mainShell) ||
      location == AppRoutePaths.improve ||
      location == AppRoutePaths.practiceHub) {
    return ChromeBarMode.root;
  }
  const sections = {
    AppRoutePaths.assessments,
    AppRoutePaths.vocabulary,
    AppRoutePaths.vocabularyLibrary,
    AppRoutePaths.mistakes,
    AppRoutePaths.achievements,
    AppRoutePaths.certificates,
    AppRoutePaths.notificationInbox,
    AppRoutePaths.subscription,
    AppRoutePaths.helpCenter,
    AppRoutePaths.accountSettings,
  };
  return sections.contains(location) ? ChromeBarMode.section : ChromeBarMode.detail;
}

/// The streak and the notifications bell, shared by the main and menu bars.
class _StreakAndBell extends ConsumerWidget {
  const _StreakAndBell();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final streak = ref.watch(streakDaysProvider).valueOrNull;
    final unread = switch (ref.watch(notificationUnreadCountProvider)) {
      AppAsyncSuccess(:final data) => data,
      _ => 0,
    };

    return Container(
      height: 40,
      decoration: BoxDecoration(
        color: dark ? surfaces.surface : Colors.white,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: surfaces.border),
        boxShadow: dark
            ? null
            : [
                BoxShadow(
                  color: AimColors.primary500.withValues(alpha: 0.08),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (streak != null) ...[
            Semantics(
              label: '$streak ${context.tr('Day streak', 'أيام متتالية')}',
              child: Padding(
                padding: const EdgeInsetsDirectional.only(start: 12, end: 10),
                child: Row(
                  children: [
                    const Icon(Icons.local_fire_department_rounded,
                        size: 22, color: Color(0xFFFF7A1A)),
                    const SizedBox(width: 4),
                    Text(
                      '$streak',
                      style: AimTextStyles.bodyMd.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Container(width: 1, height: 20, color: surfaces.divider),
          ],
          Stack(
            clipBehavior: Clip.none,
            children: [
              IconButton(
                visualDensity: VisualDensity.compact,
                tooltip: unread > 0
                    ? fill(
                        context.tr('Notifications, {n} unread',
                            'الإشعارات، {n} غير مقروءة'),
                        {'n': unread})
                    : context.tr('Notifications', 'الإشعارات'),
                icon: Icon(Icons.notifications_none_rounded,
                    size: 24, color: surfaces.textPrimary),
                onPressed: () => context.push(AppRoutePaths.notificationInbox),
              ),
              if (unread > 0)
                PositionedDirectional(
                  top: 7,
                  end: 8,
                  child: IgnorePointer(
                    child: Container(
                      width: 11,
                      height: 11,
                      decoration: BoxDecoration(
                        color: AimColors.error500,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: dark ? surfaces.surface : Colors.white,
                          width: 2,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Your avatar: one tap opens your Profile.
class _ProfileAvatar extends ConsumerWidget {
  const _ProfileAvatar();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final initial = switch (ref.watch(authContextProvider)) {
      AppAsyncSuccess(:final data) =>
        (data.profile?.displayName ?? data.user.email ?? '').trim(),
      _ => '',
    };
    final letter = initial.isEmpty ? '?' : String.fromCharCode(initial.runes.first).toUpperCase();

    return Semantics(
      button: true,
      label: context.tr('Profile', 'الملف الشخصي'),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: () {
          ref.read(mainShellTabIndexProvider.notifier).state = 4;
          context.go(AppRoutePaths.mainShell);
        },
        child: Container(
          width: 40,
          height: 40,
          alignment: Alignment.center,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF3F6CF6), Color(0xFF2848D8)],
            ),
            shape: BoxShape.circle,
          ),
          child: Text(
            letter,
            style: AimTextStyles.label.copyWith(
              color: AimColors.neutral0,
              fontWeight: AimFontWeights.bold,
              fontSize: 16,
            ),
          ),
        ),
      ),
    );
  }
}

/// The one top bar of the app frame. Main screens get AIM + streak + bell;
/// menu and detail screens get back + the page's title (+ the page's actions),
/// and menu screens keep the streak and bell on the right.
class _AppTopBar extends ConsumerWidget {
  const _AppTopBar({required this.mode, required this.spec});

  final ChromeBarMode mode;
  final ChromeBarSpec? spec;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final s = spec;
    // A page that draws its own header has not asked for a bar: show none.
    if (mode != ChromeBarMode.root && s == null) return const SizedBox.shrink();

    final Widget content;
    if (mode == ChromeBarMode.root) {
      content = Row(
        children: [
          // One tap from anywhere on a main screen back to the Dashboard.
          Semantics(
            button: true,
            label: context.tr('Dashboard', 'لوحة التحكم'),
            child: InkWell(
              borderRadius: BorderRadius.circular(8),
              onTap: () {
                ref.read(mainShellTabIndexProvider.notifier).state = 0;
                context.go(AppRoutePaths.mainShell);
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const AimLogoMark(size: 30),
                    const SizedBox(width: 8),
                    Text(
                      'AIM',
                      style: AimTextStyles.h2.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: FontWeight.w800,
                        fontSize: 22,
                        letterSpacing: context.isArabic ? 0 : 0.2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const Spacer(),
          const _StreakAndBell(),
          const SizedBox(width: 10),
          const _ProfileAvatar(),
        ],
      );
    } else {
      final rtl = Directionality.of(context) == TextDirection.rtl;
      content = Row(
        children: [
          IconButton(
            tooltip: MaterialLocalizations.of(context).backButtonTooltip,
            icon: Icon(
              rtl ? Icons.arrow_forward_rounded : Icons.arrow_back_rounded,
              color: surfaces.textPrimary,
            ),
            onPressed: () {
              if (s!.onBack != null) {
                s.onBack!();
              } else if (context.canPop()) {
                context.pop();
              } else {
                ref.read(mainShellTabIndexProvider.notifier).state = 0;
                context.go(AppRoutePaths.mainShell);
              }
            },
          ),
          Expanded(
            child: s!.titleWidget ??
                Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      s.title ?? '',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AimTextStyles.h3.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (s.subtitle != null && s.subtitle!.isNotEmpty)
                      Text(
                        s.subtitle!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                      ),
                  ],
                ),
          ),
          for (final a in s.actions) a,
          if (mode == ChromeBarMode.section) ...const [_StreakAndBell(), SizedBox(width: 4)],
        ],
      );
    }

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
              padding: EdgeInsetsDirectional.only(
                start: mode == ChromeBarMode.root ? 16 : 4,
                end: mode == ChromeBarMode.root ? 16 : 8,
              ),
              child: content,
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
      final color = selected ? AimColors.primary500 : surfaces.textMuted;
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

    final dark = Theme.of(context).brightness == Brightness.dark;
    return Material(
      color: surfaces.background,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(12, 6, 12, 10),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: dark ? const Color(0xFF111A2E) : Colors.white,
              borderRadius: BorderRadius.circular(26),
              border: Border.all(color: surfaces.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: dark ? 0.45 : 0.10),
                  blurRadius: 20,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
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
      ),
    );
  }
}
