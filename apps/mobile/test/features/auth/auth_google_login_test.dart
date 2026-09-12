import 'package:aim_mobile/core/config/config.dart';
import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/features/auth/data/datasources/auth_remote_datasource_impl.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';
import 'package:aim_mobile/features/auth/data/models/current_user_model.dart';
import 'package:aim_mobile/features/auth/data/models/login_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/refresh_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/register_result_model.dart';
import 'package:aim_mobile/features/auth/data/repository/repo_impl/auth_repository_impl.dart';
import 'package:aim_mobile/features/auth/data/session/session_store.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/login_provider.dart';

import 'package:aim_mobile/features/auth/logic/provider/register_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/register_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/session_store_provider.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'package:aim_mobile/l10n/app_localizations_en.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

class _FakeGoogleSignInAccount extends Fake implements GoogleSignInAccount {
  _FakeGoogleSignInAccount(this._email, this._auth);

  final String _email;
  final GoogleSignInAuthentication _auth;

  @override
  String get email => _email;

  @override
  Future<GoogleSignInAuthentication> get authentication async => _auth;
}

class _FakeGoogleSignInAuthentication extends Fake
    implements GoogleSignInAuthentication {
  _FakeGoogleSignInAuthentication(this._idToken);

  final String? _idToken;

  @override
  String? get idToken => _idToken;
}

class _FakeGoogleSignIn extends Fake implements GoogleSignIn {
  _FakeGoogleSignIn({this.accountToReturn});

  final GoogleSignInAccount? accountToReturn;

  @override
  Future<GoogleSignInAccount?> signIn() async => accountToReturn;
}

class _TestAuthRepository implements AuthRepository {
  LoginResult? loginResultToReturn;
  Exception? exceptionToThrow;
  String? lastIdTokenReceived;

  @override
  Future<LoginResult> loginWithGoogle({
    required String idToken,
    String? nonce,
  }) async {
    lastIdTokenReceived = idToken;
    if (exceptionToThrow != null) throw exceptionToThrow!;
    return loginResultToReturn ??
        const LoginResult(
          accessToken: 'access-123',
          refreshToken: 'refresh-123',
          expiresAt: 1800000000,
          userId: 'user-google-1',
          userEmail: 'googleuser@example.com',
        );
  }

  @override
  Future<AuthContext> getMe(String bearerToken) async {
    return const AuthContextModel(
      user: CurrentUserModel(
        id: 'user-google-1',
        email: 'googleuser@example.com',
        userType: 'student',
        status: 'active',
      ),
      roles: [],
      permissions: [],
    );
  }

  @override
  Future<AuthSyncResult> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  }) async {
    return const AuthSyncResponseModel(
      user: CurrentUserModel(
        id: 'user-google-1',
        email: 'googleuser@example.com',
        userType: 'student',
        status: 'active',
      ),
      created: true,
    );
  }



  @override
  Future<void> logout(String bearerToken) async {}

  @override
  Future<LoginResult> login({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<LoginResult> loginAsTestUser({required String role}) async =>
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
  Future<void> requestPasswordReset({required String email}) async {}

  @override
  Future<void> resetPassword({
    required String newPassword,
    required String bearerToken,
  }) async {}
}

class _InMemorySessionStore implements SessionStore {
  String? savedAccessToken;
  String? savedRefreshToken;
  int? savedExpiresAt;
  String? savedEmail;

  @override
  Future<void> clear() async {
    savedAccessToken = null;
    savedRefreshToken = null;
    savedExpiresAt = null;
    savedEmail = null;
  }

  @override
  Future<SessionData?> read() async {
    if (savedAccessToken == null) return null;
    return SessionData(
      accessToken: savedAccessToken!,
      refreshToken: savedRefreshToken!,
      expiresAt: savedExpiresAt!,
      email: savedEmail!,
    );
  }

  @override
  Future<void> save({
    required String accessToken,
    required String refreshToken,
    required int expiresAt,
    required String email,
  }) async {
    savedAccessToken = accessToken;
    savedRefreshToken = refreshToken;
    savedExpiresAt = expiresAt;
    savedEmail = email;
  }
}

void main() {
  final l10n = AppLocalizationsEn();

  group('AuthRemoteDatasourceImpl - loginWithGoogle', () {
    test('POST /auth/google with idToken and parses LoginResult correctly',
        () async {
      final client = BackendApiClient(
        config: const AppConfig(
          environment: 'test',
          backendApiBaseUrl: 'https://api.example.com',
        ),
        httpClient: MockClient((request) async {
          expect(request.method, 'POST');
          expect(request.url.toString(), 'https://api.example.com/auth/google');
          expect(request.body, contains('"idToken":"google-id-token-abc"'));

          return http.Response(
            '{"success":true,"data":{"accessToken":"access-token-999","refreshToken":"refresh-token-999","expiresAt":1800000000,"user":{"id":"google-user-id-1","email":"student@gmail.com"}},"meta":{}}',
            200,
          );
        }),
      );
      final datasource = AuthRemoteDatasourceImpl(apiClient: client);

      final result =
          await datasource.loginWithGoogle(idToken: 'google-id-token-abc');

      expect(result.accessToken, 'access-token-999');
      expect(result.refreshToken, 'refresh-token-999');
      expect(result.expiresAt, 1800000000);
      expect(result.userId, 'google-user-id-1');
      expect(result.userEmail, 'student@gmail.com');
    });
  });

  group('AuthRepositoryImpl - loginWithGoogle', () {
    test('maps ApiClientException to AppException', () async {
      final client = BackendApiClient(
        config: const AppConfig(
          environment: 'test',
          backendApiBaseUrl: 'https://api.example.com',
        ),
        httpClient: MockClient((request) async {
          return http.Response(
            '{"success":false,"error":{"code":"UNAUTHORIZED","message":"Invalid Google ID Token"}}',
            401,
          );
        }),
      );
      final datasource = AuthRemoteDatasourceImpl(apiClient: client);
      final repository = AuthRepositoryImpl(datasource: datasource);

      expect(
        () => repository.loginWithGoogle(idToken: 'invalid-token'),
        throwsA(isA<AppException>().having(
          (e) => e.message,
          'message',
          contains('Invalid Google ID Token'),
        )),
      );
    });
  });

  group('LoginNotifier - submitGoogleLogin', () {
    test('successful Google login syncs context and transitions state',
        () async {
      final fakeRepo = _TestAuthRepository();
      final fakeSessionStore = _InMemorySessionStore();

      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(fakeRepo),
          sessionStoreProvider.overrideWithValue(fakeSessionStore),
        ],
      );

      final notifier = container.read(loginProvider.notifier);

      final fakeGoogleSignIn = _FakeGoogleSignIn(
        accountToReturn: _FakeGoogleSignInAccount(
          'googleuser@example.com',
          _FakeGoogleSignInAuthentication('valid-google-id-token'),
        ),
      );

      await notifier.submitGoogleLogin(l10n,
          googleSignInOverride: fakeGoogleSignIn);

      expect(fakeRepo.lastIdTokenReceived, 'valid-google-id-token');
      expect(fakeSessionStore.savedAccessToken, 'access-123');
      expect(fakeSessionStore.savedEmail, 'googleuser@example.com');
      expect(container.read(authFlowProvider).isSignedIn, isTrue);
    });

    test('user cancellation of Google dialog does not submit or crash',
        () async {
      final fakeRepo = _TestAuthRepository();
      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(fakeRepo),
        ],
      );

      final notifier = container.read(loginProvider.notifier);

      final fakeGoogleSignIn = _FakeGoogleSignIn(accountToReturn: null);

      await notifier.submitGoogleLogin(l10n,
          googleSignInOverride: fakeGoogleSignIn);

      expect(fakeRepo.lastIdTokenReceived, isNull);
      expect(container.read(loginProvider).isSubmitting, isFalse);
      expect(container.read(loginProvider).errorMessage, isNull);
    });

    test('backend failure sets errorMessage on formState', () async {
      final fakeRepo = _TestAuthRepository()
        ..exceptionToThrow =
            const AppException(code: 'UNAUTHORIZED', message: 'Google Auth Error');

      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(fakeRepo),
        ],
      );

      final notifier = container.read(loginProvider.notifier);

      final fakeGoogleSignIn = _FakeGoogleSignIn(
        accountToReturn: _FakeGoogleSignInAccount(
          'googleuser@example.com',
          _FakeGoogleSignInAuthentication('valid-google-id-token'),
        ),
      );

      await notifier.submitGoogleLogin(l10n,
          googleSignInOverride: fakeGoogleSignIn);

      expect(container.read(loginProvider).isSubmitting, isFalse);
      expect(container.read(loginProvider).errorMessage, 'Google Auth Error');
    });
  });

  group('RegisterNotifier - submitGoogleLogin', () {
    test('successful Google register syncs context and transitions state',
        () async {
      final fakeRepo = _TestAuthRepository();
      final fakeSessionStore = _InMemorySessionStore();

      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(fakeRepo),
          sessionStoreProvider.overrideWithValue(fakeSessionStore),
        ],
      );

      final notifier = container.read(registerProvider.notifier);

      final fakeGoogleSignIn = _FakeGoogleSignIn(
        accountToReturn: _FakeGoogleSignInAccount(
          'googleuser@example.com',
          _FakeGoogleSignInAuthentication('valid-google-id-token'),
        ),
      );

      await notifier.submitGoogleLogin(l10n,
          googleSignInOverride: fakeGoogleSignIn);

      expect(fakeRepo.lastIdTokenReceived, 'valid-google-id-token');
      expect(fakeSessionStore.savedAccessToken, 'access-123');
      expect(notifier.outcome, RegisterOutcome.signedIn);
      expect(container.read(authFlowProvider).isSignedIn, isTrue);
    });
  });
}
