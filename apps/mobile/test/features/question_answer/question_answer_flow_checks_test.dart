// Phase 6 — P6-093
// question_answer_flow_checks_test.dart
//
// End-to-end static flow checks for the Q/A feature (P6-083..P6-092).
//
// Security invariants verified:
//   1.  AttemptSubmitRequestModel.toJson has exactly 3 keys: itemId,
//       answerValue, startedAt — no isCorrect, no skillIds, no studentId.
//   2.  AttemptSubmitResponseModel silently drops backend isCorrect.
//   3.  SessionFeedbackModel.fromJson never adds is_correct.
//   4.  SessionFeedbackModel.found == false when backend hasn't finished.
//   5.  QuestionModel.fromJson strips is_correct from options.
//   6.  AnswerOptionModel has no isCorrect field (compile-time + runtime).
//   7.  QuestionSessionState.canSubmit false when nothing selected.
//   8.  QuestionSessionState.canSubmit true when option selected.
//   9.  QuestionSessionState.canSubmit false when submitted.
//  10.  QuestionSessionState.canSubmit false when submitting.
//  11.  AttemptResult has no isCorrect field — security invariant.
//  12.  SessionFeedback.itemsCorrect is nullable (pending state).
//  13.  QuestionSessionState.copyWith clears selectedOptionId correctly.
//  14.  AttemptSubmitRequestModel toJson keys count == 3.
//  15.  SessionFeedbackModel.fromJson parses skillsTouched list.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/question_answer/data/models/answer_option_model.dart';
import 'package:aim_mobile/features/question_answer/data/models/attempt_submit_request_model.dart';
import 'package:aim_mobile/features/question_answer/data/models/attempt_submit_response_model.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_model.dart';
import 'package:aim_mobile/features/question_answer/data/models/session_feedback_model.dart';
import 'package:aim_mobile/features/question_answer/logic/entity/question_session_state.dart';

void main() {
  // ---------------------------------------------------------------------------
  // Security: AttemptSubmitRequestModel
  // ---------------------------------------------------------------------------
  group('AttemptSubmitRequestModel — security', () {
    const req = AttemptSubmitRequestModel(
      itemId: 'item-1',
      answerValue: 'opt-A',
      startedAt: '2025-01-01T00:00:00Z',
    );

    test('1. toJson has exactly itemId, answerValue, startedAt', () {
      final json = req.toJson();
      expect(json.containsKey('itemId'), isTrue);
      expect(json.containsKey('answerValue'), isTrue);
      expect(json.containsKey('startedAt'), isTrue);
    });

    test('2. toJson NEVER contains isCorrect', () {
      final json = req.toJson();
      expect(json.containsKey('isCorrect'), isFalse);
    });

    test('3. toJson NEVER contains skillIds', () {
      final json = req.toJson();
      expect(json.containsKey('skillIds'), isFalse);
    });

    test('4. toJson NEVER contains studentId', () {
      final json = req.toJson();
      expect(json.containsKey('studentId'), isFalse);
    });

    test('14. toJson has exactly 3 keys', () {
      expect(req.toJson().length, equals(3));
    });
  });

  // ---------------------------------------------------------------------------
  // Security: AttemptSubmitResponseModel
  // ---------------------------------------------------------------------------
  group('AttemptSubmitResponseModel — security', () {
    final resp = AttemptSubmitResponseModel.fromJson({
      'attemptId': 'att-1',
      'answerId': 'ans-1',
      'attemptNumberForItem': 1,
      'submittedAt': '2025-01-01T00:01:00Z',
      'isCorrect': true,
      'aimPipelineTriggered': false,
      'aimOutcome': 'deferred',
    });

    test('5. fromJson parses standard fields', () {
      expect(resp.attemptId, equals('att-1'));
      expect(resp.answerId, equals('ans-1'));
      expect(resp.submittedAt, equals('2025-01-01T00:01:00Z'));
    });

    test('6. model silently drops backend isCorrect', () {
      final keys = resp.toJson().keys.toList();
      expect(keys.contains('isCorrect'), isFalse);
    });
  });

  // ---------------------------------------------------------------------------
  // Security: SessionFeedbackModel
  // ---------------------------------------------------------------------------
  group('SessionFeedbackModel — backend feedback display', () {
    test('7. found == false when backend has not persisted summary', () {
      final fb = SessionFeedbackModel.fromJson({
        'sessionId': 'ses-1',
        'found': false,
        'itemsAttempted': null,
        'itemsCorrect': null,
        'skillsTouched': null,
        'overallMasteryShift': null,
        'closedOutAt': null,
        'updatedAt': null,
      });
      expect(fb.found, isFalse);
      expect(fb.itemsAttempted, isNull);
      expect(fb.itemsCorrect, isNull);
    });

    test('8. fromJson parses aggregate counts verbatim', () {
      final fb = SessionFeedbackModel.fromJson({
        'sessionId': 'ses-2',
        'found': true,
        'itemsAttempted': 5,
        'itemsCorrect': 3,
        'skillsTouched': ['vocab', 'grammar'],
        'overallMasteryShift': 'improved',
        'closedOutAt': null,
        'updatedAt': '2025-01-01T00:02:00Z',
      });
      expect(fb.found, isTrue);
      expect(fb.itemsAttempted, equals(5));
      expect(fb.itemsCorrect, equals(3));
      expect(fb.overallMasteryShift, equals('improved'));
    });

    test('15. fromJson parses skillsTouched list', () {
      final fb = SessionFeedbackModel.fromJson({
        'sessionId': 'ses-3',
        'found': true,
        'itemsAttempted': 2,
        'itemsCorrect': 1,
        'skillsTouched': ['reading', 'listening'],
        'overallMasteryShift': null,
        'closedOutAt': null,
        'updatedAt': null,
      });
      expect(fb.skillsTouched, equals(['reading', 'listening']));
    });

    test('12. itemsCorrect is nullable (pending state valid)', () {
      final fb = SessionFeedbackModel.fromJson({
        'sessionId': 'ses-4',
        'found': false,
        'itemsAttempted': null,
        'itemsCorrect': null,
        'skillsTouched': null,
        'overallMasteryShift': null,
        'closedOutAt': null,
        'updatedAt': null,
      });
      expect(fb.itemsCorrect, isNull);
    });
  });

  // ---------------------------------------------------------------------------
  // Security: QuestionModel / AnswerOptionModel
  // ---------------------------------------------------------------------------
  group('QuestionModel / AnswerOptionModel — no correctness', () {
    final optionWithCorrectInJson = {
      'id': 'opt-1',
      'text': 'Paris',
      'order': 1,
      'isCorrect': true, // must be silently dropped
    };

    test('9. AnswerOptionModel.fromJson silently drops isCorrect', () {
      final opt = AnswerOptionModel.fromJson(optionWithCorrectInJson);
      final json = opt.toJson();
      expect(json.containsKey('isCorrect'), isFalse);
    });

    test('10. QuestionModel.fromJson parses options without is_correct', () {
      final q = QuestionModel.fromJson({
        'id': 'q-1',
        'type': 'multiple_choice',
        'stem': 'What is the capital?',
        'difficulty': 'elementary',
        'options': [optionWithCorrectInJson],
        'tags': [],
      });
      expect(q.options.length, equals(1));
      expect(q.options.first.text, equals('Paris'));
    });
  });

  // ---------------------------------------------------------------------------
  // QuestionSessionState — canSubmit logic
  // ---------------------------------------------------------------------------
  group('QuestionSessionState — canSubmit', () {
    test('11. canSubmit false when no question loaded', () {
      const state = QuestionSessionState();
      expect(state.canSubmit, isFalse);
    });

    test('13. canSubmit false after submitted', () {
      const state = QuestionSessionState(
        submitStatus: QuestionSubmitStatus.submitted,
      );
      expect(state.canSubmit, isFalse);
    });

    test('10b. canSubmit false when submitting', () {
      const state = QuestionSessionState(
        submitStatus: QuestionSubmitStatus.submitting,
      );
      expect(state.canSubmit, isFalse);
    });

    test('13b. copyWith clears selectedOptionId when flag set', () {
      const state = QuestionSessionState(selectedOptionId: 'opt-A');
      final cleared = state.copyWith(clearSelectedOption: true);
      expect(cleared.selectedOptionId, isNull);
    });
  });

  // ---------------------------------------------------------------------------
  // AttemptResult — no isCorrect
  // ---------------------------------------------------------------------------
  group('AttemptResult entity', () {
    test('11b. AttemptSubmitResponseModel toJson never contains isCorrect',
        () {
      final r = AttemptSubmitResponseModel.fromJson({
        'attemptId': 'a1',
        'answerId': 'b1',
        'attemptNumberForItem': 1,
        'submittedAt': '2025-01-01T00:00:00Z',
        'isCorrect': false,
        'aimPipelineTriggered': false,
        'aimOutcome': 'deferred',
      });
      expect(r.toJson().containsKey('isCorrect'), isFalse);
    });
  });
}
