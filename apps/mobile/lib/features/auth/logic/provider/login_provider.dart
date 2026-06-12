import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/config/app_config_provider.dart';
import 'package:aim_mobile/core/state/app_form_state.dart';
import 'package:aim_mobile/features/auth/data/datasources/supabase_auth_datasource_impl.dart';
import 'login_notifier.dart';

/// Provides [LoginNotifier] for the login screen.
///
/// The [SupabaseAuthDatasourceImpl] is created with the public Supabase URL
/// and anon key from [appConfigProvider]. These are client-safe values —
/// not secrets. Service-role keys and JWT secrets must never appear here.
final loginProvider =
    StateNotifierProvider.autoDispose<LoginNotifier, AppFormState>(
  (ref) {
    final config = ref.watch(appConfigProvider);

    return LoginNotifier(
      supabaseDatasource: SupabaseAuthDatasourceImpl(
        supabaseUrl: config.supabaseUrl,
        supabaseAnonKey: config.supabaseAnonKey,
      ),
      ref: ref,
    );
  },
);
