import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/data/session/session_store.dart';
import 'package:aim_mobile/features/auth/logic/provider/app_bootstrap_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/app_bootstrap_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/logout_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/logout_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/session_store_provider.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';

// ── Fake implementations ──────────────────────────────────────────────────────

class FakeSessionStore implements SessionStore {
  SessionData? _data;

  @override
  Future<void> save({
    required String accessToken,
    required String email,
  }) async {
    _data = SessionData(accessToken: accessToken, email: email);
  }

  @override
  Future<SessionData?> read() async => _data;

  @override
  Future<void> clear() async => _data = null;

  bool get isEmpty => _data == null;
}

class _NoOpAuthRepository implements AuthRepository {
  @override
  Future<AuthContextModel> getMe(String bearerToken) async =>
      throw UnimplementedError();

  @override
  Future<AuthSyncResponseModel> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  }) async =>
      throw UnimplementedError();

  @override
  Future<void> logout(String bearerToken) async {}
}

/// AppBootstrapNotifier that resolves immediately without async I/O.
/// Stores ref locally to avoid accessing private _ref from parent.
class _ImmediateBootstrapNotifier extends AppBootstrapNotifier {
  _ImmediateBootstrapNotifier(super.ref)
      : _testRef = ref;

  final Ref _testRef;

  @override
  Future<void> checkSession() async {
    final store = _testRef.read(sessionStoreProvider);
    final session = await store.read();
    if (session != null && session.accessToken.isNotEmpty) {
      _testRef.read(authFlowProvider.notifier).signIn(
            session.email,
            accessToken: session.accessToken,
          );
    } else {
      _testRef.read(authFlowProvider.notifier).completeBootstrap();
    }
    if (mounted) state = AppBootstrapStatus.done;
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  // ── SecureSessionStore contract ────────────────────────────────────────

  group('FakeSessionStore (contract tests)', () {
    test('read returns null when nothing saved', () async {
      final store = FakeSessionStore();
      expect(await store.read(), isNull);
    });

    test('save then read returns the saved data', () async {
      final store = FakeSessionStore();
      await store.save(accessToken: 'tok-1', email: 'a@b.com');

      final result = await store.read();
      expect(result, isNotNull);
      expect(result!.accessToken, 'tok-1');
      expect(result.email, 'a@b.com');
    });

    test('clear removes stored data', () async {
      final store = FakeSessionStore();
      await store.save(accessToken: 'tok-1', email: 'a@b.com');
      await store.clear();

      expect(await store.read(), isNull);
    });
  });

  // ── AppBootstrapNotifier session restore ───────────────────────────────

  group('AppBootstrapNotifier session restore', () {
    test('restores session when store has a valid token', () async {
      final store = FakeSessionStore();
      await store.save(accessToken: 'tok-abc', email: 'learner@example.com');

      final container = ProviderContainer(
        overrides: [
          sessionStoreProvider.overrideWithValue(store),
          appBootstrapProvider.overrideWith(
            (ref) => _ImmediateBootstrapNotifier(ref),
          ),
        ],
      );
      addTearDown(container.dispose);

      // Trigger bootstrap.
      container.read(appBootstrapProvider);
      await Future<void>.delayed(Duration.zero);

      final authState = container.read(authFlowProvider);
      expect(authState.isSignedIn, isTrue);
      expect(authState.accessToken, 'tok-abc');
      expect(authState.email, 'learner@example.com');
    });

    test('goes to signedOut when store is empty', () async {
      final store = FakeSessionStore();

      final container = ProviderContainer(
        overrides: [
          sessionStoreProvider.overrideWithValue(store),
          appBootstrapProvider.overrideWith(
            (ref) => _ImmediateBootstrapNotifier(ref),
          ),
        ],
      );
      addTearDown(container.dispose);

      container.read(appBootstrapProvider);
      await Future<void>.delayed(Duration.zero);

      expect(container.read(authFlowProvider).isSignedOut, isTrue);
    });
  });

  // ── LogoutNotifier session clear ───────────────────────────────────────

  group('LogoutNotifier session clear', () {
    test('clears the persisted session on logout', () async {
      final store = FakeSessionStore();
      await store.save(accessToken: 'tok-xyz', email: 'learner@example.com');

      final container = ProviderContainer(
        overrides: [
          sessionStoreProvider.overrideWithValue(store),
          logoutProvider.overrideWith(
            (ref) => LogoutNotifier(
              repository: _NoOpAuthRepository(),
              ref: ref,
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      // Pre-condition: session stored.
      expect(store.isEmpty, isFalse);

      // Sign in so logout has a token.
      container
          .read(authFlowProvider.notifier)
          .signIn('learner@example.com', accessToken: 'tok-xyz');

      await container.read(logoutProvider.notifier).logout('tok-xyz');

      // Post-condition: session cleared.
      expect(store.isEmpty, isTrue);
      expect(container.read(authFlowProvider).isSignedOut, isTrue);
    });

    test('logout clears auth state even when backend call fails', () async {
      final store = FakeSessionStore();
      await store.save(accessToken: 'tok-xyz', email: 'learner@example.com');

      final container = ProviderContainer(
        overrides: [
          sessionStoreProvider.overrideWithValue(store),
          logoutProvider.overrideWith(
            (ref) => LogoutNotifier(
              // Repository throws — logout must still complete locally.
              repository: _ThrowingAuthRepository(),
              ref: ref,
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      container
          .read(authFlowProvider.notifier)
          .signIn('learner@example.com', accessToken: 'tok-xyz');

      await container.read(logoutProvider.notifier).logout('tok-xyz');

      expect(store.isEmpty, isTrue);
      expect(container.read(authFlowProvider).isSignedOut, isTrue);
    });
  });
}

class _ThrowingAuthRepository implements AuthRepository {
  @override
  Future<AuthContextModel> getMe(String bearerToken) async =>
      throw UnimplementedError();

  @override
  Future<AuthSyncResponseModel> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  }) async =>
      throw UnimplementedError();

  @override
  Future<void> logout(String bearerToken) async =>
      throw Exception('Server unavailable');
}
