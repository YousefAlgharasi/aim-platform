import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/session/session.dart';

/// Provides the [SessionStore] singleton used across the auth feature.
///
/// Override this provider in tests with a [FakeSessionStore] to avoid
/// touching device storage.
final sessionStoreProvider = Provider<SessionStore>((ref) {
  return const SecureSessionStore();
});
