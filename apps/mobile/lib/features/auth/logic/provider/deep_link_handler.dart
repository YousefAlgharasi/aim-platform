import 'dart:async';

import 'package:app_links/app_links.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/billing/logic/provider/billing_provider.dart';
import 'auth_context_provider.dart';
import 'auth_flow_provider.dart';
import 'session_store_provider.dart';

class DeepLinkHandler {
  DeepLinkHandler(this._ref);

  final Ref _ref;
  final AppLinks _appLinks = AppLinks();
  StreamSubscription<Uri>? _sub;
  bool _processing = false;
  GlobalKey<NavigatorState>? _navigatorKey;

  void init(GlobalKey<NavigatorState> navigatorKey) {
    _navigatorKey = navigatorKey;

    _appLinks.getInitialLink().then((uri) {
      if (uri != null) _handleUri(uri);
    }).catchError((_) {});

    _sub = _appLinks.uriLinkStream.listen(_handleUri);
  }

  Future<void> _handleUri(Uri uri) async {
    if (uri.scheme == 'aim' && uri.host == 'billing') {
      _ref.read(checkoutReturnSignalProvider.notifier).state++;
      return;
    }

    if (uri.scheme != 'aimapp' || uri.host != 'login-callback') return;
    if (_processing) return;
    _processing = true;

    try {
      final fragment = uri.fragment;
      if (fragment.isEmpty) return;

      final params = Uri.splitQueryString(fragment);
      final accessToken = params['access_token'];
      final refreshToken = params['refresh_token'] ?? '';
      final expiresIn = int.tryParse(params['expires_in'] ?? '') ?? 3600;

      if (accessToken == null || accessToken.isEmpty) return;

      final expiresAt =
          DateTime.now().millisecondsSinceEpoch ~/ 1000 + expiresIn;

      final didLoad = await _ref
          .read(authContextProvider.notifier)
          .syncAndLoadUser(accessToken);

      if (!didLoad) return;

      final contextState = _ref.read(authContextProvider);
      final email = switch (contextState) {
        AppAsyncSuccess<AuthContextModel>(:final data) =>
          data.user.email ?? '',
        _ => '',
      };

      await _ref.read(sessionStoreProvider).save(
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresAt: expiresAt,
            email: email,
          );

      _ref.read(authFlowProvider.notifier).signIn(
            email,
            accessToken: accessToken,
          );

      _navigatorKey?.currentState?.pushNamedAndRemoveUntil(
        AppRoutePaths.mainShell,
        (route) => false,
      );
    } finally {
      _processing = false;
    }
  }

  void dispose() {
    _sub?.cancel();
  }
}

final deepLinkHandlerProvider = Provider<DeepLinkHandler>((ref) {
  final handler = DeepLinkHandler(ref);
  ref.onDispose(handler.dispose);
  return handler;
});
