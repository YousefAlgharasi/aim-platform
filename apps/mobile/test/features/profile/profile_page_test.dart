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
import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';
import 'package:aim_mobile/features/profile/ui/pages/profile_page.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

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
    ],
    child: MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: const ProfilePage(),
    ),
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  testWidgets('ProfilePage renders sections and quick links', (tester) async {
    await tester.pumpWidget(
        _wrap(const AppAsyncState.success(_studentContext)));
    await tester.pump();

    expect(find.text('ACCOUNT'), findsOneWidget);
    expect(find.text('PROFILE'), findsOneWidget);
    expect(find.text('QUICK LINKS'), findsOneWidget);
    expect(find.text('Learning Path'), findsOneWidget);
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
      _wrap(
        const AppAsyncState.success(_studentContext),
        locale: const Locale('ar'),
      ),
    );
    await tester.pump();

    expect(find.byType(ProfilePage), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
