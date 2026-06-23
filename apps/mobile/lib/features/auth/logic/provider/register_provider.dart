import 'package:aim_mobile/core/state/app_form_state.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_context_provider.dart';
import 'register_notifier.dart';

/// Provides [RegisterNotifier] for the registration screen.
///
/// Registration goes through [authRepositoryProvider] → the backend's
/// `POST /auth/register`. The backend is the sole auth authority.
final registerProvider =
    StateNotifierProvider.autoDispose<RegisterNotifier, AppFormState>(
  (ref) {
    return RegisterNotifier(
      repository: ref.watch(authRepositoryProvider),
      ref: ref,
    );
  },
);
