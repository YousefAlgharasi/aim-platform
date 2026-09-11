import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_form_state.dart';
import 'auth_context_provider.dart';
import 'login_notifier.dart';

/// Provides [LoginNotifier] for the login screen.
///
/// Login goes through [authRepositoryProvider] → the backend's
/// `POST /auth/login`. The backend is the sole auth authority — Flutter
/// never talks to Supabase (or any identity provider) directly.
final loginProvider =
    StateNotifierProvider.autoDispose<LoginNotifier, AppFormState>(
  (ref) {
    return LoginNotifier(
      repository: ref.watch(authRepositoryProvider),
      ref: ref,
    );
  },
);
