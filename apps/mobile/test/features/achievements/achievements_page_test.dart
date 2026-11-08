import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/achievements/data/models/achievement_model.dart';
import 'package:aim_mobile/features/achievements/logic/provider/achievements_provider.dart';
import 'package:aim_mobile/features/achievements/logic/provider/achievements_notifier.dart';
import 'package:aim_mobile/features/achievements/logic/repository/achievements_repository.dart';
import 'package:aim_mobile/features/achievements/ui/pages/achievements_page.dart';
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
import 'package:aim_mobile/l10n/app_localizations.dart';

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
  Future<void> resetPassword({required String newPassword, required String bearerToken}) async {}
  @override
  Future<void> requestPasswordReset({required String email}) => throw UnimplementedError();
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
  Future<LoginResult> loginWithGoogle({
    required String idToken,
    String? nonce,
  }) async =>
      throw UnimplementedError();

  @override
  Future<RefreshResult> refresh({required String refreshToken}) async =>
      throw UnimplementedError();

  @override
  Future<RegisterResult> register({
    String? displayName,
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<LoginResult> loginAsTestUser({required String role}) async =>
      throw UnimplementedError();
}

class _StubAchievementsRepo implements AchievementsRepository {
  @override
  Future<List<AchievementModel>> getAchievements({required String bearerToken}) async =>
      const [];
}

Widget _wrap({
  Locale locale = const Locale('en'),
  List<AchievementModel>? achievements,
}) {
  return ProviderScope(
    overrides: [
      authContextProvider.overrideWith((ref) {
        final notifier = AuthContextNotifier(
          repository: _StubAuthRepo(),
          ref: ref,
        );
        notifier.state = const AppAsyncState.success(_studentContext);
        return notifier;
      }),
      achievementsProvider.overrideWith((ref) {
        final notifier = AchievementsNotifier(repository: _StubAchievementsRepo());
        if (achievements != null) {
          notifier.state = AppAsyncState.success(achievements);
        }
        return notifier;
      }),
    ],
    child: MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: const AchievementsPage(),
    ),
  );
}

const _unlocked = AchievementModel(
  key: 'first_step',
  title: 'First Steps',
  description: 'Complete your first lesson.',
  icon: 'menu_book',
  category: 'learning',
  unlocked: true,
  unlockedAt: '2026-10-18T10:00:00Z',
);

const _locked = AchievementModel(
  key: 'streak_master',
  title: 'Week Warrior',
  description: 'Keep a 7-day learning streak.',
  icon: 'local_fire_department',
  category: 'streak',
  unlocked: false,
  unlockedAt: null,
);

void main() {
  testWidgets('shows real achievements with the progress panel (English)', (tester) async {
    await tester.pumpWidget(_wrap(achievements: const [_unlocked, _locked]));
    await tester.pumpAndSettle();

    expect(find.text('Achievements'), findsOneWidget);
    expect(find.text('1 of 2 badges unlocked'), findsOneWidget);
    expect(find.text('All (2)'), findsOneWidget);
    expect(find.text('Unlocked (1)'), findsOneWidget);
    expect(find.text('Locked (1)'), findsOneWidget);
    expect(find.text('First Steps'), findsOneWidget);
    expect(find.text('Week Warrior'), findsOneWidget);
    expect(find.text('Locked'), findsOneWidget);
  });

  testWidgets('the Locked filter shows only locked badges', (tester) async {
    await tester.pumpWidget(_wrap(achievements: const [_unlocked, _locked]));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Locked (1)'));
    await tester.pumpAndSettle();
    expect(find.text('Week Warrior'), findsOneWidget);
    expect(find.text('First Steps'), findsNothing);
  });

  testWidgets('never invents badges when the backend has none', (tester) async {
    await tester.pumpWidget(_wrap(achievements: const []));
    await tester.pumpAndSettle();

    expect(find.text('No achievements yet'), findsOneWidget);
    expect(find.text('First Steps'), findsNothing);
  });

  testWidgets('renders correctly in Arabic RTL', (tester) async {
    await tester.pumpWidget(
      _wrap(locale: const Locale('ar'), achievements: const [_unlocked, _locked]),
    );
    await tester.pumpAndSettle();

    expect(find.text('الإنجازات'), findsOneWidget);
    expect(find.text('الكل (2)'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
