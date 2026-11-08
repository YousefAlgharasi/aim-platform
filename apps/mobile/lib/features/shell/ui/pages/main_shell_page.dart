import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
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
/// The top bar, bottom tab bar and slide-in menu live in [AppChrome], which
/// wraps this page and every other main page; this page only switches tabs.
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
    // Notifications badge reflects real data as soon as
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
          body: _LazyIndexedStack(
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
}

/// An [IndexedStack] that only builds a tab the first time it is selected.
///
/// A plain IndexedStack builds every child immediately, which made all five
/// tabs (Home, Courses, Review, Progress, Profile) mount and fire their
/// network loads at launch, competing with Home for bandwidth and CPU on the
/// first frames. Once a tab has been visited it stays mounted (state, scroll
/// position and loaded data are preserved), exactly like IndexedStack.
class _LazyIndexedStack extends StatefulWidget {
  const _LazyIndexedStack({required this.index, required this.children});

  final int index;
  final List<Widget> children;

  @override
  State<_LazyIndexedStack> createState() => _LazyIndexedStackState();
}

class _LazyIndexedStackState extends State<_LazyIndexedStack> {
  late final Set<int> _built = {widget.index};

  @override
  void didUpdateWidget(covariant _LazyIndexedStack oldWidget) {
    super.didUpdateWidget(oldWidget);
    _built.add(widget.index);
  }

  @override
  Widget build(BuildContext context) {
    return IndexedStack(
      index: widget.index,
      children: [
        for (var i = 0; i < widget.children.length; i++)
          _built.contains(i) ? widget.children[i] : const SizedBox.shrink(),
      ],
    );
  }
}
