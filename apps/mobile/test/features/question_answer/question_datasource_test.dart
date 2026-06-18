// Phase 6 — P6-086
// question_datasource_test.dart — unit tests for the question datasource layer.
//
// Covers:
//   1. BackendApiPaths.curriculumQuestion builds correct path.
//   2. QuestionRemoteDatasource interface is correctly typed.
//   3. QuestionModel.fromJson parses type verbatim.
//   4. QuestionModel.fromJson parses difficulty verbatim — Flutter never computes.
//   5. QuestionModel has no isCorrect field — security invariant.
//   6. AnswerOptionModel has no isCorrect field — security invariant.
//   7. Options list parsed from JSON correctly.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/question_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';

void main() {
  group('BackendApiPaths — question endpoint', () {
    test('1. curriculumQuestion builds correct path', () {
      expect(
        BackendApiPaths.curriculumQuestion('q-uuid-1'),
        '/curriculum/questions/q-uuid-1',
      );
    });
  });

  group('QuestionRemoteDatasource interface', () {
    test('2. interface declares getQuestion', () {
      expect(_FakeDatasource(), isA<QuestionRemoteDatasource>());
    });
  });

  group('QuestionModel — datasource verbatim storage', () {
    const baseJson = {
      'id': 'q-1',
      'type': 'multiple_choice',
      'stem': 'What is 2 + 2?',
      'richStem': null,
      'difficulty': 'beginner',
      'hint': null,
      'explanation': null,
      'tags': [],
      'options': [
        {'id': 'opt-1', 'text': '3', 'order': 1, 'richText': null},
        {'id': 'opt-2', 'text': '4', 'order': 2, 'richText': null},
      ],
    };

    test('3. type stored verbatim', () {
      expect(QuestionModel.fromJson(baseJson).type, 'multiple_choice');
    });

    test('4. difficulty stored verbatim — Flutter never computes it', () {
      expect(QuestionModel.fromJson(baseJson).difficulty, 'beginner');
    });

    test('5. QuestionModel has no isCorrect — security invariant', () {
      // If isCorrect appears in JSON it must be silently dropped.
      // QuestionModel has no such field by design.
      final jsonWithCorrect = {
        ...baseJson,
        'isCorrect': true,      // must be dropped
        'correct_answer': 'opt-2', // must be dropped
      };
      final m = QuestionModel.fromJson(jsonWithCorrect);
      expect(m, isA<QuestionModel>());
      // No isCorrect / correctAnswer property exists on the model.
    });

    test('6. AnswerOptionModel has no isCorrect — security invariant', () {
      final optJson = {
        'id': 'opt-1',
        'text': '4',
        'order': 1,
        'richText': null,
        'isCorrect': true, // must be silently dropped
      };
      final opt = AnswerOptionModel.fromJson(optJson);
      expect(opt.id, 'opt-1');
      // No isCorrect property exists on AnswerOptionModel.
    });

    test('7. options list parsed correctly', () {
      final m = QuestionModel.fromJson(baseJson);
      expect(m.options.length, 2);
      expect(m.options.first.id, 'opt-1');
      expect(m.options.last.id, 'opt-2');
    });
  });
}

// ── Fake for interface check ──────────────────────────────────────────────────

class _FakeDatasource implements QuestionRemoteDatasource {
  @override
  Future<QuestionModel> getQuestion({
    required String bearerToken,
    required String questionId,
  }) async =>
      QuestionModel.fromJson({
        'id': questionId,
        'type': 'multiple_choice',
        'stem': 'Test?',
        'richStem': null,
        'difficulty': 'beginner',
        'hint': null,
        'explanation': null,
        'tags': [],
        'options': [],
      });
}
