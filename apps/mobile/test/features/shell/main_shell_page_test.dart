import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/shell/ui/pages/main_shell_page.dart';

void main() {
  testWidgets('main shell shows all primary tabs', (tester) async {
    await tester.pumpWidget(const TestShell(child: MainShellPage()));

    // NOTE: TASK-15 added an AIMAppDrawer with items labelled identically to
    // the bottom nav ('Home'/'Learn'/'Review'/'Progress'/'Profile'), so
    // lookups/taps here are scoped to descendants of AIMBottomNav<int> to
    // avoid ambiguously matching the (always-mounted, off-screen-when-closed)
    // drawer's duplicate labels.
    final bottomNav = find.byType(AIMBottomNav<int>);

    Finder inNav(String text) =>
        find.descendant(of: bottomNav, matching: find.text(text));

    expect(inNav('Home'), findsOneWidget);
    expect(bottomNav, findsOneWidget);
    expect(inNav('Learn'), findsOneWidget);
    expect(inNav('Review'), findsOneWidget);
    expect(inNav('Progress'), findsOneWidget);
    expect(inNav('Profile'), findsOneWidget);

    await tester.tap(inNav('Learn'));
    await tester.pump();
    expect(inNav('Learn'), findsOneWidget);

    await tester.tap(inNav('Review'));
    await tester.pump();
    expect(inNav('Review'), findsOneWidget);

    await tester.tap(inNav('Progress'));
    await tester.pump();
    expect(inNav('Progress'), findsOneWidget);

    await tester.tap(inNav('Profile'));
    await tester.pump();
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
