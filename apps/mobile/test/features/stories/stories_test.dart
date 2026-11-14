// Stories: the list and the scene view must fit every phone width in English and Arabic, light and dark,
// show the right action per state (start / continue / read again / locked), and the models must parse safely.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/learner_tools/data/learner_tools_api.dart';
import 'package:aim_mobile/features/stories/ui/widgets/story_widgets.dart';
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

StoryPart _part(int i, {bool unlocked = false, bool done = false}) =>
    StoryPart(index: i, chapterId: 'c$i', scenes: 1, questions: 2, answered: done ? 2 : 0, unlocked: unlocked, done: done);

CourseStory _course(List<StoryPart> parts, {int read = 0}) =>
    CourseStory(summary: _story('1', titleAr: 'مسابقة الطبخ الخيرية'), parts: parts, partsRead: read);

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

  group('story parts', () {
    test('CourseStory.next is the first unlocked part that is not finished', () {
      final c = _course([_part(0, unlocked: true, done: true), _part(1, unlocked: true), _part(2)], read: 1);
      expect(c.next?.index, 1);
      expect(_course([_part(0), _part(1)]).next, isNull);
      expect(_course([_part(0, unlocked: true, done: true)], read: 1).next, isNull);
    });

    test('StoryPart / ChapterStory parse the server fields', () {
      final cs = ChapterStory.fromJson({
        'storyId': 's1', 'title': 'The First Day', 'courseId': 'co1',
        'part': {'index': 2, 'chapterId': 'ch3', 'scenes': 2, 'questions': 4, 'answered': 1, 'unlocked': true, 'done': false},
      });
      expect((cs.storyId, cs.part.index, cs.part.unlocked, cs.part.done, cs.part.questions), ('s1', 2, true, false, 4));
      expect(StoryPart.fromJson({}).unlocked, isFalse);
    });

    test('a part opens its own route', () {
      expect(storyPartRoute('abc', 2), '/stories/read?id=abc&part=2');
    });
  });

  testWidgets('the course card offers the next part, or says what unlocks it', (tester) async {
    await tester.pumpWidget(_app(Scaffold(body: CourseStoryCard(story: _course([_part(0, unlocked: true), _part(1)]))), locale: const Locale('en'), theme: AppTheme.light));
    await tester.pumpAndSettle();
    expect(find.text('Start the story'), findsOneWidget);
    expect(find.text('0 of 2 parts read'), findsOneWidget);

    await tester.pumpWidget(_app(Scaffold(body: CourseStoryCard(story: _course([_part(0), _part(1)]))), locale: const Locale('en'), theme: AppTheme.light));
    await tester.pumpAndSettle();
    expect(find.textContaining('Finish a chapter to unlock the next part'), findsOneWidget);
    expect(find.text('Start the story'), findsNothing);

    await tester.pumpWidget(_app(Scaffold(body: CourseStoryCard(story: _course([_part(0, unlocked: true, done: true)], read: 1))), locale: const Locale('en'), theme: AppTheme.light));
    await tester.pumpAndSettle();
    expect(find.text('Read again'), findsOneWidget);
  });

  testWidgets('the chapter tile shows locked, ready and finished', (tester) async {
    ChapterStory cs(StoryPart p) => ChapterStory(storyId: 's', title: 'The First Day', part: p);
    for (final (part, expected) in [(_part(0), 'Story part 1'), (_part(1, unlocked: true), 'Story part 2'), (_part(2, unlocked: true, done: true), 'Story part 3')]) {
      await tester.pumpWidget(_app(Scaffold(body: StoryPartTile(story: cs(part))), locale: const Locale('en'), theme: AppTheme.light));
      await tester.pumpAndSettle();
      expect(find.text(expected), findsOneWidget);
    }
    await tester.pumpWidget(_app(Scaffold(body: StoryPartTile(story: cs(_part(0)))), locale: const Locale('en'), theme: AppTheme.light));
    await tester.pumpAndSettle();
    expect(find.textContaining("Finish this chapter's lessons to unlock"), findsOneWidget);
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

            // The course card and a chapter tile, with a story that has an Arabic title.
            await tester.pumpWidget(_app(
              Scaffold(body: ListView(padding: const EdgeInsets.all(16), children: [
                CourseStoryCard(story: _course([_part(0, unlocked: true, done: true), _part(1, unlocked: true), _part(2)], read: 1)),
                const SizedBox(height: 12),
                StoryPartTile(story: ChapterStory(storyId: 's', title: 'The Charity Cook-off', titleAr: 'مسابقة الطبخ الخيرية', part: _part(1, unlocked: true))),
                const SizedBox(height: 12),
                StoryPartTile(story: ChapterStory(storyId: 's', title: 'The Charity Cook-off', titleAr: 'مسابقة الطبخ الخيرية', part: _part(2))),
              ])),
              locale: loc, theme: dark ? AppTheme.dark : AppTheme.light, scale: scale,
            ));
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
