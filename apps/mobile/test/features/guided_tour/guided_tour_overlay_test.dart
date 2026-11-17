import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/current_user_model.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'package:aim_mobile/features/guided_tour/data/guided_tour_store.dart';
import 'package:aim_mobile/features/guided_tour/data/tour_definitions.dart';
import 'package:aim_mobile/features/guided_tour/logic/guided_tour_provider.dart';
import 'package:aim_mobile/features/guided_tour/ui/guided_tour_overlay.dart';
import 'package:aim_mobile/features/guided_tour/ui/tour_target.dart';
import 'package:aim_mobile/features/onboarding/data/onboarding_walkthrough_store.dart';
import 'package:aim_mobile/features/onboarding/logic/provider/onboarding_walkthrough_provider.dart';

const _context = AuthContextModel(
  user: CurrentUserModel(
    id: 'usr_1',
    email: 'learner@example.com',
    userType: 'student',
    status: 'active',
  ),
  roles: [],
  permissions: [],
);

class _StubAuthRepo implements AuthRepository {
  @override
  Future<void> requestPasswordReset({required String email}) => throw UnimplementedError();
  @override
  Future<void> resetPassword({required String newPassword, required String bearerToken}) => throw UnimplementedError();
  @override
  Future<AuthContext> getMe(String t) async => throw UnimplementedError();
  @override
  Future<AuthSyncResult> syncUser(String t,
          {String? preferredLanguage, String? timezone}) async =>
      throw UnimplementedError();
  @override
  Future<void> logout(String t) async {}

  @override
  Future<AuthLoginResult> login({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<AuthLoginResult> loginWithGoogle({
    required String idToken,
    String? nonce,
  }) async =>
      throw UnimplementedError();

  @override

  Future<AuthRefreshResult> refresh({required String refreshToken}) async =>
      throw UnimplementedError();

  @override
  Future<AuthRegisterResult> register({
    String? displayName,
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<AuthLoginResult> loginAsTestUser({required String role}) async =>
      throw UnimplementedError();
}

class _FakeTourStore extends GuidedTourStore {
  _FakeTourStore({Set<String>? seen}) : seen = seen ?? {};
  final Set<String> seen;

  @override
  Future<bool?> hasSeen(String userId, String tourId) async =>
      seen.contains(GuidedTourStore.key(userId, tourId));

  @override
  Future<bool> markSeen(String userId, String tourId) async {
    seen.add(GuidedTourStore.key(userId, tourId));
    return true;
  }
}

class _FakeWalkthroughStore extends OnboardingWalkthroughStore {
  _FakeWalkthroughStore(this._seen);
  bool _seen;

  @override
  Future<bool> getHasSeenWalkthrough() async => _seen;

  @override
  Future<void> setHasSeenWalkthrough(bool value) async => _seen = value;
}

ProviderContainer _container({
  required bool walkthroughSeen,
  Set<String>? seenTours,
}) {
  final c = ProviderContainer(
    overrides: [
      guidedTourStoreProvider
          .overrideWithValue(_FakeTourStore(seen: seenTours)),
      onboardingWalkthroughStoreProvider
          .overrideWithValue(_FakeWalkthroughStore(walkthroughSeen)),
      authContextProvider.overrideWith((ref) {
        final n = AuthContextNotifier(repository: _StubAuthRepo(), ref: ref);
        n.state = const AppAsyncState.success(_context);
        return n;
      }),
    ],
  );
  addTearDown(c.dispose);
  return c;
}

Widget _app(ProviderContainer container, {Locale locale = const Locale('en')}) {
  return UncontrolledProviderScope(
    container: container,
    child: MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
      home: Scaffold(
        body: Stack(
          children: [
            ListView(
              children: [
                for (final step in tourById(dashboardTourId)!.steps)
                  TourTarget(
                    id: step.target,
                    child: SizedBox(height: 60, child: Text(step.target)),
                  ),
              ],
            ),
            const GuidedTourOverlay(location: '/main'),
          ],
        ),
      ),
    ),
  );
}

Future<void> _settle(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 300));
  await tester.pump(const Duration(milliseconds: 600));
  await tester.pump(const Duration(milliseconds: 600));
}

void main() {
  testWidgets(
      'first-time student: the dashboard tour starts once the welcome '
      'walkthrough is closed, and is remembered when finished', (tester) async {
    final c = _container(walkthroughSeen: false);
    await tester.pumpWidget(_app(c));
    await _settle(tester);
    // Welcome walkthrough still open: no tour yet.
    expect(find.text('Skip tour'), findsNothing);

    await c.read(onboardingWalkthroughProvider.notifier).markSeen();
    await _settle(tester);
    expect(find.text('Continue your lessons'), findsOneWidget);
    expect(find.text('1 of 7'), findsOneWidget);

    await tester.tap(find.text('Skip tour'));
    await tester.pump();
    expect(find.text('Skip tour'), findsNothing);
    expect(c.read(guidedTourProvider('usr_1')).isSeen(dashboardTourId), isTrue);
  });

  testWidgets('a student who got past the walkthrough earlier is not interrupted',
      (tester) async {
    final c = _container(walkthroughSeen: true);
    await tester.pumpWidget(_app(c));
    await _settle(tester);
    expect(find.text('Skip tour'), findsNothing);
  });

  testWidgets('a tour already seen does not start by itself', (tester) async {
    final c = _container(
      walkthroughSeen: false,
      seenTours: {'aim.tour.v1.usr_1.dashboard'},
    );
    await tester.pumpWidget(_app(c));
    await _settle(tester);
    await c.read(onboardingWalkthroughProvider.notifier).markSeen();
    await _settle(tester);
    expect(find.text('Skip tour'), findsNothing);
  });

  testWidgets('the "?" button / Settings can replay a seen tour, in Arabic',
      (tester) async {
    final c = _container(
      walkthroughSeen: true,
      seenTours: {'aim.tour.v1.usr_1.dashboard'},
    );
    await tester.pumpWidget(_app(c, locale: const Locale('ar')));
    await _settle(tester);
    expect(find.text('تخطي الجولة'), findsNothing);

    c.read(guidedTourProvider('usr_1').notifier).start(dashboardTourId);
    await _settle(tester);
    expect(find.text('أكمل دروسك'), findsOneWidget);
    expect(find.text('1 من 7'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
