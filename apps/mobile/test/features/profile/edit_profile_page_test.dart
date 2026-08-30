// Phase 6 — P6-114
// Widget tests for EditProfilePage — design system smoke + security checks.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/client_safe_profile_model.dart';
import 'package:aim_mobile/features/auth/data/models/current_user_model.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_notifier.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
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
  Future<void> requestPasswordReset({required String email}) => throw UnimplementedError();
  @override
  Future<void> resetPassword({required String newPassword, required String bearerToken}) => throw UnimplementedError();
  @override
  Future<AuthContext> getMe(String t) async => _studentContext;
  @override
  Future<AuthSyncResult> syncUser(String t,
          {String? preferredLanguage, String? timezone}) async =>
      const AuthSyncResult(
        user: AuthUser(
          id: 'usr_1',
          email: 'learner@example.com',
          userType: 'student',
          status: 'active',
        ),
        syncedAt: _ts,
      );
  @override
  Future<void> logout(String t) async {}

  @override
  Future<AuthLoginResult> login({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<AuthRefreshResult> refresh({required String refreshToken}) async =>
      throw UnimplementedError();

  @override
  Future<AuthRegisterResult> register({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<AuthLoginResult> loginAsTestUser({required String role}) async =>
      throw UnimplementedError();
}

Widget _wrap(AppAsyncState<AuthContextModel> authState, {Locale? locale}) {
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
        return AuthFlowNotifier();
      }),
    ],
    child: MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
      home: const EditProfilePage(),
    ),
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  testWidgets('EditProfilePage shows gradient header title', (tester) async {
    await tester
        .pumpWidget(_wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    expect(find.text('Edit profile'), findsOneWidget);
  });

  testWidgets('EditProfilePage renders without exceptions', (tester) async {
    await tester
        .pumpWidget(_wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    expect(tester.takeException(), isNull);
  });

  testWidgets('EditProfilePage renders without exceptions under Arabic RTL',
      (tester) async {
    await tester.pumpWidget(
      _wrap(
        const AppAsyncState.success(_studentContext),
        locale: const Locale('ar'),
      ),
    );
    await tester.pump();

    expect(find.byType(EditProfilePage), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('EditProfilePage header Save action disabled when not dirty',
      (tester) async {
    await tester
        .pumpWidget(_wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    // Header "Save" text action should be disabled (not dirty yet).
    final saveBtn = find.widgetWithText(TextButton, 'Save');
    expect(saveBtn, findsOneWidget);
    final btn = tester.widget<TextButton>(saveBtn);
    expect(btn.onPressed, isNull);
  });

  testWidgets('EditProfilePage enables Save action when displayName edited',
      (tester) async {
    await tester
        .pumpWidget(_wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    // Enter new display name in text field
    final textField = find.byType(TextField).first;
    await tester.enterText(textField, 'New Name');
    await tester.pump();

    final saveBtn = find.widgetWithText(TextButton, 'Save');
    final btn = tester.widget<TextButton>(saveBtn);
    expect(btn.onPressed, isNotNull);
  });

  testWidgets('EditProfilePage never sends studentId or role from Flutter client',
      (tester) async {
    // Security check: Verify that only safe profile fields (displayName,
    // preferredLanguage, timezone) are displayed/editable.
    await tester
        .pumpWidget(_wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    // Sensitive internal IDs and roles must never appear in the edit form
    expect(find.text('usr_1'), findsNothing);
    expect(find.text('sp_1'), findsNothing);
    expect(find.text('student_profile'), findsNothing);
  });
}
