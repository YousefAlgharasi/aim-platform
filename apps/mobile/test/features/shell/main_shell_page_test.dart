import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/core/localization/locale_provider.dart';
import 'package:aim_mobile/features/shell/ui/pages/main_shell_page.dart';

void main() {
  testWidgets('main shell shows all primary tabs via the drawer, no bottom nav bar',
      (tester) async {
    await tester.pumpWidget(const TestShell(child: MainShellPage()));

    // Navigation is drawer-only now — the bottom nav bar was removed as
    // redundant with the drawer's MENU section.
    expect(find.byType(BottomNavigationBar), findsNothing);

    Finder inDrawer(String text) => find.descendant(
          of: find.byType(Drawer),
          matching: find.text(text),
        );

    Future<void> openDrawer() async {
      await tester.tap(find.byIcon(Icons.menu));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
    }

    await openDrawer();
    expect(inDrawer('Home'), findsOneWidget);
    expect(inDrawer('Learn'), findsOneWidget);
    expect(inDrawer('Review'), findsOneWidget);
    expect(inDrawer('Progress'), findsOneWidget);
    expect(inDrawer('Profile'), findsOneWidget);

    await tester.tap(inDrawer('Learn'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    await openDrawer();
    await tester.tap(inDrawer('Review'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    await openDrawer();
    await tester.tap(inDrawer('Progress'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    await openDrawer();
    await tester.tap(inDrawer('Profile'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('No profile loaded.'), findsOneWidget);
  });

  testWidgets('drawer language toggle switches the app locale to Arabic and back',
      (tester) async {
    await tester.pumpWidget(const TestShell(child: MainShellPage()));

    await tester.tap(find.byIcon(Icons.menu));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('English'), findsOneWidget);
    expect(find.text('العربية'), findsOneWidget);

    final container = ProviderScope.containerOf(
      tester.element(find.byType(MainShellPage)),
    );

    await tester.tap(find.text('العربية'));
    await tester.pump();
    expect(container.read(localeProvider).languageCode, AppLocale.arabic);

    await tester.tap(find.text('English'));
    await tester.pump();
    expect(container.read(localeProvider).languageCode, AppLocale.english);
  });
}

class TestShell extends StatelessWidget {
  const TestShell({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    // MainShellPage's drawer closes itself via `context.pop()` and opens
    // other routes via `context.push()` — both require a GoRouter ancestor.
    return ProviderScope(
      child: MaterialApp.router(
        routerConfig: GoRouter(
          initialLocation: '/',
          routes: [
            GoRoute(path: '/', builder: (context, state) => child),
          ],
          errorBuilder: (context, state) => const SizedBox(),
        ),
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
      ),
    );
  }
}
