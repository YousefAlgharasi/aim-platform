// GuidedTourOverlay — decides when a guided tour runs and shows it.
//
// Lives above a page: inside the app frame (AppChrome) or on a full-screen page such as the Voice Teacher. A tour
// starts when:
//  - the "?" button or Settings asks for it, or
//  - it is a tour that starts by itself (the dashboard and the Voice Teacher),
//    this student has never seen it, and, for the dashboard, the first-time
//    welcome walkthrough has just been closed in this session.
//
// Like the web app, a tour never starts by itself if the device cannot
// remember that it was shown, and students who already got past the welcome
// walkthrough in an earlier session are not interrupted by the new tour (the
// "?" button still offers it). Leaving the page ends the tour. Everything is
// local display state; no backend calls.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/state/app_async_state.dart';
import '../../auth/logic/provider/auth_context_provider.dart';
import '../../onboarding/logic/provider/onboarding_walkthrough_provider.dart';
import '../../shell/logic/main_shell_tab_provider.dart';
import '../data/tour_definitions.dart';
import '../logic/guided_tour_provider.dart';
import 'guided_tour_spotlight.dart';
import 'tour_target.dart';

const Duration _waitLimit = Duration(seconds: 8);

class GuidedTourOverlay extends ConsumerStatefulWidget {
  const GuidedTourOverlay({super.key, required this.location});

  /// Current route path of the app frame.
  final String location;

  @override
  ConsumerState<GuidedTourOverlay> createState() => _GuidedTourOverlayState();
}

class _ActiveRun {
  const _ActiveRun(this.tour, this.steps);

  final TourDefinition tour;
  final List<TourStep> steps;
}

class _GuidedTourOverlayState extends ConsumerState<GuidedTourOverlay> {
  _ActiveRun? _run;
  Timer? _wait;
  String? _waitingFor;

  /// True once the welcome walkthrough was seen open in this session, which
  /// means this is a first-time student rather than someone updating the app.
  bool _sawWalkthroughOpen = false;

  @override
  void dispose() {
    _wait?.cancel();
    super.dispose();
  }

  String? _userId() => switch (ref.read(authContextProvider)) {
        AppAsyncSuccess(:final data) => data.user.id,
        _ => null,
      };

  String? _currentTourId() => tourIdForScreen(
        location: widget.location,
        mainTab: ref.read(mainShellTabIndexProvider),
      );

  void _cancelWait() {
    _wait?.cancel();
    _wait = null;
    _waitingFor = null;
  }

  /// Wait for the page to show the tour's elements, then start with only the
  /// steps that can be shown.
  void _begin(TourDefinition tour) {
    if (_run != null || _waitingFor == tour.id) return;
    _cancelWait();
    _waitingFor = tour.id;
    final startedAt = DateTime.now();
    _wait = Timer.periodic(const Duration(milliseconds: 250), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (DateTime.now().difference(startedAt) > _waitLimit) {
        _cancelWait();
        return;
      }
      if (_currentTourId() != tour.id) return;
      if (!tour.steps.any((s) => TourTargets.find(s.target) != null)) return;
      _cancelWait();
      // Give the rest of the page a moment to finish loading, then take stock.
      Future<void>.delayed(const Duration(milliseconds: 350), () {
        if (!mounted || _run != null || _currentTourId() != tour.id) return;
        final steps = [
          for (final s in tour.steps)
            if (TourTargets.find(s.target) != null) s,
        ];
        if (steps.isEmpty) return;
        setState(() => _run = _ActiveRun(tour, steps));
      });
    });
  }

  void _finish() {
    final run = _run;
    if (run == null) return;
    setState(() => _run = null);
    final userId = _userId();
    if (userId != null) {
      ref.read(guidedTourProvider(userId).notifier).markSeen(run.tour.id);
    }
  }

  /// Runs after every build of this widget: ends a tour that was left behind,
  /// takes a pending request, or offers the dashboard tour the first time.
  void _evaluate(String? userId, GuidedTourState? state, bool? walkthroughSeen) {
    if (!mounted || userId == null || state == null) return;

    final run = _run;
    if (run != null && _currentTourId() != run.tour.id) {
      _finish();
      return;
    }
    if (run != null) return;

    final request = state.request;
    if (request != null) {
      ref.read(guidedTourProvider(userId).notifier).clearRequest();
      final tour = tourById(request.tourId);
      if (tour != null) _begin(tour);
      return;
    }

    final tour = tourById(_currentTourId() ?? '');
    if (tour != null &&
        tour.autoStart &&
        state.loaded &&
        state.canRemember &&
        !state.isSeen(tour.id) &&
        (!tour.afterWelcome || (walkthroughSeen == true && _sawWalkthroughOpen))) {
      _begin(tour);
    }
  }

  @override
  Widget build(BuildContext context) {
    final userId = _userId();
    final state = userId == null ? null : ref.watch(guidedTourProvider(userId));
    // Also rebuild when the student switches tab, so a tour left behind ends.
    ref.watch(mainShellTabIndexProvider);
    // Only the dashboard tour waits for the welcome walkthrough, so only then is its state read.
    final waitsForWelcome = tourById(_currentTourId() ?? '')?.afterWelcome ?? false;
    final bool? walkthroughSeen =
        waitsForWelcome ? ref.watch(onboardingWalkthroughProvider) : null;
    if (walkthroughSeen == false) _sawWalkthroughOpen = true;

    WidgetsBinding.instance
        .addPostFrameCallback((_) => _evaluate(userId, state, walkthroughSeen));

    final run = _run;
    if (run == null) return const SizedBox.shrink();
    return GuidedTourSpotlight(
      key: ObjectKey(run),
      steps: run.steps,
      onFinish: _finish,
    );
  }
}
