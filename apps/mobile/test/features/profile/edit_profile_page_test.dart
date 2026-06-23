// Phase 6 — P6-114
// Widget tests for EditProfilePage — design system smoke + security checks.

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
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/profile/ui/pages/edit_profile_page.dart';

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

class _StubAuthFlowRepo {
  Future<void> signIn(String email, String password) async =>
      throw UnimplementedError();

  Future<void> signOut(String token) async {}

  Future<String?> restoreSession() async => null;
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
      authFlowProvider.overrideWith((ref) {
        return AuthFlowNotifier(repository: _StubAuthFlowRepo());
      }),
    ],
    child: const MaterialApp(home: EditProfilePage()),
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  testWidgets('EditProfilePage uses AIMTopAppBar', (tester) async {
    await tester
        .pumpWidget(_wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    expect(find.byType(AIMTopAppBar), findsOneWidget);
  });

  testWidgets('EditProfilePage renders without exceptions', (tester) async {
    await tester
        .pumpWidget(_wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    expect(tester.takeException(), isNull);
  });

  testWidgets('EditProfilePage shows AIMInput fields', (tester) async {
    await tester
        .pumpWidget(_wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    expect(find.byType(AIMInput), findsNWidgets(3));
  });

  testWidgets('EditProfilePage pre-populates fields from auth context',
      (tester) async {
    await tester
        .pumpWidget(_wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    expect(find.text('Yousef'), findsOneWidget);
    expect(find.text('ar'), findsOneWidget);
    expect(find.text('Asia/Riyadh'), findsOneWidget);
  });

  testWidgets('EditProfilePage shows safe-fields info banner', (tester) async {
    await tester
        .pumpWidget(_wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    expect(find.byType(AIMAlertBanner), findsOneWidget);
  });

  testWidgets('EditProfilePage renders under Arabic RTL locale',
      (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authContextProvider.overrideWith((ref) {
            final n =
                AuthContextNotifier(repository: _StubAuthRepo(), ref: ref);
            n.state = const AppAsyncState.success(_studentContext);
            return n;
          }),
          authFlowProvider.overrideWith(
              (ref) => AuthFlowNotifier(repository: _StubAuthFlowRepo())),
        ],
        child: const MaterialApp(
          locale: Locale('ar'),
          home: EditProfilePage(),
        ),
      ),
    );
    await tester.pump();

    expect(find.byType(EditProfilePage), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('EditProfilePage Save button disabled when not dirty',
      (tester) async {
    await tester
        .pumpWidget(_wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    // Save button should be disabled (not dirty yet).
    final saveBtn = find.widgetWithText(AIMButton, 'Save');
    expect(saveBtn, findsOneWidget);
    final btn = tester.widget<AIMButton>(saveBtn);
    expect(btn.disabled, isTrue);
  });
}
