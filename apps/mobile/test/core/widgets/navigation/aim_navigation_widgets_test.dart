import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';

void main() {
  testWidgets('AIMTopAppBar supports RTL back arrow and transparent mode',
      (tester) async {
    var backs = 0;

    await tester.pumpAimWidget(
      AIMTopAppBar(
        title: 'Speaking Practice',
        centerTitle: true,
        transparent: true,
        onBack: () => backs += 1,
        actions: const [
          AIMIconButton(
            semanticLabel: 'Settings',
            icon: Icon(Icons.settings_outlined),
          ),
        ],
      ),
      textDirection: TextDirection.rtl,
    );

    expect(find.text('Speaking Practice'), findsOneWidget);
    expect(find.byIcon(Icons.chevron_right_rounded), findsOneWidget);
    expect(find.bySemanticsLabel('Settings'), findsOneWidget);
    expect(_appBarDecoration(tester).color, Colors.transparent);

    await tester.tap(find.bySemanticsLabel('Back'));
    expect(backs, 1);
  });

  testWidgets(
      'AIMBottomNav supports selected state, active icon, badge, safe area',
      (tester) async {
    var selected = 0;

    await tester.pumpAimWidget(
      AIMBottomNav<int>(
        value: selected,
        onChanged: (value) => selected = value,
        items: const [
          AIMBottomNavDestination(
            value: 0,
            label: 'Home',
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
          ),
          AIMBottomNavDestination(
            value: 1,
            label: 'Learn',
            icon: Icon(Icons.menu_book_outlined),
            activeIcon: Icon(Icons.menu_book),
          ),
          AIMBottomNavDestination(
            value: 2,
            label: 'Review',
            icon: Icon(Icons.replay_outlined),
            activeIcon: Icon(Icons.replay),
            badge: '2',
          ),
        ],
      ),
      mediaQueryData: const MediaQueryData(
        padding: EdgeInsets.only(bottom: 20),
      ),
    );

    expect(find.byIcon(Icons.home), findsOneWidget);
    expect(find.text('2'), findsOneWidget);
    expect(tester.getSize(find.byType(AIMBottomNav<int>)).height,
        AimSizes.bottomNavHeight + 20);

    await tester.tap(find.text('Learn'));
    expect(selected, 1);
  });

  testWidgets('AIMBottomNav uses dark theme surface colors', (tester) async {
    await tester.pumpAimWidget(
      AIMBottomNav<String>(
        value: 'home',
        items: const [
          AIMBottomNavDestination(
            value: 'home',
            label: 'Home',
            icon: Icon(Icons.home_outlined),
          ),
          AIMBottomNavDestination(
            value: 'learn',
            label: 'Learn',
            icon: Icon(Icons.menu_book_outlined),
          ),
          AIMBottomNavDestination(
            value: 'profile',
            label: 'Profile',
            icon: Icon(Icons.person_outline),
          ),
        ],
      ),
      theme: AppTheme.dark,
    );

    expect(_bottomNavDecoration(tester).color, AimColorTheme.dark.surface);
  });

  testWidgets('AIMTabs supports value, icons, counts, and animated indicator',
      (tester) async {
    var selected = 'lessons';

    await tester.pumpAimWidget(
      AIMTabs<String>(
        value: selected,
        onChanged: (value) => selected = value,
        items: const [
          AIMTabItem(
            value: 'lessons',
            label: 'Lessons',
            icon: Icon(Icons.menu_book_outlined),
          ),
          AIMTabItem(
            value: 'progress',
            label: 'Progress',
            count: 3,
          ),
          AIMTabItem(
            value: 'review',
            label: 'Review',
          ),
        ],
      ),
    );

    expect(find.byIcon(Icons.menu_book_outlined), findsOneWidget);
    expect(find.text('3'), findsOneWidget);
    expect(find.byType(AnimatedPositionedDirectional), findsOneWidget);

    await tester.tap(find.text('Progress'));
    expect(selected, 'progress');
  });

  testWidgets(
      'AIMSegmentedControl supports icons, full width, and animated thumb',
      (tester) async {
    var selected = 'weekly';

    await tester.pumpAimWidget(
      SizedBox(
        width: 360,
        child: AIMSegmentedControl<String>(
          fullWidth: true,
          value: selected,
          onChanged: (value) => selected = value,
          items: const [
            AIMSegmentedOption(
              value: 'daily',
              label: 'Daily',
              icon: Icon(Icons.today_outlined),
            ),
            AIMSegmentedOption(
              value: 'weekly',
              label: 'Weekly',
            ),
            AIMSegmentedOption(
              value: 'monthly',
              label: 'Monthly',
            ),
          ],
        ),
      ),
    );

    expect(tester.getSize(find.byType(AIMSegmentedControl<String>)).width, 360);
    expect(find.byIcon(Icons.today_outlined), findsOneWidget);
    expect(find.byType(AnimatedPositionedDirectional), findsOneWidget);

    await tester.tap(find.text('Monthly'));
    expect(selected, 'monthly');
  });
}

extension on WidgetTester {
  Future<void> pumpAimWidget(
    Widget child, {
    TextDirection textDirection = TextDirection.ltr,
    ThemeData? theme,
    MediaQueryData? mediaQueryData,
  }) {
    return pumpWidget(
      MaterialApp(
        theme: theme ?? AppTheme.light,
        home: MediaQuery(
          data: mediaQueryData ?? const MediaQueryData(),
          child: Directionality(
            textDirection: textDirection,
            child: Scaffold(body: Center(child: child)),
          ),
        ),
      ),
    );
  }
}

BoxDecoration _appBarDecoration(WidgetTester tester) {
  final decoratedBox = tester.widget<DecoratedBox>(
    find
        .descendant(
          of: find.byType(AIMTopAppBar),
          matching: find.byType(DecoratedBox),
        )
        .first,
  );

  return decoratedBox.decoration as BoxDecoration;
}

BoxDecoration _bottomNavDecoration(WidgetTester tester) {
  final decoratedBox = tester.widget<DecoratedBox>(
    find
        .descendant(
          of: find.byType(AIMBottomNav<String>),
          matching: find.byType(DecoratedBox),
        )
        .first,
  );

  return decoratedBox.decoration as BoxDecoration;
}
