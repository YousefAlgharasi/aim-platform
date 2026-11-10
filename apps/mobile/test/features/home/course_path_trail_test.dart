import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/home/ui/widgets/home_course_path_section.dart';

const _nodes = [
  CoursePathNode(
    kind: CoursePathNodeKind.lesson,
    id: 'l1',
    title: 'This Is My Family',
    completed: true,
    unlocked: true,
    current: false,
  ),
  CoursePathNode(
    kind: CoursePathNodeKind.lesson,
    id: 'l2',
    title: 'I Am Not / You Are Not',
    completed: false,
    unlocked: true,
    current: true,
  ),
  CoursePathNode(
    kind: CoursePathNodeKind.lesson,
    id: 'l3',
    title: 'My Family Tree and a much longer lesson title that needs two lines',
    completed: false,
    unlocked: false,
    current: false,
  ),
  CoursePathNode(
    kind: CoursePathNodeKind.quiz,
    id: 'q1',
    title: 'Quiz',
    completed: false,
    unlocked: false,
    current: false,
  ),
];

Widget _app({
  Locale locale = const Locale('en'),
  double textScale = 1.0,
  void Function(CoursePathNode)? onTap,
}) {
  return MaterialApp(
    theme: AppTheme.light,
    locale: locale,
    localizationsDelegates: AppLocale.delegates,
    supportedLocales: AppLocale.supportedLocales,
    builder: (context, child) => MediaQuery(
      data: MediaQuery.of(context).copyWith(textScaler: TextScaler.linear(textScale)),
      child: child!,
    ),
    home: Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: CoursePathTrail(
          nodes: _nodes,
          onTapNode: onTap ?? (_) {},
          quizLabel: 'Chapter quiz',
          finalExamLabel: 'Final exam',
          lockedSemantic: 'locked',
        ),
      ),
    ),
  );
}

void main() {
  testWidgets('zigzags: start side, end side, start side', (tester) async {
    tester.view.physicalSize = const Size(390, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(_app());
    await tester.pump();

    final done = tester.getCenter(find.byIcon(Icons.check_rounded)).dx;
    final current = tester.getCenter(find.byIcon(Icons.play_arrow_rounded)).dx;
    final locked = tester.getCenter(find.byIcon(Icons.lock_outline_rounded).first).dx;
    expect(current, greaterThan(done + 100), reason: 'second stop is on the other side');
    expect(locked, lessThan(current - 100), reason: 'third stop is back on the start side');
    expect((locked - done).abs(), lessThan(4));
    expect(find.text('Lesson 1'), findsOneWidget);
    expect(find.text('NEXT UP'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('titles never sit on top of a node', (tester) async {
    tester.view.physicalSize = const Size(390, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(_app());
    await tester.pump();

    final icons = [
      find.byIcon(Icons.check_rounded),
      find.byIcon(Icons.play_arrow_rounded),
      find.byIcon(Icons.lock_outline_rounded).first,
    ].map((f) => tester.getRect(f)).toList();
    for (final t in ['This Is My Family', 'I Am Not / You Are Not']) {
      final r = tester.getRect(find.text(t));
      for (final i in icons) {
        expect(r.overlaps(i), isFalse, reason: '$t overlaps a node');
      }
    }
  });

  testWidgets('mirrors in Arabic: first stop on the right', (tester) async {
    tester.view.physicalSize = const Size(390, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(_app(locale: const Locale('ar')));
    await tester.pump();

    final done = tester.getCenter(find.byIcon(Icons.check_rounded)).dx;
    final current = tester.getCenter(find.byIcon(Icons.play_arrow_rounded)).dx;
    expect(done, greaterThan(current + 100));
    expect(tester.takeException(), isNull);
  });

  testWidgets('grows with large text instead of overflowing', (tester) async {
    tester.view.physicalSize = const Size(320, 1400);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(_app(textScale: 1.6));
    await tester.pump();

    expect(tester.takeException(), isNull);
  });

  testWidgets('tapping an open stop opens it, a locked one does nothing', (tester) async {
    tester.view.physicalSize = const Size(390, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    final tapped = <String>[];
    await tester.pumpWidget(_app(onTap: (n) => tapped.add(n.id)));
    await tester.pump();

    await tester.tap(find.text('I Am Not / You Are Not'));
    await tester.tap(find.textContaining('My Family Tree'));
    expect(tapped, ['l2']);
  });
}
