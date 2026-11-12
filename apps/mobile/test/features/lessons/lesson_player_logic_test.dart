// Pure logic of the lesson player: dialogue parsing, casting, presenter choice and the card list.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_asset.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_explanation.dart';
import 'package:aim_mobile/features/lessons/ui/player/lesson_dialogue.dart';
import 'package:aim_mobile/features/lessons/ui/player/lesson_slides.dart';
import 'package:aim_mobile/features/lessons/ui/player/student_characters.dart';

LessonAsset _asset(String id, String type, {String? description, String title = 'T'}) =>
    LessonAssetModel.fromJson({
      'id': id,
      'lessonId': 'l',
      'type': type,
      'title': title,
      'description': description,
      'order': 1,
      'status': 'published',
      'createdAt': '',
      'updatedAt': '',
    });

List<LessonSlide> _slides({
  String description = '',
  LessonExplanation? explanation,
  List<LessonAsset> assets = const [],
}) =>
    buildLessonSlides(
      description: description,
      explanation: explanation,
      assets: assets,
      keyPointsLabel: 'Key points',
      recapLabel: 'Recap',
      mistakesLabel: 'Common mistakes',
    );

void main() {
  group('parseDialogue', () {
    test('splits a two-person conversation into lines', () {
      final lines = parseDialogue(
          'Man: Hello! My name is Tom. Woman: Hi Tom, I am Lucy. Nice to meet you. Man: Nice to meet you too, Lucy.');
      expect(lines, const [
        DialogueLine(speaker: 'Man', text: 'Hello! My name is Tom.'),
        DialogueLine(speaker: 'Woman', text: 'Hi Tom, I am Lucy. Nice to meet you.'),
        DialogueLine(speaker: 'Man', text: 'Nice to meet you too, Lucy.'),
      ]);
    });

    test('reads role names and Speaker A / B debates', () {
      expect(parseDialogue('Waiter: Are you ready to order? Patient: Yes, please.')
          ?.map((l) => l.speaker), ['Waiter', 'Patient']);
      expect(parseDialogue('Speaker A: I think so. Speaker B: I disagree.')
          ?.map((l) => l.speaker), ['Speaker A', 'Speaker B']);
    });

    test('is not a dialogue without a leading speaker or with one voice', () {
      expect(parseDialogue('Listen carefully. Pat. Bat. Now: Fan. Van.'), isNull);
      expect(parseDialogue('Man: Hello. Man: Hello again.'), isNull);
      expect(parseDialogue('Zero. One. Two.'), isNull);
      expect(parseDialogue(''), isNull);
      expect(parseDialogue(null), isNull);
    });
  });

  group('casting', () {
    test('hashSeed gives the same numbers as the student web app', () {
      expect(hashSeed('lesson-1'), 1644335791);
      expect(hashSeed('abc'), 440920331);
      expect(hashSeed('au1'), 3965941534);
      expect(hashSeed('lesson-a'), 302126271);
      expect(hashSeed(''), 2166136261);
    });

    test('matches the gender in the label and never reuses a character', () {
      final cast = assignCharacters(['Boy', 'Girl'], 'lesson-1');
      expect(cast[0].gender, CharacterGender.male);
      expect(cast[1].gender, CharacterGender.female);
      expect(cast.map((c) => c.id).toSet().length, 2);
    });

    test('two men get two different men; four speakers get four characters', () {
      final two = assignCharacters(['Man', 'Boy'], 'x');
      expect(two.map((c) => c.gender), [CharacterGender.male, CharacterGender.male]);
      expect(two[0].id, isNot(two[1].id));
      final four = assignCharacters(['Man', 'Woman', 'Boy', 'Girl'], 'q');
      expect(four.map((c) => c.id).toSet().length, 4);
    });

    test('neutral roles are mixed and stable for the same lesson', () {
      final a = assignCharacters(['Doctor', 'Patient'], 'abc');
      final b = assignCharacters(['Doctor', 'Patient'], 'abc');
      expect(a.map((c) => c.id), b.map((c) => c.id));
      expect(a[0].gender, isNot(a[1].gender));
    });

    test('a lesson always gets the same presenter, and all four students get a turn', () {
      expect(pickPresenter('lesson-1').id, pickPresenter('lesson-1').id);
      final ids = {for (var i = 0; i < 40; i++) pickPresenter('lesson-$i').id};
      expect(ids.length, 4);
    });
  });

  group('buildLessonSlides', () {
    test('turns a written explanation into cards, then lists every step', () {
      final slides = _slides(
        description: 'd',
        explanation: const LessonExplanation(
          overview: 'Overview',
          sections: [
            LessonExplanationSection(
              heading: 'Form',
              body: 'Use am.',
              examples: [LessonExplanationExample(text: 'I am happy.')],
            ),
            LessonExplanationSection(heading: 'Empty', body: ' '),
          ],
          keyPoints: ['One'],
          commonMistakes: [
            LessonExplanationMistake(wrong: 'I am agree', right: 'I agree', why: 'Agree is a verb.'),
          ],
          recap: 'Done.',
        ),
        assets: [_asset('au', 'audio'), _asset('tx', 'text', description: 'text step')],
      );
      expect(slides.map((s) => s.runtimeType.toString()), [
        'IntroSlide', 'SaySlide', 'SaySlide', 'PointsSlide', 'MistakesSlide', 'SaySlide',
        'AssetSlide', 'AssetSlide', 'FinishSlide',
      ]);
      expect((slides[2] as SaySlide).title, 'Form');
      expect((slides[2] as SaySlide).examples.single.text, 'I am happy.');
    });

    test('without an explanation: description first, text steps talk, other steps keep their order', () {
      final slides = _slides(
        description: 'About going to.',
        assets: [
          _asset('1', 'text', title: 'Going To', description: 'I am going to travel.'),
          _asset('2', 'audio'),
          _asset('3', 'text', description: ''),
          _asset('4', 'exercise'),
        ],
      );
      expect(slides.map((s) => s.runtimeType.toString()), [
        'IntroSlide', 'SaySlide', 'SaySlide', 'AssetSlide', 'AssetSlide', 'FinishSlide',
      ]);
      expect((slides[2] as SaySlide).title, 'Going To');
    });

    test('a lesson with nothing in it is just intro and finish', () {
      expect(_slides().map((s) => s.runtimeType.toString()), ['IntroSlide', 'FinishSlide']);
    });
  });
}
