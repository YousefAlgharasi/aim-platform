import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_bootstrap_notifier.dart';

/// Global provider for [AppBootstrapNotifier].
///
/// Kept alive for the duration of the app (not autoDispose) so the
/// session-check result is stable after the splash screen is removed from
/// the widget tree.
final appBootstrapProvider =
    StateNotifierProvider<AppBootstrapNotifier, AppBootstrapStatus>(
  (ref) => AppBootstrapNotifier(ref),
);
