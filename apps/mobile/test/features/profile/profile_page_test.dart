import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/client_safe_profile_model.dart';
import 'package:aim_mobile/features/auth/data/models/current_user_model.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_notifier.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';
import 'package:aim_mobile/features/auth/data/models/login_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/refresh_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/register_result_model.dart';
import 'package:aim_mobile/features/auth/ui/widgets/logout_button.dart';
import 'package:aim_mobile/features/profile/ui/pages/profile_page.dart';

// ── Helpers ───────────────────────────────────────────────────────────────────

const _ts = '2026-01-01T00:00:00Z';

const _studentContext = AuthContextModel(
  user: CurrentUserModel(
    id: 'usr_1',
    email: 'learner@example.com',
    userType: 'student',
    status: 'active',
  ),
  profile: ClientSafeProfileModel(
    id: 'sp_1',
    userId: 'usr_1',
    profileType: 'student_profile',
    displayName: 'Yousef',
    preferredLanguage: 'ar',
    timezone: 'Asia/Riyadh',
    createdAt: _ts,
    updatedAt: _ts,
  ),
  roles: [],
  permissions: [],
);

class _StubAuthRepo implements AuthRepository {
  @override
  Future<AuthContextModel> getMe(String t) async => throw UnimplementedError();
  @override
  Future<AuthSyncResponseModel> syncUser(String t,
          {String? preferredLanguage, String? timezone}) async =>
      throw UnimplementedError();
  @override
  Future<void> logout(String t) async {}

  @override
  Future<LoginResult> login({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<RefreshResult> refresh({required String refreshToken}) async =>
      throw UnimplementedError();

  @override
  Future<RegisterResult> register({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();
}

Widget _wrap(AppAsyncState<AuthContextModel> authState) {
  return ProviderScope(
    overrides: [
      authContextProvider.overrideWith((ref) {
        final notifier = AuthContextNotifier(
          repository: _StubAuthRepo(),
          ref: ref,
        );
        notifier.state = authState;
        return notifier;
      }),
    ],
    child: const MaterialApp(home: ProfilePage()),
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  testWidgets('ProfilePage uses AIM design system widgets', (tester) async {
    await tester.pumpWidget(
        _wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    expect(find.byType(AIMTopAppBar), findsOneWidget);
    expect(find.byType(LogoutButton), findsOneWidget);
    expect(find.byType(AIMCard), findsWidgets);
  });

  testWidgets('ProfilePage shows display name and email', (tester) async {
    await tester.pumpWidget(
        _wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    expect(find.text('Yousef'), findsWidgets);
    expect(find.text('learner@example.com'), findsWidgets);
  });

  testWidgets('ProfilePage shows AIMFullScreenLoading while loading',
      (tester) async {
    await tester.pumpWidget(_wrap(const AppAsyncState.loading()));
    await tester.pump();

    expect(find.byType(AIMFullScreenLoading), findsOneWidget);
  });

  testWidgets('ProfilePage shows AIMFullScreenError on failure', (tester) async {
    await tester.pumpWidget(
        _wrap(const AppAsyncState.failure(message: 'Network error')));
    await tester.pump();

    expect(find.byType(AIMFullScreenError), findsOneWidget);
  });

  testWidgets('ProfilePage renders without errors under Arabic RTL locale',
      (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authContextProvider.overrideWith((ref) {
            final n = AuthContextNotifier(
                repository: _StubAuthRepo(), ref: ref);
            n.state = const AppAsyncState.success(_studentContext);
            return n;
          }),
        ],
        child: const MaterialApp(
          locale: Locale('ar'),
          home: ProfilePage(),
        ),
      ),
    );
    await tester.pump();

    expect(find.byType(ProfilePage), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
