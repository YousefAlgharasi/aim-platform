// First-time-user onboarding walkthrough — local-only display state.
//
// Tracks whether this device has already dismissed the walkthrough, so it
// is shown at most once per install (until the app is reinstalled or local
// storage is cleared). Never reads/writes any backend state.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/onboarding/data/onboarding_walkthrough_store.dart';

final onboardingWalkthroughStoreProvider =
    Provider<OnboardingWalkthroughStore>((ref) {
  return const OnboardingWalkthroughStore();
});

/// Null while the local store is still being read; then true/false.
final onboardingWalkthroughProvider =
    StateNotifierProvider<OnboardingWalkthroughNotifier, bool?>((ref) {
  return OnboardingWalkthroughNotifier(
    store: ref.watch(onboardingWalkthroughStoreProvider),
  );
});

class OnboardingWalkthroughNotifier extends StateNotifier<bool?> {
  OnboardingWalkthroughNotifier({required OnboardingWalkthroughStore store})
      : _store = store,
        super(null) {
    _load();
  }

  final OnboardingWalkthroughStore _store;

  Future<void> _load() async {
    final hasSeen = await _store.getHasSeenWalkthrough();
    if (mounted) state = hasSeen;
  }

  Future<void> markSeen() async {
    await _store.setHasSeenWalkthrough(true);
    if (mounted) state = true;
  }
}
