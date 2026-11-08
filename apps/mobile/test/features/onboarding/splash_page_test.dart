import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/auth/logic/provider/app_bootstrap_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/app_bootstrap_provider.dart';
import 'package:aim_mobile/features/onboarding/ui/pages/splash_page.dart';
import 'package:aim_mobile/features/onboarding/ui/widgets/splash_stages.dart';

/// Bootstrap that never touches storage or network.
class _NoopBootstrap extends AppBootstrapNotifier {
  _NoopBootstrap(super.ref);

  @override
  Future<void> checkSession() async {}
}

Widget _app({bool reduceMotion = false}) {
  return ProviderScope(
    overrides: [
      appBootstrapProvider.overrideWith((ref) => _NoopBootstrap(ref)),
    ],
    child: MaterialApp(
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(disableAnimations: reduceMotion),
        child: child!,
      ),
      home: const SplashPage(),
    ),
  );
}

double _opacityOf<T extends Widget>(WidgetTester tester) {
  final fade = tester.widget<FadeTransition>(
    find
        .ancestor(of: find.byType(T), matching: find.byType(FadeTransition))
        .first,
  );
  return fade.opacity.value;
}

void main() {
  testWidgets('shows stage one first, then cross-fades to stage two',
      (tester) async {
    await tester.binding.setSurfaceSize(const Size(412, 915));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_app());
    // Let the (real-IO) logo precache finish; the animation starts after it.
    await tester.runAsync(
        () => Future<void>.delayed(const Duration(milliseconds: 300)));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(_opacityOf<SplashStageTwo>(tester), 0.0);

    await tester.pump(const Duration(milliseconds: 1000));
    expect(_opacityOf<SplashStageTwo>(tester), 1.0);

    await tester.pump(const Duration(milliseconds: 500));
    expect(tester.takeException(), isNull);
  });

  testWidgets('reduced motion keeps the static first stage', (tester) async {
    await tester.binding.setSurfaceSize(const Size(412, 915));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_app(reduceMotion: true));
    await tester.runAsync(
        () => Future<void>.delayed(const Duration(milliseconds: 300)));
    await tester.pump(const Duration(seconds: 2));
    expect(_opacityOf<SplashStageTwo>(tester), 0.0);
  });

  testWidgets('disposes cleanly when navigated away mid-animation',
      (tester) async {
    await tester.pumpWidget(_app());
    await tester.runAsync(
        () => Future<void>.delayed(const Duration(milliseconds: 300)));
    await tester.pump(const Duration(milliseconds: 700));
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump();
    expect(tester.takeException(), isNull);
  });
}
