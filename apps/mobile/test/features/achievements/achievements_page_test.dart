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
  Future<RefreshResult> refresh({required String refreshToken}) async =>
      throw UnimplementedError();

  @override
  Future<RegisterResult> register({
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

void main() {
  testWidgets('AchievementsPage renders default badges in English', (tester) async {
    await tester.pumpWidget(_wrap());
    await tester.pumpAndSettle();

    expect(find.text('Achievements'), findsOneWidget);
    expect(find.text('AIM Milestones'), findsOneWidget);
    expect(find.text('All Badges'), findsOneWidget);
    expect(find.text('First Step'), findsOneWidget);
  });

  testWidgets('AchievementsPage renders correctly in Arabic RTL', (tester) async {
    await tester.pumpWidget(_wrap(locale: const Locale('ar')));
    await tester.pumpAndSettle();

    expect(find.text('الإنجازات'), findsOneWidget);
    expect(find.text('إنجازات AIM'), findsOneWidget);
    expect(find.text('جميع الشارات'), findsOneWidget);
    expect(find.text('الخطوة الأولى'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
