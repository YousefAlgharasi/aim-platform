// Stories: the list and the scene view must fit every phone width in English and Arabic, light and dark,
// show the right action per state (start / continue / read again / locked), and the models must parse safely.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/learner_tools/data/learner_tools_api.dart';
import 'package:aim_mobile/features/stories/ui/stories_page.dart';
import 'package:aim_mobile/features/stories/ui/widgets/story_scene_view.dart';

StorySummary _story(String id, {int answered = 0, bool locked = false, bool completed = false, String? titleAr}) => StorySummary(
      storyId: id,
      courseTitle: 'B1.1',
      cefrCode: 'B1',
      title: 'The Charity Cook-off $id',
      titleAr: titleAr,
      summary: 'The friends organise a charity cook-off and learn that plans rarely go the way you expect.',
      scenes: 7,
      questions: 21,
      answered: answered,
      minutes: 9,
      locked: locked,
      completed: completed,
    );

Widget _app(Widget home, {required Locale locale, required ThemeData theme, List<Override> overrides = const [], double scale = 1}) {
  return ProviderScope(
    key: UniqueKey(),
    overrides: overrides,
    child: MaterialApp(
      theme: theme,
      locale: locale,
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(textScaler: TextScaler.linear(scale)),
        child: child!,
      ),
      home: home,
    ),
  );
}

void main() {
  group('models', () {
    test('StorySummary reads the server fields and works out progress', () {
      final s = StorySummary.fromJson({
        'storyId': 'a', 'courseTitle': 'A1.1', 'title': 'T', 'summary': 'S', 'scenes': 5, 'questions': 10, 'answered': 4, 'minutes': 3,
      });
      expect((s.scenes, s.questions, s.answered, s.percent, s.locked, s.completed), (5, 10, 4, 40, false, false));
      expect(StorySummary.fromJson({}).percent, 0);
      expect(_story('x', answered: 99).percent, 100);
    });

    test('StoryScene drops empty lines and parses questions', () {
      final sc = StoryScene.fromJson({
        'position': 1, 'setting': 'At school',
        'lines': [
          {'speaker': 'Sarah', 'text': ' Hi! '},
          {'speaker': 'adam', 'text': '   '},
          {'speaker': 'narrator', 'text': 'The bell rang.'},
        ],
        'questions': [
          {'itemId': 'q1', 'type': 'multiple_choice', 'prompt': 'Who spoke?', 'options': [{'id': 'o1', 'text': 'Sarah'}]},
        ],
        'done': true,
      });
      expect(sc.lines.map((l) => l.speaker), ['sarah', 'narrator']);
      expect(sc.questions.single.options.single.text, 'Sarah');
      expect(sc.done, isTrue);
    });

    test('sceneAsText labels the friends and leaves the narrator plain', () {
      expect(
        sceneAsText(const [StoryLine(speaker: 'sarah', text: 'Hello'), StoryLine(speaker: 'narrator', text: 'Night fell.')]),
        'Sarah: Hello\nNight fell.',
      );
    });
  });

  testWidgets('each story shows the right action', (tester) async {
    final stories = [
      _story('1'),
      _story('2', answered: 6),
      _story('3', answered: 21, completed: true),
      _story('4', locked: true),
    ];
    await tester.pumpWidget(_app(const StoriesPage(),
        locale: const Locale('en'), theme: AppTheme.light, overrides: [storiesProvider.overrideWith((ref) async => stories)]));
    await tester.pumpAndSettle();
    tester.view.physicalSize = const Size(400, 3000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpAndSettle();
    expect(find.text('Start reading', skipOffstage: false), findsOneWidget);
    expect(find.text('Continue', skipOffstage: false), findsOneWidget);
    expect(find.text('Read again', skipOffstage: false), findsOneWidget);
    expect(find.textContaining('Unlocks when you reach B1.1', skipOffstage: false), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('an empty list shows a friendly message', (tester) async {
    await tester.pumpWidget(_app(const StoriesPage(),
        locale: const Locale('en'), theme: AppTheme.light, overrides: [storiesProvider.overrideWith((ref) async => const <StorySummary>[])]));
    await tester.pumpAndSettle();
    expect(find.text('No stories yet'), findsOneWidget);
  });

  const lines = [
    StoryLine(speaker: 'narrator', text: 'It was a bright Saturday morning at the market, and the four friends were already late.'),
    StoryLine(speaker: 'sarah', text: 'If we hurry, we can still buy the vegetables before the stalls close!'),
    StoryLine(speaker: 'adam', text: "I'm hungry. Can we taste the soup first?"),
    StoryLine(speaker: 'yasmin', text: 'Look at these posters. I designed them last night, and I think they look wonderful.'),
    StoryLine(speaker: 'tariq', text: 'Has anyone checked the budget? We have spent more than we planned.'),
  ];

  for (final size in const [Size(320, 760), Size(360, 800), Size(412, 900)]) {
    for (final dark in [false, true]) {
      for (final loc in const [Locale('en'), Locale('ar')]) {
        for (final scale in size.width <= 320 ? [1.0] : [1.0, 1.3]) {
          testWidgets('fits: ${size.width.toInt()}px ${dark ? 'dark' : 'light'} ${loc.languageCode} x$scale', (tester) async {
            tester.view.physicalSize = size;
            tester.view.devicePixelRatio = 1;
            addTearDown(tester.view.reset);

            // The list, with a story that has an Arabic title.
            await tester.pumpWidget(_app(const StoriesPage(),
                locale: loc,
                theme: dark ? AppTheme.dark : AppTheme.light,
                scale: scale,
                overrides: [
                  storiesProvider.overrideWith((ref) async => [_story('1', answered: 6, titleAr: 'مسابقة الطبخ الخيرية'), _story('2', locked: true)]),
                ]));
            await tester.pumpAndSettle();
            expect(tester.takeException(), isNull);

            // A scene.
            await tester.pumpWidget(_app(
              const Scaffold(body: SingleChildScrollView(padding: EdgeInsets.all(16), child: StorySceneView(setting: 'At the market, Saturday morning', lines: lines))),
              locale: loc, theme: dark ? AppTheme.dark : AppTheme.light, scale: scale,
            ));
            await tester.pumpAndSettle();
            expect(find.text('Sarah'), findsOneWidget);
            expect(find.textContaining('hurry'), findsOneWidget);
            expect(tester.takeException(), isNull);
          });
        }
      }
    }
  }
}
