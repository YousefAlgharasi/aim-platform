import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/routing/app_router.dart';
import 'package:aim_mobile/features/auth/logic/provider/app_bootstrap_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/app_bootstrap_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';

class _NoopBootstrap extends AppBootstrapNotifier {
  _NoopBootstrap(super.ref);

  @override
  Future<void> checkSession() async {}
}

void main() {
  testWidgets('router keeps the splash while held, then moves on',
      (tester) async {
    final signedIn = AuthFlowNotifier()
      ..signIn('learner@example.com', accessToken: 'tok');
    final refresh = ValueNotifier<int>(0);
    var hold = true;

    final router = AppRouter.buildRouter(
      authState: () => signedIn.state,
      authContextState: () => null,
      refreshListenable: refresh,
      holdSplash: () => hold,
    );
    await tester.pumpWidget(ProviderScope(
      overrides: [
        appBootstrapProvider.overrideWith((ref) => _NoopBootstrap(ref)),
      ],
      child: MaterialApp.router(routerConfig: router),
    ));
    await tester.pump();

    String path() => router.routeInformationProvider.value.uri.path;
    expect(path(), AppRoutePaths.splash);

    hold = false;
    refresh.value++;
    await tester.pump();
    await tester.pump();
    expect(path(), isNot(AppRoutePaths.splash));
    // The destination page needs real providers; only routing matters here.
    tester.takeException();
  });
}
