import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';
import 'package:aim_mobile/features/auth/data/models/login_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/refresh_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/register_result_model.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';

void main() {
  test('loadCurrentUser signs out when backend rejects an expired session',
      () async {
    final container = ProviderContainer(
      overrides: [
        authRepositoryProvider.overrideWithValue(
          const _FakeAuthRepository(
            getMeException: AppException(
              code: 'UNAUTHORIZED',
              message: 'Unauthorized',
            ),
          ),
        ),
      ],
    );
    addTearDown(container.dispose);

    container
        .read(authFlowProvider.notifier)
        .signIn('learner@example.com', accessToken: 'token-1');

    final didLoadContext = await container
        .read(authContextProvider.notifier)
        .loadCurrentUser('expired-token');

    final authContextState = container.read(authContextProvider);
    final authFlowState = container.read(authFlowProvider);

    expect(didLoadContext, isFalse);
    expect(authFlowState.isSignedOut, isTrue);
    expect(authContextState, isA<AppAsyncFailure<AuthContext>>());
    expect(
      (authContextState as AppAsyncFailure<AuthContext>).code,
      'AUTH_SESSION_EXPIRED',
    );
  });
}

class _FakeAuthRepository implements AuthRepository {
  @override
  Future<void> requestPasswordReset({required String email}) => throw UnimplementedError();
  @override
  Future<void> resetPassword({required String newPassword, required String bearerToken}) => throw UnimplementedError();
  const _FakeAuthRepository({
    this.getMeException,
  });

  final Exception? getMeException;

  @override
  Future<AuthContext> getMe(String bearerToken) async {
    final exception = getMeException;
    if (exception != null) {
      throw exception;
    }
    throw UnimplementedError();
  }

  @override
  Future<AuthSyncResult> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<void> logout(String bearerToken) {
    throw UnimplementedError();
  }

  @override
  Future<AuthLoginResult> login({
    required String email,
    required String password,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<AuthRefreshResult> refresh({required String refreshToken}) {
    throw UnimplementedError();
  }

  @override
  Future<AuthRegisterResult> register({
    required String email,
    required String password,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<AuthLoginResult> loginAsTestUser({required String role}) {
    throw UnimplementedError();
  }
}
