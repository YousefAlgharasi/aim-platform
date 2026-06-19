// Phase 6 — P6-088
// question_answer_repository_test.dart — unit tests for Q/A repository + notifier.
//
// Covers:
//   1.  getQuestion returns Question verbatim from datasource.
//   2.  submitAttempt returns AttemptResult verbatim from datasource.
//   3.  ApiClientException mapped to AppException in getQuestion.
//   4.  ApiClientException mapped to AppException in submitAttempt.
//   5.  QuestionAnswerNotifier starts in QAIdle state.
//   6.  loadQuestion transitions to QAQuestionLoaded on success.
//   7.  loadQuestion transitions to QAError on failure.
//   8.  submitAnswer transitions to QAResultReceived on success.
//   9.  submitAnswer transitions to QAError on failure.
//  10.  reset returns notifier to QAIdle.
//  11.  isCorrect in AttemptResult is backend-supplied — display only.

import 'package:flutter_test/flutter_test.dart';
import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/attempt_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/datasources/question_remote_datasource.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';
import 'package:aim_mobile/features/question_answer/data/repository/repo_impl/question_answer_repository_impl.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/question_answer_notifier.dart';

class _FakeQuestionDatasource implements QuestionRemoteDatasource {
  final bool shouldFail;
  const _FakeQuestionDatasource({this.shouldFail = false});
  static final _q = QuestionModel.fromJson({'id':'q-1','type':'multiple_choice','stem':'Q?','richStem':null,'difficulty':'beginner','hint':null,'explanation':null,'tags':[],'options':[]});
  @override
  Future<QuestionModel> getQuestion({required String bearerToken, required String questionId}) async {
    if (shouldFail) throw const ApiClientException(code:'E', message:'fail', statusCode:404);
    return _q;
  }
}

class _FakeAttemptDatasource implements AttemptRemoteDatasource {
  final bool shouldFail;
  const _FakeAttemptDatasource({this.shouldFail = false});
  @override
  Future<AttemptSubmitResponseModel> submitAttempt({required String bearerToken, required String sessionId, required AttemptSubmitRequestModel request}) async {
    if (shouldFail) throw const ApiClientException(code:'E', message:'fail', statusCode:400);
    return AttemptSubmitResponseModel.fromJson({'attemptId':'att-1','answerId':'ans-1','attemptNumberForItem':1,'isCorrect':true,'submittedAt':'2025-06-01T10:00:10Z'});
  }
}

QuestionAnswerRepositoryImpl _repo({bool qFail=false, bool aFail=false}) =>
  QuestionAnswerRepositoryImpl(questionDatasource: _FakeQuestionDatasource(shouldFail: qFail), attemptDatasource: _FakeAttemptDatasource(shouldFail: aFail));

QuestionAnswerNotifier _notifier({bool qFail=false, bool aFail=false}) =>
  QuestionAnswerNotifier(repository: _repo(qFail: qFail, aFail: aFail));

const _req = AttemptSubmitRequestModel(itemId:'q-1', answerValue:'opt-2', startedAt:'2025-06-01T10:00:00Z');

void main() {
  group('QuestionAnswerRepositoryImpl', () {
    test('1. getQuestion returns Question verbatim', () async {
      final r = await _repo().getQuestion(bearerToken:'tok', questionId:'q-1');
      expect(r.id, 'q-1');
    });
    test('2. submitAttempt returns AttemptResult verbatim', () async {
      final r = await _repo().submitAttempt(bearerToken:'tok', sessionId:'s', request: _req);
      expect(r.attemptId, 'att-1');
      expect(r.isCorrect, isTrue);
    });
    test('3. ApiClientException → AppException in getQuestion', () {
      expect(() => _repo(qFail:true).getQuestion(bearerToken:'tok', questionId:'q-1'), throwsA(isA<AppException>()));
    });
    test('4. ApiClientException → AppException in submitAttempt', () {
      expect(() => _repo(aFail:true).submitAttempt(bearerToken:'tok', sessionId:'s', request: _req), throwsA(isA<AppException>()));
    });
  });

  group('QuestionAnswerNotifier', () {
    test('5. starts in QAIdle state', () {
      final n = _notifier();
      expect((n.state as AppAsyncSuccess<QuestionAnswerScreenState>).data, isA<QAIdle>());
    });
    test('6. loadQuestion → QAQuestionLoaded on success', () async {
      final n = _notifier();
      await n.loadQuestion(bearerToken:'tok', questionId:'q-1');
      expect((n.state as AppAsyncSuccess<QuestionAnswerScreenState>).data, isA<QAQuestionLoaded>());
    });
    test('7. loadQuestion → QAError on failure', () async {
      final n = _notifier(qFail:true);
      await n.loadQuestion(bearerToken:'tok', questionId:'q-1');
      expect((n.state as AppAsyncSuccess<QuestionAnswerScreenState>).data, isA<QAError>());
    });
    test('8. submitAnswer → QAResultReceived on success', () async {
      final n = _notifier();
      await n.loadQuestion(bearerToken:'tok', questionId:'q-1');
      final loaded = ((n.state as AppAsyncSuccess<QuestionAnswerScreenState>).data as QAQuestionLoaded);
      await n.submitAnswer(bearerToken:'tok', sessionId:'s', itemId:'q-1', answerValue:'opt-2', startedAt:'2025-06-01T10:00:00Z', question: loaded.question);
      expect((n.state as AppAsyncSuccess<QuestionAnswerScreenState>).data, isA<QAResultReceived>());
    });
    test('9. submitAnswer → QAError on failure', () async {
      final n = _notifier(aFail:true);
      await n.loadQuestion(bearerToken:'tok', questionId:'q-1');
      final loaded = ((n.state as AppAsyncSuccess<QuestionAnswerScreenState>).data as QAQuestionLoaded);
      await n.submitAnswer(bearerToken:'tok', sessionId:'s', itemId:'q-1', answerValue:'opt-2', startedAt:'2025-06-01T10:00:00Z', question: loaded.question);
      expect((n.state as AppAsyncSuccess<QuestionAnswerScreenState>).data, isA<QAError>());
    });
    test('10. reset → QAIdle', () async {
      final n = _notifier();
      await n.loadQuestion(bearerToken:'tok', questionId:'q-1');
      n.reset();
      expect((n.state as AppAsyncSuccess<QuestionAnswerScreenState>).data, isA<QAIdle>());
    });
    test('11. isCorrect is backend-supplied — display only', () async {
      final n = _notifier();
      await n.loadQuestion(bearerToken:'tok', questionId:'q-1');
      final loaded = ((n.state as AppAsyncSuccess<QuestionAnswerScreenState>).data as QAQuestionLoaded);
      await n.submitAnswer(bearerToken:'tok', sessionId:'s', itemId:'q-1', answerValue:'opt-2', startedAt:'2025-06-01T10:00:00Z', question: loaded.question);
      final result = ((n.state as AppAsyncSuccess<QuestionAnswerScreenState>).data as QAResultReceived).result;
      expect(result.isCorrect, isTrue);
    });
  });
}
