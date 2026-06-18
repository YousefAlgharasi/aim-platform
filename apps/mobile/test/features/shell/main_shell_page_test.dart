import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/shell/ui/pages/main_shell_page.dart';

void main() {
  testWidgets('main shell shows all primary tabs', (tester) async {
    await tester.pumpWidget(const TestShell(child: MainShellPage()));

    expect(find.text('Home'), findsWidgets);
    expect(find.byType(AIMBottomNav<int>), findsOneWidget);
    expect(find.text('Learn'), findsWidgets);
    expect(find.text('Review'), findsWidgets);
    expect(find.text('Progress'), findsWidgets);
    expect(find.text('Profile'), findsWidgets);

    await tester.tap(find.text('Learn').last);
    await tester.pumpAndSettle();
    expect(find.text('Learn'), findsWidgets);

    await tester.tap(find.text('Review').last);
    await tester.pumpAndSettle();
    expect(find.text('Review'), findsWidgets);

    await tester.tap(find.text('Progress').last);
    await tester.pumpAndSettle();
    expect(find.text('Progress'), findsWidgets);

    await tester.tap(find.text('Profile').last);
    await tester.pumpAndSettle();
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
