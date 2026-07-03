import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_flow_state.dart';

void main() {
  testWidgets('routes signed-out users away from protected app areas',
      (tester) async {
    final router = AppRouter.buildRouter(
      initialLocation: AppRoutePaths.mainShell,
      authState: () => const AuthFlowState.signedOut(),
      authContextState: () => null,
    );

    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp.router(routerConfig: router),
      ),
    );

    await tester.pump();

    expect(find.text('Sign In'), findsWidgets);
    expect(find.text('Welcome back'), findsOneWidget);
  });
}
