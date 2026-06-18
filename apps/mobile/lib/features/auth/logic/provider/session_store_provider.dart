import 'package:aim_mobile/features/auth/data/session/secure_session_store.dart';
import 'package:aim_mobile/features/auth/data/session/session_store.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';


/// Provides the [SessionStore] singleton used across the auth feature.
///
/// Override this provider in tests with a [FakeSessionStore] to avoid
/// touching device storage.
final sessionStoreProvider = Provider<SessionStore>((ref) {
  return const SecureSessionStore();
});
