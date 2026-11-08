import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/localization/inline_tr.dart';
import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../auth/logic/provider/logout_provider.dart';
import '../../../home/ui/pages/home_page.dart';
import '../../../lessons/ui/pages/course_list_page.dart';
import '../../../notifications/logic/provider/notification_providers.dart';
import '../../../onboarding/logic/provider/onboarding_walkthrough_provider.dart';
import '../../../onboarding/ui/widgets/onboarding_walkthrough_overlay.dart';
import '../../../placement/logic/provider/placement_gate_notifier.dart';
import '../../../placement/logic/provider/placement_provider.dart' show placementGateProvider;
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
  // P4-052: blocks the real shell content (Home, etc.) from ever being
  // rendered until the first-login gate check has resolved. Starts `true`
  // whenever a token is present so the very first frame this widget draws
  // is a loading placeholder, not Home — the gate check then either clears
  // this flag (gate hidden / already decided) or navigates away entirely
  // (gate should show), but Home itself is never built in the interim.
  bool _blockedByGateCheck = false;

  @override
  void initState() {
    super.initState();
    final token = ref.read(authFlowProvider).accessToken;
    if (token != null && token.isNotEmpty) {
      _blockedByGateCheck = true;
    }
    // Eagerly load the unread notification count so the drawer's
    // Notifications badge (see _buildDrawer) reflects real data as soon as
    // the shell mounts, rather than only after some other screen (e.g.
    // Profile's NotificationBellButton) happens to have loaded it first.
    // Deferred via addPostFrameCallback, matching the same pattern already
    // used by every other screen's initial load in this codebase (e.g.
    // HomePage._load) — calling a provider's .load() synchronously during
    // build/initState would risk a "setState during build" error.
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadUnreadCount());
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkPlacementGate());
  }

  /// P4-052: first-login gate. Checked once per shell mount (not on every
  /// tab switch — this widget is only built once per app session, the tabs
  /// live in an IndexedStack) so a student who has never taken the
  /// placement test and has no learning progress yet is offered the choice
  /// exactly once. The backend is the sole authority on whether to show it.
  ///
  /// While this is in flight, [build] renders a blocking loader instead of
  /// Home (see [_blockedByGateCheck]) — the student must never be able to
  /// see or reach Home before the gate has been resolved or answered. If
  /// the gate should show, we navigate with `context.go` (replacing this
  /// route) rather than `context.push`, so Home is never left underneath
  /// in the navigation stack where a back-swipe could reveal it.
  void _checkPlacementGate() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) {
      if (mounted && _blockedByGateCheck) {
        setState(() => _blockedByGateCheck = false);
      }
      return;
    }

    final notifier = ref.read(placementGateProvider.notifier);
    notifier
        .check(token)
        .timeout(
          const Duration(seconds: 2),
          onTimeout: () {
            if (mounted && _blockedByGateCheck) {
              setState(() => _blockedByGateCheck = false);
            }
          },
        )
        .then((_) {
      if (!mounted) return;
      final gateState = ref.read(placementGateProvider);
      if (gateState is PlacementGateShouldShow) {
        context.go(AppRoutePaths.placementGate);
        return;
      }
      // Hidden, or a transient check error — fail open rather than
      // blocking the student indefinitely on a network hiccup.
      if (_blockedByGateCheck) {
        setState(() => _blockedByGateCheck = false);
      }
    }).catchError((_) {
      if (mounted && _blockedByGateCheck) {
        setState(() => _blockedByGateCheck = false);
      }
    });
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
    if (_blockedByGateCheck) {
      final surfaces = aimSurfacesOf(context);
      return Scaffold(
        backgroundColor: surfaces.background,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final selectedIndex = ref.watch(mainShellTabIndexProvider);
    final l10n = AppLocalizations.of(context);
    final hasSeenWalkthrough = ref.watch(onboardingWalkthroughProvider);

    return PopScope(
      canPop: selectedIndex == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && selectedIndex != 0) {
          ref.read(mainShellTabIndexProvider.notifier).state = 0;
        }
      },
      child: Stack(
        children: [
          Scaffold(
          drawer: _buildDrawer(context, ref, selectedIndex),
          floatingActionButton: Builder(
            builder: (context) => Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF653BFF).withValues(alpha: 0.45),
                    blurRadius: 20,
                    spreadRadius: 2,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: FloatingActionButton(
                backgroundColor: const Color(0xFF653BFF),
                foregroundColor: AimColors.neutral0,
                elevation: 0,
                tooltip: l10n.shellOpenMenuTooltip,
                onPressed: () => Scaffold.of(context).openDrawer(),
                child: const Icon(Icons.notes_rounded, color: Colors.white, size: 24),
              ),
            ),
          ),
          floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
          // No bottomNavigationBar: navigation between tabs is handled entirely
          // by the drawer's MENU section (see _buildDrawer) opened via the FAB
          // above, per product direction — the bottom tab bar was redundant
          // with the drawer and has been removed.
          body: IndexedStack(
            index: selectedIndex,
            children: MainShellPage._screens,
          ),
        ),
        // Shown at most once per install — see OnboardingWalkthroughStore.
        // `null` means the local flag hasn't finished loading yet, so
        // nothing is shown until it's known whether this is a first launch.
        if (hasSeenWalkthrough == false)
          OnboardingWalkthroughOverlay(
            onDone: () =>
                ref.read(onboardingWalkthroughProvider.notifier).markSeen(),
          ),
      ],
    ),
  );
  }

  /// Builds the side navigation drawer: app-branding header, a "MENU"
  /// section mirroring the 5 bottom-nav tabs, a "MORE" section of
  /// secondary destinations, a theme toggle, and a sign-out footer.
  Widget _buildDrawer(BuildContext context, WidgetRef ref, int selectedIndex) {
    return _AIMAppDrawerWithMore(selectedIndex: selectedIndex);
  }
}

class _AIMAppDrawerWithMore extends ConsumerStatefulWidget {
  const _AIMAppDrawerWithMore({required this.selectedIndex});

  final int selectedIndex;

  @override
  ConsumerState<_AIMAppDrawerWithMore> createState() =>
      _AIMAppDrawerWithMoreState();
}

class _AIMAppDrawerWithMoreState
    extends ConsumerState<_AIMAppDrawerWithMore> {
  void _selectTab(int index) {
    context.pop();
    ref.read(mainShellTabIndexProvider.notifier).state = index;
  }

  void _navigateTo(String routeName) {
    context.pop();
    context.push(routeName);
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = widget.selectedIndex;
    final unread = switch (ref.watch(notificationUnreadCountProvider)) {
      AppAsyncSuccess(:final data) => data,
      _ => 0,
    };

    AIMDrawerItemData item(
      IconData icon,
      String en,
      String ar, {
      bool selected = false,
      VoidCallback? onTap,
      Widget? trailing,
    }) =>
        AIMDrawerItemData(
          icon: Icon(icon),
          label: context.tr(en, ar),
          selected: selected,
          trailing: trailing,
          onTap: onTap ?? () {},
        );

    // Same sections, order and names as the student web app's menu.
    // The Dashboard entry opens the Home tab (the page itself is untouched).
    final sections = [
      AIMDrawerSectionData(
        label: context.tr('LEARN', 'تعلّم'),
        items: [
          item(Icons.home_outlined, 'Dashboard', 'لوحة التحكم',
              selected: selectedIndex == 0, onTap: () => _selectTab(0)),
          item(Icons.menu_book_outlined, 'Courses', 'الدورات',
              selected: selectedIndex == 1, onTap: () => _selectTab(1)),
          item(Icons.track_changes_rounded, 'Improve', 'تحسين',
              onTap: () => _navigateTo(AppRoutePaths.improve)),
          item(Icons.assignment_outlined, 'Assessments', 'التقييمات',
              onTap: () => _navigateTo(AppRoutePaths.assessments)),
        ],
      ),
      AIMDrawerSectionData(
        label: context.tr('PRACTICE', 'تدرّب'),
        items: [
          item(Icons.bolt_rounded, 'Practice', 'تدرّب',
              onTap: () => _navigateTo(AppRoutePaths.practiceHub)),
          item(Icons.chat_bubble_outline_rounded, 'AI Teacher', 'المعلم الذكي',
              onTap: () {
            context.pop();
            context.push(AppRoutePaths.aiTeacherChat,
                extra: const {'contextRef': 'general'});
          }),
          item(Icons.lightbulb_outline_rounded, 'My words', 'كلماتي',
              onTap: () => _navigateTo(AppRoutePaths.vocabulary)),
          item(Icons.refresh_rounded, 'My mistakes', 'أخطائي',
              onTap: () => _navigateTo(AppRoutePaths.mistakes)),
          item(Icons.style_outlined, 'Review', 'المراجعة',
              selected: selectedIndex == 2, onTap: () => _selectTab(2)),
        ],
      ),
      AIMDrawerSectionData(
        label: context.tr('PROGRESS', 'التقدم'),
        items: [
          item(Icons.bar_chart_outlined, 'Progress', 'التقدم',
              selected: selectedIndex == 3, onTap: () => _selectTab(3)),
          item(Icons.emoji_events_outlined, 'Achievements', 'الإنجازات',
              onTap: () => _navigateTo(AppRoutePaths.achievements)),
          item(Icons.workspace_premium_outlined, 'Certificates', 'الشهادات',
              onTap: () => _navigateTo(AppRoutePaths.certificates)),
          item(Icons.trending_up_rounded, 'Reports', 'التقارير',
              onTap: () => _navigateTo(AppRoutePaths.analyticsSummary)),
        ],
      ),
      AIMDrawerSectionData(
        label: context.tr('ACCOUNT', 'الحساب'),
        items: [
          item(Icons.notifications_none_rounded, 'Notifications', 'الإشعارات',
              onTap: () => _navigateTo(AppRoutePaths.notificationInbox),
              trailing: unread > 0 ? _UnreadBadge(count: unread) : null),
          item(Icons.credit_card_outlined, 'Billing', 'الفواتير',
              onTap: () => _navigateTo(AppRoutePaths.subscription)),
          item(Icons.support_agent_outlined, 'Support', 'الدعم',
              onTap: () => _navigateTo(AppRoutePaths.helpCenter)),
          item(Icons.settings_outlined, 'Settings', 'الإعدادات',
              onTap: () => _navigateTo(AppRoutePaths.accountSettings)),
        ],
      ),
    ];

    return AIMAppDrawer(
      header: const _AIMDrawerBrandHeader(),
      items: const [],
      sections: sections,
      footer: Consumer(
        builder: (context, ref, child) {
          final logoutState = ref.watch(logoutProvider);
          final isLoggingOut = logoutState.isLoading;
          final surfaces = aimSurfacesOf(context);

          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              GestureDetector(
                onTap: isLoggingOut
                    ? null
                    : () {
                        final token =
                            ref.read(authFlowProvider).accessToken ?? '';
                        ref.read(logoutProvider.notifier).logout(token);
                      },
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(vertical: AimSpacing.space8),
                  child: Text(
                    context.tr('Log Out', 'تسجيل الخروج'),
                    style: AimTextStyles.bodyMd.copyWith(
                      color: AimColors.error500,
                      fontWeight: AimFontWeights.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AimSpacing.space4),
              Text(
                'AIM Mind Coach v2.4.0',
                style: AimTextStyles.caption.copyWith(
                  color: surfaces.textMuted,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _UnreadBadge extends StatelessWidget {
  const _UnreadBadge({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: AimColors.error500,
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        count > 99 ? '99+' : '$count',
        style: AimTextStyles.caption.copyWith(
          color: Colors.white,
          fontWeight: AimFontWeights.bold,
        ),
      ),
    );
  }
}

/// App-branding & profile header shown at the top of the side navigation drawer.
class _AIMDrawerBrandHeader extends ConsumerWidget {
  const _AIMDrawerBrandHeader();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final authContextState = ref.watch(authContextProvider);

    final displayName = switch (authContextState) {
      AppAsyncSuccess(:final data) => data.profile?.displayName ??
          ((data.user.email != null && data.user.email!.isNotEmpty)
              ? data.user.email!.split('@').first
              : AppLocalizations.of(context).commonLearner),
      _ => AppLocalizations.of(context).commonLearner,
    };

    final avatarLetter =
        displayName.isNotEmpty ? displayName[0].toUpperCase() : 'A';

    final isParent = switch (authContextState) {
      AppAsyncSuccess(:final data) => data.hasRole('parent'),
      _ => false,
    };
    final badgeText = isParent ? 'PARENT MEMBER' : 'AIM PLUS MEMBER';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'AIM',
              style: AimTextStyles.h2.copyWith(
                color: AimColors.primary500,
                fontWeight: AimFontWeights.extrabold,
                fontSize: 22,
                letterSpacing: -0.5,
              ),
            ),
            GestureDetector(
              onTap: () => Navigator.of(context).pop(),
              child: Container(
                padding: const EdgeInsets.all(AimSpacing.space8),
                decoration: BoxDecoration(
                  color: surfaces.surfaceSunken,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.close,
                  size: AimSizes.iconSm,
                  color: surfaces.textSecondary,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AimSpacing.space16),
        GestureDetector(
          onTap: () {
            Navigator.of(context).pop();
            ref.read(mainShellTabIndexProvider.notifier).state = 4;
          },
          child: Container(
            padding: const EdgeInsets.all(AimSpacing.space16),
            decoration: BoxDecoration(
              color: surfaces.surfaceRaised,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: surfaces.border,
                width: 1,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    gradient: AimGradients.gzHero,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    avatarLetter,
                    style: AimTextStyles.h3.copyWith(
                      color: AimColors.neutral0,
                      fontWeight: AimFontWeights.bold,
                    ),
                  ),
                ),
                const SizedBox(width: AimSpacing.componentGap),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        displayName,
                        style: AimTextStyles.bodyLg.copyWith(
                          color: surfaces.textPrimary,
                          fontWeight: AimFontWeights.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: soft.primary,
                          borderRadius: BorderRadius.circular(100),
                        ),
                        child: Text(
                          badgeText,
                          style: AimTextStyles.caption.copyWith(
                            color: soft.onPrimary,
                            fontWeight: AimFontWeights.extrabold,
                            fontSize: 10,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}