// Phase 4 — P4-071
// Placement model unit tests.
//
// Updated — P6-056: PlacementQuestionModel coverage rewritten to match the
// P6-048 model shape (id/section_id/text/options/type/media_url/ordinal).
// The previous version tested a stale shape (question_type/prompt/
// order_index/skill_code) that no longer exists on the model.
//
// Scope: Placement Test phase only.
//
// Coverage:
//   - PlacementTestModel.fromJson: parses all student-safe fields correctly
//   - PlacementSectionModel.fromJson: parses section fields including order_index
//   - PlacementQuestionModel.fromJson: parses question fields; media_url nullable
//   - PlacementAnswerModel.fromJson: parses answer submission response
//   - PlacementResultModel.fromJson: parses estimatedLevel, skillMasteryMap,
//     weakness_map, initialPathId
//
// Security rules verified by these tests:
//   - correct_answer is never a field on any model
//   - is_correct is never a field on any model
//   - signal is sourced from backend JSON — never computed locally
//   - overallScore is never returned to Flutter

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/placement/data/models/placement_test_model.dart';
import 'package:aim_mobile/features/placement/data/models/placement_section_model.dart';
import 'package:aim_mobile/features/placement/data/models/placement_question_model.dart';
import 'package:aim_mobile/features/placement/data/models/placement_answer_model.dart';
import 'package:aim_mobile/features/placement/data/models/placement_result_model.dart';

void main() {
  // -------------------------------------------------------------------------
  // PlacementTestModel
  // -------------------------------------------------------------------------

  group('PlacementTestModel', () {
    const validJson = {
      'id': 'test-uuid-001',
      'title': 'AIM Placement Test',
      'status': 'published',
      'total_sections': 3,
      'estimated_minutes': 20,
    };

    test('fromJson parses all student-safe fields', () {
      final model = PlacementTestModel.fromJson(validJson);

      expect(model.id, 'test-uuid-001');
      expect(model.title, 'AIM Placement Test');
      expect(model.status, 'published');
      expect(model.totalSections, 3);
      expect(model.estimatedMinutes, 20);
    });

    test('toJson round-trips correctly', () {
      final model = PlacementTestModel.fromJson(validJson);
      final json = model.toJson();

      expect(json['id'], 'test-uuid-001');
      expect(json['total_sections'], 3);
      expect(json['estimated_minutes'], 20);
    });

    test('does not contain version or published_at (internal fields)', () {
      final model = PlacementTestModel.fromJson(validJson);
      final json = model.toJson();

      expect(json.containsKey('version'), isFalse);
      expect(json.containsKey('published_at'), isFalse);
    });
  });

  // -------------------------------------------------------------------------
  // PlacementSectionModel
  // -------------------------------------------------------------------------

  group('PlacementSectionModel', () {
    const validJson = {
      'id': 'section-uuid-001',
      'title': 'Grammar',
      'skill_code': 'grammar',
      'order_index': 1,
      'total_questions': 10,
    };

    test('fromJson parses all student-safe fields', () {
      final model = PlacementSectionModel.fromJson(validJson);

      expect(model.id, 'section-uuid-001');
      expect(model.title, 'Grammar');
      expect(model.skillCode, 'grammar');
      expect(model.orderIndex, 1);
      expect(model.totalQuestions, 10);
    });

    test('toJson uses snake_case keys matching backend contract', () {
      final model = PlacementSectionModel.fromJson(validJson);
      final json = model.toJson();

      expect(json['skill_code'], 'grammar');
      expect(json['order_index'], 1);
      expect(json['total_questions'], 10);
    });

    test('does not contain placement_test_id (internal FK)', () {
      final model = PlacementSectionModel.fromJson(validJson);
      final json = model.toJson();

      expect(json.containsKey('placement_test_id'), isFalse);
    });
  });

  // -------------------------------------------------------------------------
  // PlacementQuestionModel
  // -------------------------------------------------------------------------

  group('PlacementQuestionModel', () {
    const validJson = {
      'id': 'question-uuid-001',
      'section_id': 'section-uuid-001',
      'text': 'Choose the correct form of the verb.',
      'options': [
        {'id': 'A', 'text': 'go'},
        {'id': 'B', 'text': 'goes'},
        {'id': 'C', 'text': 'going'},
        {'id': 'D', 'text': 'gone'},
      ],
      'type': 'multiple_choice',
      'media_url': null,
      'ordinal': 1,
    };

    const listeningJson = {
      'id': 'question-uuid-002',
      'section_id': 'section-uuid-001',
      'text': '[Audio: instruction] What does the speaker want?',
      'options': [
        {'id': 'A', 'text': 'A coffee'},
        {'id': 'B', 'text': 'A tea'},
      ],
      'type': 'listening_choice',
      'media_url': 'audio/placement/listen-q1-instruction.mp3',
      'ordinal': 1,
    };

    test('fromJson parses all student-safe fields', () {
      final model = PlacementQuestionModel.fromJson(validJson);

      expect(model.id, 'question-uuid-001');
      expect(model.sectionId, 'section-uuid-001');
      expect(model.text, 'Choose the correct form of the verb.');
      expect(model.type, 'multiple_choice');
      expect(model.mediaUrl, isNull);
      expect(model.ordinal, 1);
      expect(model.options, hasLength(4));
      expect(model.options.first.id, 'A');
      expect(model.options.first.text, 'go');
    });

    test('fromJson parses listening question with media_url', () {
      final model = PlacementQuestionModel.fromJson(listeningJson);

      expect(model.type, 'listening_choice');
      expect(model.mediaUrl, 'audio/placement/listen-q1-instruction.mp3');
      expect(model.options, hasLength(2));
    });

    test('media_url is nullable — not required for non-listening types', () {
      final model = PlacementQuestionModel.fromJson(validJson);
      expect(model.mediaUrl, isNull);
    });

    test('does not contain correct_answer — security rule P4-011 §4', () {
      final model = PlacementQuestionModel.fromJson(validJson);
      final json = model.toJson();

      expect(json.containsKey('correct_answer'), isFalse);
      expect(json.containsKey('is_correct'), isFalse);
    });

    test('options round-trip via toJson without correctness fields', () {
      final model = PlacementQuestionModel.fromJson(validJson);
      final json = model.toJson();
      final options = json['options'] as List<dynamic>;

      expect(options, hasLength(4));
      for (final option in options) {
        final map = option as Map<String, dynamic>;
        expect(map.containsKey('correct_answer'), isFalse);
        expect(map.containsKey('is_correct'), isFalse);
        expect(map.keys, containsAll(<String>['id', 'text']));
      }
    });

    test('toEntity maps options to PlacementOption domain entities', () {
      final model = PlacementQuestionModel.fromJson(validJson);
      final entity = model.toEntity();

      expect(entity.id, model.id);
      expect(entity.options, hasLength(4));
      expect(entity.options.first.id, 'A');
    });
  });

  // -------------------------------------------------------------------------
  // PlacementAnswerModel
  // -------------------------------------------------------------------------

  group('PlacementAnswerModel', () {
    const validJson = {
      'id': 'answer-uuid-001',
      'placement_attempt_id': 'attempt-uuid-001',
      'placement_question_id': 'question-uuid-001',
      'answer_value': 'B',
      'created_at': '2026-06-16T10:00:00.000Z',
    };

    test('fromJson parses all fields from answer submission response', () {
      final model = PlacementAnswerModel.fromJson(validJson);

      expect(model.id, 'answer-uuid-001');
      expect(model.placementAttemptId, 'attempt-uuid-001');
      expect(model.placementQuestionId, 'question-uuid-001');
      expect(model.answerValue, 'B');
      expect(model.createdAt, '2026-06-16T10:00:00.000Z');
    });

    test('does not contain is_correct — backend-only field, never sent to Flutter', () {
      final model = PlacementAnswerModel.fromJson(validJson);
      final json = model.toJson();

      expect(json.containsKey('is_correct'), isFalse);
      expect(json.containsKey('correct_answer'), isFalse);
    });

    test('does not contain skill_code — backend-only field per P4-013 §4', () {
      final model = PlacementAnswerModel.fromJson(validJson);
      final json = model.toJson();

      expect(json.containsKey('skill_code'), isFalse);
    });
  });

  // -------------------------------------------------------------------------
  // PlacementResultModel
  // -------------------------------------------------------------------------

  group('PlacementResultModel', () {
    final validJson = {
      'id': 'result-uuid-001',
      'placement_attempt_id': 'attempt-uuid-001',
      'estimated_level': 'elementary',
      'skill_mastery_map': {
        'grammar': {
          'total_questions': 10,
          'correct_answers': 4,
          'mastery_score': 0.4,
          'signal': 'emerging',
        },
        'vocabulary': {
          'total_questions': 10,
          'correct_answers': 7,
          'mastery_score': 0.7,
          'signal': 'developing',
        },
        'listening': {
          'total_questions': 10,
          'correct_answers': 9,
          'mastery_score': 0.9,
          'signal': 'strong',
        },
      },
      'weakness_map': {
        'weaknesses': [
          {'skill_code': 'grammar', 'mastery_score': 0.4, 'priority': 1},
        ],
      },
      'initial_path_id': 'path-uuid-001',
      'created_at': '2026-06-16T12:00:00.000Z',
    };

    test('fromJson parses estimatedLevel as-is from backend', () {
      final model = PlacementResultModel.fromJson(validJson);
      expect(model.estimatedLevel, 'elementary');
    });

    test('fromJson parses skillMasteryMap with 3 entries', () {
      final model = PlacementResultModel.fromJson(validJson);
      expect(model.skillMasteryMap.length, 3);
    });

    test('signal is sourced from backend JSON — never computed locally', () {
      final model = PlacementResultModel.fromJson(validJson);

      expect(model.skillMasteryMap['grammar']!.signal, 'emerging');
      expect(model.skillMasteryMap['vocabulary']!.signal, 'developing');
      expect(model.skillMasteryMap['listening']!.signal, 'strong');
    });

    test('masteryScore is stored but NOT used for signal computation in Flutter', () {
      final model = PlacementResultModel.fromJson(validJson);
      final grammar = model.skillMasteryMap['grammar']!;

      // masteryScore present for informational use only
      expect(grammar.masteryScore, closeTo(0.4, 0.001));

      // signal comes from backend, independent of any Flutter threshold check
      expect(grammar.signal, 'emerging');
    });

    test('fromJson parses weakness list correctly', () {
      final model = PlacementResultModel.fromJson(validJson);

      expect(model.weaknesses.length, 1);
      expect(model.weaknesses.first.skillCode, 'grammar');
      expect(model.weaknesses.first.priority, 1);
    });

    test('fromJson handles empty skill_mastery_map gracefully', () {
      final json = Map<String, dynamic>.from(validJson);
      json['skill_mastery_map'] = null;
      final model = PlacementResultModel.fromJson(json);
      expect(model.skillMasteryMap, isEmpty);
    });

    test('fromJson handles empty weakness_map gracefully', () {
      final json = Map<String, dynamic>.from(validJson);
      json['weakness_map'] = null;
      final model = PlacementResultModel.fromJson(json);
      expect(model.weaknesses, isEmpty);
    });

    test('does not contain overallScore — internal backend field, never sent to Flutter', () {
      final model = PlacementResultModel.fromJson(validJson);
      final json = model.toJson();

      expect(json.containsKey('overall_score'), isFalse);
      expect(json.containsKey('overallScore'), isFalse);
    });

    test('does not contain correct_answer or is_correct in result', () {
      final model = PlacementResultModel.fromJson(validJson);
      final serializedKeys = model.toJson().keys.join(' ');

      expect(serializedKeys.contains('correct_answer'), isFalse);
      expect(serializedKeys.contains('is_correct'), isFalse);
    });

    test('signal fallback is unknown when backend omits signal field', () {
      final jsonMissingSignal = Map<String, dynamic>.from(validJson);
      jsonMissingSignal['skill_mastery_map'] = {
        'grammar': {
          'total_questions': 10,
          'correct_answers': 4,
          'mastery_score': 0.4,
          // signal intentionally omitted — simulates older backend
        },
      };
      final model = PlacementResultModel.fromJson(jsonMissingSignal);
      // Flutter must not compute signal — fallback to 'unknown', never threshold
      expect(model.skillMasteryMap['grammar']!.signal, 'unknown');
    });
  });
}
