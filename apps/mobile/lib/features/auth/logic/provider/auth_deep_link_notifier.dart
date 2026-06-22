import 'dart:async';

import 'package:app_links/app_links.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/state/app_async_state.dart';
import '../../auth_deep_link_constants.dart';
import '../../data/models/auth_context_model.dart';
import 'auth_context_provider.dart';
import 'auth_flow_provider.dart';
import 'session_store_provider.dart';

/// Listens for the custom-scheme redirect Supabase sends after a user taps
/// an email confirmation link, and signs the user straight into the app.
///
/// Holds the latest deep-link error message (e.g. an expired confirmation
/// link) so the UI can surface it; `null` means no pending error.
class AuthDeepLinkNotifier extends StateNotifier<String?> {
  AuthDeepLinkNotifier(this._ref) : super(null) {
    _init();
  }

  final Ref _ref;
  final _appLinks = AppLinks();
  StreamSubscription<Uri>? _subscription;

  Future<void> _init() async {
    try {
      final initialUri = await _appLinks.getInitialLink();
      if (initialUri != null) await _handleUri(initialUri);
    } catch (_) {
      // No initial link, or platform channel unavailable — ignore.
    }
    _subscription = _appLinks.uriLinkStream.listen(
      _handleUri,
      onError: (_) {},
    );
  }

  Future<void> _handleUri(Uri uri) async {
    if (uri.scheme != authDeepLinkScheme || uri.host != authDeepLinkHost) {
      return;
    }

    final params = _extractParams(uri);
    final accessToken = params['access_token'];

    if (accessToken != null && accessToken.isNotEmpty) {
      final didLoadContext =
          await _ref.read(authContextProvider.notifier).syncAndLoadUser(
                accessToken,
              );
      if (!didLoadContext) {
        final contextState = _ref.read(authContextProvider);
        state = contextState is AppAsyncFailure<AuthContextModel>
            ? contextState.message
            : 'Your confirmation link signed you in, but we could not '
                'load your account. Please try signing in again.';
        return;
      }

      final contextState = _ref.read(authContextProvider);
      final email = contextState is AppAsyncSuccess<AuthContextModel>
          ? (contextState.data.user.email ?? '')
          : '';

      await _ref.read(sessionStoreProvider).save(
            accessToken: accessToken,
            email: email,
          );
      _ref.read(authFlowProvider.notifier).signIn(
            email,
            accessToken: accessToken,
          );
      return;
    }

    final errorDescription = params['error_description'];
    if (errorDescription != null && errorDescription.isNotEmpty) {
      state = errorDescription.replaceAll('+', ' ');
    }
  }

  Map<String, String> _extractParams(Uri uri) {
    if (uri.fragment.isNotEmpty) {
      return Uri.splitQueryString(uri.fragment);
    }
    return uri.queryParameters;
  }

  void clearError() {
    state = null;
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}

final authDeepLinkProvider =
    StateNotifierProvider<AuthDeepLinkNotifier, String?>(
  (ref) => AuthDeepLinkNotifier(ref),
);
