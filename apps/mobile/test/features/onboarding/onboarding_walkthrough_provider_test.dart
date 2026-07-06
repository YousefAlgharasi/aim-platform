import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/onboarding/data/onboarding_walkthrough_store.dart';
import 'package:aim_mobile/features/onboarding/logic/provider/onboarding_walkthrough_provider.dart';

class _FakeStore extends OnboardingWalkthroughStore {
  _FakeStore({bool initiallySeen = false}) : _seen = initiallySeen;

  bool _seen;

  @override
  Future<bool> getHasSeenWalkthrough() async => _seen;

  @override
  Future<void> setHasSeenWalkthrough(bool value) async {
    _seen = value;
  }
}

void main() {
  group('OnboardingWalkthroughNotifier', () {
    test('starts null while loading, then resolves to false for a first launch',
        () async {
      final container = ProviderContainer(
        overrides: [
          onboardingWalkthroughStoreProvider.overrideWithValue(_FakeStore()),
        ],
      );
      addTearDown(container.dispose);

      expect(container.read(onboardingWalkthroughProvider), isNull);

      await pumpEventQueue();

      expect(container.read(onboardingWalkthroughProvider), isFalse);
    });

    test('resolves to true when the store already recorded it as seen',
        () async {
      final container = ProviderContainer(
        overrides: [
          onboardingWalkthroughStoreProvider
              .overrideWithValue(_FakeStore(initiallySeen: true)),
        ],
      );
      addTearDown(container.dispose);
      container.read(onboardingWalkthroughProvider);

      await pumpEventQueue();

      expect(container.read(onboardingWalkthroughProvider), isTrue);
    });

    test('markSeen persists to the store and updates state to true',
        () async {
      final store = _FakeStore();
      final container = ProviderContainer(
        overrides: [
          onboardingWalkthroughStoreProvider.overrideWithValue(store),
        ],
      );
      addTearDown(container.dispose);
      container.read(onboardingWalkthroughProvider);

      await pumpEventQueue();
      expect(container.read(onboardingWalkthroughProvider), isFalse);

      await container.read(onboardingWalkthroughProvider.notifier).markSeen();

      expect(container.read(onboardingWalkthroughProvider), isTrue);
      expect(await store.getHasSeenWalkthrough(), isTrue);
    });
  });
}
