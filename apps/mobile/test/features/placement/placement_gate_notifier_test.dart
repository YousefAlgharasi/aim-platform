import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:aim_mobile/features/placement/data/models/placement_decision_model.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_gate_notifier.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

class _FakeRepository implements PlacementRepository {
  _FakeRepository({this.shouldShow = false, this.fail = false});

  final bool shouldShow;
  final bool fail;
  int decisionCalls = 0;

  @override
  Future<PlacementDecisionModel> getPlacementDecision(String bearerToken) async {
    decisionCalls++;
    if (fail) throw Exception('network down');
    return PlacementDecisionModel(shouldShowGate: shouldShow);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

String _tokenFor(String sub) {
  String enc(Map<String, dynamic> m) =>
      base64Url.encode(utf8.encode(jsonEncode(m))).replaceAll('=', '');
  return '${enc({'alg': 'none'})}.${enc({'sub': sub})}.sig';
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('a transient error fails open and is not remembered', () async {
    final repo = _FakeRepository(fail: true);
    final notifier = PlacementGateNotifier(repository: repo);

    await notifier.check(_tokenFor('u1'));
    expect(notifier.state, isA<PlacementGateHidden>());

    await notifier.check(_tokenFor('u1'));
    expect(repo.decisionCalls, 2);
  });

  test('once the backend releases the gate, later checks skip the request',
      () async {
    final repo = _FakeRepository();
    final notifier = PlacementGateNotifier(repository: repo);

    await notifier.check(_tokenFor('u1'));
    await notifier.check(_tokenFor('u1'));

    expect(notifier.state, isA<PlacementGateHidden>());
    expect(repo.decisionCalls, 1);
  });

  test('the memo is per user', () async {
    final repo = _FakeRepository();
    final notifier = PlacementGateNotifier(repository: repo);

    await notifier.check(_tokenFor('u1'));
    await notifier.check(_tokenFor('u2'));

    expect(repo.decisionCalls, 2);
  });

  test('a gate that must show is never remembered', () async {
    final repo = _FakeRepository(shouldShow: true);
    final notifier = PlacementGateNotifier(repository: repo);

    await notifier.check(_tokenFor('u1'));
    expect(notifier.state, isA<PlacementGateShouldShow>());

    await notifier.check(_tokenFor('u1'));
    expect(repo.decisionCalls, 2);
  });
}
