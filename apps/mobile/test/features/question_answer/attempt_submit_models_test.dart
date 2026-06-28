// Phase 6 — P6-085
// attempt_submit_models_test.dart — unit tests for attempt submit models.
//
// Covers:
//   1.  AttemptSubmitRequestModel.toJson contains itemId, answerValue, startedAt.
//   2.  AttemptSubmitRequestModel.toJson NEVER contains isCorrect.
//   3.  AttemptSubmitRequestModel.toJson NEVER contains skillIds.
//   4.  AttemptSubmitRequestModel.toJson NEVER contains studentId.
//   5.  AttemptSubmitResponseModel.fromJson parses all fields.
//   6.  AttemptSubmitResponseModel.fromJson silently drops isCorrect — never returned during an active session.
//   7.  AttemptSubmitResponseModel.fromJson silently drops attemptNumberForItem.
//   8.  AttemptSubmitResponseModel.toJson round-trips correctly and never contains isCorrect.
//   9.  AttemptResult has no isCorrect field — security invariant.
//  10.  AttemptSubmitRequestModel only contains student-supplied fields.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/question_answer/data/models/attempt_submit_request_model.dart';
import 'package:aim_mobile/features/question_answer/data/models/attempt_submit_response_model.dart';
import 'package:aim_mobile/features/question_answer/logic/entity/attempt_result.dart';

void main() {
  group('AttemptSubmitRequestModel', () {
    const req = AttemptSubmitRequestModel(
      itemId: 'item-uuid-1',
      answerValue: 'opt-1',
      startedAt: '2025-06-01T10:00:00Z',
    );

    test('1. toJson contains itemId, answerValue, startedAt', () {
      final json = req.toJson();
      expect(json['itemId'], 'item-uuid-1');
      expect(json['answerValue'], 'opt-1');
      expect(json['startedAt'], '2025-06-01T10:00:00Z');
    });

    test('2. toJson NEVER contains isCorrect — security invariant', () {
      final json = req.toJson();
      expect(json.containsKey('isCorrect'), isFalse,
          reason: 'Flutter must never send isCorrect to backend');
    });

    test('3. toJson NEVER contains skillIds — backend resolves these', () {
      final json = req.toJson();
      expect(json.containsKey('skillIds'), isFalse,
          reason: 'skillIds are backend-resolved from curriculum data');
    });

    test('4. toJson NEVER contains studentId — backend resolves from JWT', () {
      final json = req.toJson();
      expect(json.containsKey('studentId'), isFalse,
          reason: 'studentId must never be client-supplied');
    });

    test('10. only contains student-supplied fields', () {
      final json = req.toJson();
      final keys = json.keys.toSet();
      // Only these three fields are legitimate for Flutter to send.
      expect(keys, equals({'itemId', 'answerValue', 'startedAt'}));
    });
  });

  group('AttemptSubmitResponseModel', () {
    const responseJson = {
      'attemptId': 'attempt-uuid-1',
      'answerId': 'answer-uuid-1',
      'attemptNumberForItem': 1,
      'isCorrect': true,
      'submittedAt': '2025-06-01T10:00:10Z',
      'aimPipelineTriggered': false,
      'aimOutcome': 'deferred',
    };

    test('5. fromJson parses all fields', () {
      final m = AttemptSubmitResponseModel.fromJson(responseJson);
      expect(m.attemptId, 'attempt-uuid-1');
      expect(m.answerId, 'answer-uuid-1');
      expect(m.submittedAt, '2025-06-01T10:00:10Z');
      expect(m.aimPipelineTriggered, isFalse);
      expect(m.aimOutcome, 'deferred');
    });

    test('6. fromJson silently drops isCorrect — never returned during an active session', () {
      final correct = AttemptSubmitResponseModel.fromJson(responseJson);
      final incorrect = AttemptSubmitResponseModel.fromJson(
          {...responseJson, 'isCorrect': false});
      expect(correct.toJson().containsKey('isCorrect'), isFalse);
      expect(incorrect.toJson().containsKey('isCorrect'), isFalse);
    });

    test('7. fromJson silently drops attemptNumberForItem', () {
      final m = AttemptSubmitResponseModel.fromJson(
          {...responseJson, 'attemptNumberForItem': 3});
      expect(m.toJson().containsKey('attemptNumberForItem'), isFalse);
    });

    test('8. toJson round-trips correctly and never contains isCorrect', () {
      final m = AttemptSubmitResponseModel.fromJson(responseJson);
      final out = m.toJson();
      expect(out['attemptId'], 'attempt-uuid-1');
      expect(out.containsKey('isCorrect'), isFalse);
      expect(out.containsKey('attemptNumberForItem'), isFalse);
    });

    test('9. AttemptResult has no isCorrect field — security invariant', () {
      final m = AttemptSubmitResponseModel.fromJson(responseJson);
      expect(m, isA<AttemptResult>());
    });
  });
}
