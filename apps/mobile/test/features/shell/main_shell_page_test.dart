import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/shell/ui/pages/main_shell_page.dart';

void main() {
  testWidgets('main shell shows all placeholder tabs', (tester) async {
    await tester.pumpWidget(const TestShell(child: MainShellPage()));

    expect(find.text('AIM Home'), findsOneWidget);
    expect(find.text('Home'), findsWidgets);
    expect(find.text('Learn'), findsWidgets);
    expect(find.text('Review'), findsWidgets);
    expect(find.text('Progress'), findsWidgets);
    expect(find.text('Profile'), findsWidgets);

    await tester.tap(find.text('Learn').last);
    await tester.pumpAndSettle();
    expect(find.text('AIM Learn'), findsOneWidget);

    await tester.tap(find.text('Review').last);
    await tester.pumpAndSettle();
    expect(find.text('AIM Review'), findsOneWidget);

    await tester.tap(find.text('Progress').last);
    await tester.pumpAndSettle();
    expect(find.text('AIM Progress'), findsOneWidget);

    await tester.tap(find.text('Profile').last);
    await tester.pumpAndSettle();
    expect(find.text('AIM Profile'), findsOneWidget);
  });
}

class TestShell extends StatelessWidget {
  const TestShell({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(home: child);
  }
}
