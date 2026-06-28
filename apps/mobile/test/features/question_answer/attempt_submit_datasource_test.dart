// Phase 6 — P6-087
// attempt_submit_datasource_test.dart — unit tests for attempt submit datasource.
//
// Covers:
//   1.  BackendApiPaths.sessionsStart is correct.
//   2.  BackendApiPaths.sessionAttempt builds correct path.
//   3.  AttemptRemoteDatasource interface is correctly typed.
//   4.  AttemptSubmitRequestModel.toJson never contains studentId.
//   5.  AttemptSubmitRequestModel.toJson never contains isCorrect.
//   6.  AttemptSubmitRequestModel.toJson never contains skillIds.
//   7.  AttemptSubmitRequestModel.toJson has exactly 3 keys.
//   8.  AttemptSubmitResponseModel.fromJson silently drops isCorrect.
//   9.  AttemptSubmitResponseModel.fromJson parses attemptId and answerId.
//  10.  Interface contract: submitAttempt accepts backend-supplied sessionId.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/attempt_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';

void main() {
  group('BackendApiPaths — session endpoints', () {
    test('1. sessionsStart path is correct', () {
      expect(BackendApiPaths.sessionsStart, '/sessions/start');
    });

    test('2. sessionAttempt builds correct path', () {
      expect(
        BackendApiPaths.sessionAttempt('session-uuid-1'),
        '/sessions/session-uuid-1/attempt',
      );
    });
  });

  group('AttemptRemoteDatasource interface', () {
    test('3. interface declares submitAttempt', () {
      expect(_FakeDatasource(), isA<AttemptRemoteDatasource>());
    });
  });

  group('AttemptSubmitRequestModel — payload security', () {
    const req = AttemptSubmitRequestModel(
      itemId: 'item-1',
      answerValue: 'opt-2',
      startedAt: '2025-06-01T10:00:00Z',
    );

    test('4. toJson never contains studentId', () {
      expect(req.toJson().containsKey('studentId'), isFalse);
    });

    test('5. toJson never contains isCorrect', () {
      expect(req.toJson().containsKey('isCorrect'), isFalse);
    });

    test('6. toJson never contains skillIds', () {
      expect(req.toJson().containsKey('skillIds'), isFalse);
    });

    test('7. toJson has exactly 3 keys: itemId, answerValue, startedAt', () {
      expect(req.toJson().keys.toSet(),
          equals({'itemId', 'answerValue', 'startedAt'}));
    });
  });

  group('AttemptSubmitResponseModel — backend values verbatim', () {
    const json = {
      'attemptId': 'att-1',
      'answerId': 'ans-1',
      'attemptNumberForItem': 1,
      'isCorrect': true,
      'submittedAt': '2025-06-01T10:00:10Z',
      'aimPipelineTriggered': false,
      'aimOutcome': 'deferred',
    };

    test('8. fromJson silently drops isCorrect from backend', () {
      expect(AttemptSubmitResponseModel.fromJson(json).toJson().containsKey('isCorrect'),
          isFalse);
      expect(
        AttemptSubmitResponseModel.fromJson({...json, 'isCorrect': false})
            .toJson()
            .containsKey('isCorrect'),
        isFalse,
      );
    });

    test('9. fromJson parses attemptId and answerId', () {
      final m = AttemptSubmitResponseModel.fromJson(json);
      expect(m.attemptId, 'att-1');
      expect(m.answerId, 'ans-1');
    });

    test('10. interface contract: submitAttempt accepts backend-supplied sessionId',
        () {
      final ds = _FakeDatasource();
      expect(
        () async => ds.submitAttempt(
          bearerToken: 'tok',
          sessionId: 'backend-session-id',
          request: const AttemptSubmitRequestModel(
            itemId: 'item-1',
            answerValue: 'opt-1',
            startedAt: '2025-06-01T10:00:00Z',
          ),
        ),
        returnsNormally,
      );
    });
  });
}

// ── Fake for interface contract check ─────────────────────────────────────────

class _FakeDatasource implements AttemptRemoteDatasource {
  @override
  Future<AttemptSubmitResponseModel> submitAttempt({
    required String bearerToken,
    required String sessionId,
    required AttemptSubmitRequestModel request,
  }) async =>
      AttemptSubmitResponseModel.fromJson({
        'attemptId': 'att-1',
        'answerId': 'ans-1',
        'attemptNumberForItem': 1,
        'isCorrect': false,
        'submittedAt': '2025-06-01T10:00:10Z',
        'aimPipelineTriggered': false,
        'aimOutcome': 'deferred',
      });
}
