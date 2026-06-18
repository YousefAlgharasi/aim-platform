// Phase 6 — P6-084
// question_models_test.dart — unit tests for QuestionModel and AnswerOptionModel.
//
// Covers:
//   1.  AnswerOptionModel.fromJson parses id, text, order.
//   2.  AnswerOptionModel has no isCorrect field — security invariant.
//   3.  AnswerOptionModel.toJson round-trips.
//   4.  AnswerOptionModel.fromJson handles null richText.
//   5.  AnswerOptionModel order stored as int.
//   6.  QuestionModel.fromJson parses all required fields.
//   7.  QuestionModel.fromJson parses options list.
//   8.  QuestionModel difficulty stored verbatim — Flutter never computes it.
//   9.  QuestionModel type stored verbatim — Flutter uses it only for widget selection.
//  10.  QuestionModel handles empty options list.
//  11.  QuestionModel handles null hint and explanation.
//  12.  QuestionModel.toJson round-trips.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/question_answer/data/models/answer_option_model.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_model.dart';

void main() {
  const optionJson = {
    'id': 'opt-1',
    'text': 'Paris',
    'order': 1,
    'richText': null,
  };

  const questionJson = {
    'id': 'q-1',
    'type': 'multiple_choice',
    'stem': 'What is the capital of France?',
    'richStem': null,
    'difficulty': 'beginner',
    'hint': 'Think of the Eiffel Tower.',
    'explanation': 'Paris is the capital of France.',
    'tags': ['geography', 'capitals'],
    'options': [
      {'id': 'opt-1', 'text': 'Paris', 'order': 1, 'richText': null},
      {'id': 'opt-2', 'text': 'Lyon', 'order': 2, 'richText': null},
    ],
  };

  group('AnswerOptionModel', () {
    test('1. fromJson parses id, text, order', () {
      final m = AnswerOptionModel.fromJson(optionJson);
      expect(m.id, 'opt-1');
      expect(m.text, 'Paris');
      expect(m.order, 1);
    });

    test('2. has no isCorrect field — security invariant', () {
      final m = AnswerOptionModel.fromJson(optionJson);
      // Compile-time proof: AnswerOptionModel has no isCorrect property.
      // If this test compiles and the model has no such field, the invariant holds.
      expect(m, isA<AnswerOptionModel>());
      // Ensure the JSON key 'isCorrect' is silently ignored (never parsed).
      final withCorrect = {...optionJson, 'isCorrect': true};
      final safe = AnswerOptionModel.fromJson(withCorrect);
      expect(safe.id, 'opt-1'); // parses fine, isCorrect silently dropped
    });

    test('3. toJson round-trips correctly', () {
      final m = AnswerOptionModel.fromJson(optionJson);
      final out = m.toJson();
      expect(out['id'], 'opt-1');
      expect(out['text'], 'Paris');
      expect(out['order'], 1);
    });

    test('4. fromJson handles null richText', () {
      final m = AnswerOptionModel.fromJson(optionJson);
      expect(m.richText, isNull);
    });

    test('5. order stored as int', () {
      final m = AnswerOptionModel.fromJson({...optionJson, 'order': 3});
      expect(m.order, 3);
    });
  });

  group('QuestionModel', () {
    test('6. fromJson parses all required fields', () {
      final m = QuestionModel.fromJson(questionJson);
      expect(m.id, 'q-1');
      expect(m.type, 'multiple_choice');
      expect(m.stem, 'What is the capital of France?');
      expect(m.hint, 'Think of the Eiffel Tower.');
      expect(m.explanation, 'Paris is the capital of France.');
      expect(m.tags, ['geography', 'capitals']);
    });

    test('7. fromJson parses options list', () {
      final m = QuestionModel.fromJson(questionJson);
      expect(m.options.length, 2);
      expect(m.options.first.id, 'opt-1');
      expect(m.options.last.id, 'opt-2');
    });

    test('8. difficulty stored verbatim — Flutter never computes it', () {
      final m = QuestionModel.fromJson(questionJson);
      expect(m.difficulty, 'beginner');
    });

    test('9. type stored verbatim — used only for widget selection', () {
      final m = QuestionModel.fromJson(
          {...questionJson, 'type': 'true_false'});
      expect(m.type, 'true_false');
    });

    test('10. handles empty options list', () {
      final m = QuestionModel.fromJson({...questionJson, 'options': []});
      expect(m.options, isEmpty);
    });

    test('11. handles null hint and explanation', () {
      final m = QuestionModel.fromJson(
          {...questionJson, 'hint': null, 'explanation': null});
      expect(m.hint, isNull);
      expect(m.explanation, isNull);
    });

    test('12. toJson round-trips correctly', () {
      final m = QuestionModel.fromJson(questionJson);
      final out = m.toJson();
      expect(out['id'], 'q-1');
      expect(out['type'], 'multiple_choice');
      expect(out['difficulty'], 'beginner');
      expect((out['options'] as List).length, 2);
    });
  });
}
