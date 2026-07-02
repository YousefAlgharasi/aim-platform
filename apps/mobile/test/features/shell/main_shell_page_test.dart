import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/shell/ui/pages/main_shell_page.dart';

void main() {
  testWidgets('main shell shows all primary tabs via the drawer',
      (tester) async {
    await tester.pumpWidget(const TestShell(child: MainShellPage()));

    // No bottom tab bar (removed per product direction) — navigation is
    // exclusively via the AIMAppDrawer opened from the FAB.
    Future<void> openDrawer() async {
      await tester.tap(find.byIcon(Icons.menu));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
    }

    await openDrawer();
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Learn'), findsOneWidget);
    expect(find.text('Review'), findsOneWidget);
    expect(find.text('Progress'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);

    await tester.tap(find.text('Learn'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    await openDrawer();
    await tester.tap(find.text('Review'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    await openDrawer();
    await tester.tap(find.text('Progress'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    await openDrawer();
    await tester.tap(find.text('Profile'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('No profile loaded.'), findsOneWidget);
  });
}

class TestShell extends StatelessWidget {
  const TestShell({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ProviderScope(
      child: MaterialApp(home: child),
    );
  }
}
