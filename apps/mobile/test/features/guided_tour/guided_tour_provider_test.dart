import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/guided_tour/data/guided_tour_store.dart';
import 'package:aim_mobile/features/guided_tour/logic/guided_tour_provider.dart';

class _FakeStore extends GuidedTourStore {
  _FakeStore({Set<String>? seen, this.broken = false}) : seen = seen ?? {};

  final Set<String> seen;
  final bool broken;

  @override
  Future<bool?> hasSeen(String userId, String tourId) async =>
      broken ? null : seen.contains(GuidedTourStore.key(userId, tourId));

  @override
  Future<bool> markSeen(String userId, String tourId) async {
    if (broken) return false;
    seen.add(GuidedTourStore.key(userId, tourId));
    return true;
  }
}

ProviderContainer _container(_FakeStore store) {
  final c = ProviderContainer(
    overrides: [guidedTourStoreProvider.overrideWithValue(store)],
  );
  addTearDown(c.dispose);
  return c;
}

void main() {
  test('is per user and per tour', () async {
    final store = _FakeStore();
    final c = _container(store);

    expect(c.read(guidedTourProvider('u1')).loaded, isFalse);
    await pumpEventQueue();
    expect(c.read(guidedTourProvider('u1')).isSeen('dashboard'), isFalse);

    await c.read(guidedTourProvider('u1').notifier).markSeen('dashboard');
    expect(c.read(guidedTourProvider('u1')).isSeen('dashboard'), isTrue);
    expect(c.read(guidedTourProvider('u1')).isSeen('courses'), isFalse);
    expect(c.read(guidedTourProvider('u2')).isSeen('dashboard'), isFalse);
    expect(store.seen, contains('aim.tour.v1.u1.dashboard'));
  });

  test('remembers what was saved on an earlier run', () async {
    final c = _container(_FakeStore(seen: {'aim.tour.v1.u1.dashboard'}));
    c.read(guidedTourProvider('u1'));
    await pumpEventQueue();
    final s = c.read(guidedTourProvider('u1'));
    expect(s.loaded, isTrue);
    expect(s.canRemember, isTrue);
    expect(s.isSeen('dashboard'), isTrue);
  });

  test('when storage cannot be read it says so, so nothing starts by itself',
      () async {
    final c = _container(_FakeStore(broken: true));
    c.read(guidedTourProvider('u1'));
    await pumpEventQueue();
    expect(c.read(guidedTourProvider('u1')).canRemember, isFalse);
  });

  test('start asks for a tour; asking twice is two requests', () async {
    final c = _container(_FakeStore());
    final n = c.read(guidedTourProvider('u1').notifier);
    n.start('practice');
    final first = c.read(guidedTourProvider('u1')).request!;
    expect(first.tourId, 'practice');
    n.clearRequest();
    expect(c.read(guidedTourProvider('u1')).request, isNull);
    n.start('practice');
    expect(c.read(guidedTourProvider('u1')).request!.serial,
        isNot(first.serial));
  });
}
