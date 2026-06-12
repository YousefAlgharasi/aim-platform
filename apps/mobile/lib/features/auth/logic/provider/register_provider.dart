import 'package:aim_mobile/core/config/app_config_provider.dart';
import 'package:aim_mobile/core/state/app_form_state.dart';
import 'package:aim_mobile/features/auth/data/datasources/supabase_auth_datasource_impl.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';


import 'register_notifier.dart';

/// Provides [RegisterNotifier] for the registration screen.
///
/// [SupabaseAuthDatasourceImpl] uses the public Supabase URL and anon key
/// from [appConfigProvider]. These are client-safe values — not secrets.
final registerProvider =
    StateNotifierProvider.autoDispose<RegisterNotifier, AppFormState>(
  (ref) {
    final config = ref.watch(appConfigProvider);

    return RegisterNotifier(
      supabaseDatasource: SupabaseAuthDatasourceImpl(
        supabaseUrl: config.supabaseUrl,
        supabaseAnonKey: config.supabaseAnonKey,
      ),
      ref: ref,
    );
  },
);
