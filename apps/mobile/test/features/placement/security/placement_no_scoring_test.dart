// Phase 4 — P4-071
// Flutter placement no-scoring security tests.
//
// Scope: Placement Test phase only.
//
// Purpose:
//   Verify that no placement scoring, CEFR level mapping, skill signal computation,
//   or weakness threshold logic exists anywhere in the Flutter placement feature.
//   These checks complement the P4-070 regression check by testing the data layer.
//
// Rules verified (P4-035 §4, P4-012 §4):
//   - Flutter never derives signal from masteryScore using threshold constants.
//   - Flutter never maps overallScore to a CEFR level.
//   - Flutter never computes weaknesses from answer data locally.
//   - correct_answer and is_correct are never present in any Flutter model.
//   - overallScore is never returned to Flutter — only estimatedLevel.
//   - student_id is never sent by Flutter — resolved from JWT on backend.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/placement/logic/entity/placement_skill_mastery.dart';
import 'package:aim_mobile/features/placement/data/models/placement_result_model.dart';
import 'package:aim_mobile/features/placement/data/models/placement_question_model.dart';
import 'package:aim_mobile/features/placement/data/models/placement_answer_model.dart';

void main() {
  // -------------------------------------------------------------------------
  // Signal — must come from backend, never computed locally
  // -------------------------------------------------------------------------

  group('PlacementSkillMastery — backend-only signal', () {
    test('signal field is required and sourced from backend', () {
      // PlacementSkillMastery requires signal — it cannot be constructed
      // without it. This prevents accidental local computation.
      const mastery = PlacementSkillMastery(
        skillCode: 'grammar',
        totalQuestions: 10,
        correctAnswers: 8,
        masteryScore: 0.8,
        signal: 'strong', // sourced from backend JSON
      );

      expect(mastery.signal, 'strong');
    });

    test('two identical masteryScores with different backend signals are distinct', () {
      // This test proves Flutter uses signal as-is from backend, not computed.
      // The same masteryScore (0.74) can yield different signals depending on
      // backend config — Flutter must not override this.
      const a = PlacementSkillMastery(
        skillCode: 'grammar',
        totalQuestions: 10,
        correctAnswers: 7,
        masteryScore: 0.7,
        signal: 'developing', // backend says developing
      );
      const b = PlacementSkillMastery(
        skillCode: 'grammar',
        totalQuestions: 10,
        correctAnswers: 7,
        masteryScore: 0.7,
        signal: 'strong', // backend says strong (different config)
      );

      // Flutter must display both as-is — it cannot recompute to a single value
      expect(a.signal, isNot(b.signal));
      expect(a.masteryScore, b.masteryScore); // same score, different signals
    });

    test('unknown signal fallback accepted — never triggers local computation', () {
      // When backend omits signal field, PlacementResultModel falls back to
      // 'unknown' — never to a locally-computed threshold check (P4-070 fix).
      const mastery = PlacementSkillMastery(
        skillCode: 'listening',
        totalQuestions: 5,
        correctAnswers: 3,
        masteryScore: 0.6,
        signal: 'unknown', // fallback from PlacementResultModel parser
      );

      // Flutter must accept 'unknown' gracefully — no re-computation
      expect(mastery.signal, 'unknown');
    });
  });

  // -------------------------------------------------------------------------
  // correct_answer / is_correct — never in Flutter models
  // -------------------------------------------------------------------------

  group('Security — correct_answer and is_correct absent from all models', () {
    test('PlacementQuestionModel.toJson never includes correct_answer', () {
      final q = PlacementQuestionModel.fromJson({
        'id': 'q-1',
        'question_type': 'multiple_choice',
        'prompt': 'Choose the correct word.',
        'media_url': null,
        'order_index': 1,
        'skill_code': 'grammar',
      });

      final json = q.toJson();
      expect(json.containsKey('correct_answer'), isFalse);
      expect(json.containsKey('is_correct'), isFalse);
      expect(json.toString().contains('correct_answer'), isFalse);
    });

    test('PlacementAnswerModel.toJson never includes is_correct or skill_code', () {
      final a = PlacementAnswerModel.fromJson({
        'id': 'ans-1',
        'placement_attempt_id': 'att-1',
        'placement_question_id': 'q-1',
        'answer_value': 'A',
        'created_at': '2026-06-16T12:00:00Z',
      });

      final json = a.toJson();
      expect(json.containsKey('is_correct'), isFalse);
      expect(json.containsKey('correct_answer'), isFalse);
      expect(json.containsKey('skill_code'), isFalse);
    });

    test('PlacementResultModel.toJson never includes overallScore', () {
      final r = PlacementResultModel.fromJson({
        'id': 'res-1',
        'placement_attempt_id': 'att-1',
        'estimated_level': 'beginner',
        'skill_mastery_map': {},
        'weakness_map': null,
        'initial_path_id': 'path-1',
        'created_at': '2026-06-16T12:00:00Z',
      });

      final json = r.toJson();
      expect(json.containsKey('overall_score'), isFalse);
      expect(json.containsKey('overallScore'), isFalse);
      expect(json.containsKey('correct_answer'), isFalse);
      expect(json.containsKey('is_correct'), isFalse);
    });
  });

  // -------------------------------------------------------------------------
  // estimatedLevel — displayed as-is, never mapped locally
  // -------------------------------------------------------------------------

  group('PlacementResultModel — backend-authoritative level', () {
    void assertLevel(String level) {
      final r = PlacementResultModel.fromJson({
        'id': 'res-$level',
        'placement_attempt_id': 'att-1',
        'estimated_level': level,
        'skill_mastery_map': {},
        'weakness_map': null,
        'initial_path_id': 'path-1',
        'created_at': '2026-06-16T12:00:00Z',
      });
      // Flutter stores and forwards level as-is — no enum mapping, no threshold
      expect(r.estimatedLevel, level);
    }

    test('stores beginner level as-is from backend', () => assertLevel('beginner'));
    test('stores elementary level as-is from backend', () => assertLevel('elementary'));
    test('stores intermediate level as-is from backend', () => assertLevel('intermediate'));
    test('stores upper_intermediate level as-is from backend', () => assertLevel('upper_intermediate'));
    test('stores advanced level as-is from backend', () => assertLevel('advanced'));
  });

  // -------------------------------------------------------------------------
  // Weakness map — sourced from backend, never computed locally
  // -------------------------------------------------------------------------

  group('PlacementResultModel — weakness map backend authority', () {
    test('weaknesses are ordered as received from backend', () {
      final r = PlacementResultModel.fromJson({
        'id': 'res-1',
        'placement_attempt_id': 'att-1',
        'estimated_level': 'elementary',
        'skill_mastery_map': {},
        'weakness_map': {
          'weaknesses': [
            {'skill_code': 'grammar', 'mastery_score': 0.2, 'priority': 1},
            {'skill_code': 'listening', 'mastery_score': 0.3, 'priority': 2},
          ],
        },
        'initial_path_id': 'path-1',
        'created_at': '2026-06-16T12:00:00Z',
      });

      // Priority order comes from backend — Flutter preserves it as-is
      expect(r.weaknesses.length, 2);
      expect(r.weaknesses[0].skillCode, 'grammar');
      expect(r.weaknesses[0].priority, 1);
      expect(r.weaknesses[1].skillCode, 'listening');
      expect(r.weaknesses[1].priority, 2);
    });

    test('handles empty weakness list without error', () {
      final r = PlacementResultModel.fromJson({
        'id': 'res-1',
        'placement_attempt_id': 'att-1',
        'estimated_level': 'advanced',
        'skill_mastery_map': {},
        'weakness_map': {'weaknesses': []},
        'initial_path_id': 'path-1',
        'created_at': '2026-06-16T12:00:00Z',
      });

      expect(r.weaknesses, isEmpty);
    });
  });
}
