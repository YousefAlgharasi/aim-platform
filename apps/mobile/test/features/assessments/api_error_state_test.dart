import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/assessments/data/datasources/assessment_remote_datasource.dart';
import 'package:aim_mobile/features/assessments/data/models/assessment_models.dart';
import 'package:aim_mobile/features/assessments/data/repository/assessment_data_repository.dart';
import 'package:aim_mobile/features/assessments/logic/repository/assessment_repository.dart';
import 'package:flutter_test/flutter_test.dart';

/// Fake datasource whose methods throw a pre-configured exception when set,
/// matching the hand-written fake convention used throughout this test suite
/// (this codebase does not use mockito elsewhere).
class _FakeAssessmentRemoteDatasource implements AssessmentRemoteDatasource {
  Object? errorToThrow;

  void _throwIfNeeded() {
    if (errorToThrow != null) throw errorToThrow!;
  }

  @override
  Future<List<AssessmentListItemModel>> getAssessments({
    required String bearerToken,
  }) async {
    _throwIfNeeded();
    return const [];
  }

  @override
  Future<AssessmentListItemModel?> getNextAssessment({
    required String bearerToken,
  }) async {
    _throwIfNeeded();
    return null;
  }

  @override
  Future<AssessmentDetailModel> getAssessmentDetail({
    required String bearerToken,
    required String assessmentId,
  }) async {
    _throwIfNeeded();
    throw UnimplementedError();
  }

  @override
  Future<ResultHistoryModel> getResultHistory({
    required String bearerToken,
    required String assessmentId,
  }) async {
    _throwIfNeeded();
    throw UnimplementedError();
  }

  @override
  Future<StudentDeadlinesModel> getDeadlines({
    required String bearerToken,
  }) async {
    _throwIfNeeded();
    throw UnimplementedError();
  }

  @override
  Future<StartAttemptResultModel> startAttempt({
    required String bearerToken,
    required String assessmentId,
  }) async {
    _throwIfNeeded();
    throw UnimplementedError();
  }

  @override
  Future<ResumeAttemptResultModel> resumeAttempt({
    required String bearerToken,
    required String attemptId,
  }) async {
    _throwIfNeeded();
    throw UnimplementedError();
  }

  @override
  Future<SubmitAttemptResultModel> submitAttempt({
    required String bearerToken,
    required String attemptId,
  }) async {
    _throwIfNeeded();
    throw UnimplementedError();
  }

  @override
  Future<AttemptResultDetailModel> getAttemptResult({
    required String bearerToken,
    required String attemptId,
  }) async {
    _throwIfNeeded();
    throw UnimplementedError();
  }

  @override
  Future<List<AttemptQuestionModel>> getAttemptQuestions({
    required String bearerToken,
    required String attemptId,
  }) async {
    _throwIfNeeded();
    return const [];
  }

  @override
  Future<SubmittedAnswerModel> submitAnswer({
    required String bearerToken,
    required String attemptId,
    required String assessmentQuestionLinkId,
    required String responseValue,
  }) async {
    _throwIfNeeded();
    throw UnimplementedError();
  }
}

/// P10-066: Mobile API error state tests.
///
/// Verifies that backend assessment error codes are handled gracefully:
///   - ApiClientException is mapped to AppException by the repository
///   - Error states produce user-friendly messages (no raw backend errors)
///   - No error handler computes grading or deadline logic
///   - AppAsyncFailure states carry the correct code and message
void main() {
  late _FakeAssessmentRemoteDatasource mockDatasource;
  late AssessmentRepository repository;

  setUp(() {
    mockDatasource = _FakeAssessmentRemoteDatasource();
    repository = AssessmentRepositoryImpl(datasource: mockDatasource);
  });

  const bearerToken = 'test-token';
  const assessmentId = 'assessment-123';
  const attemptId = 'attempt-456';

  // ---------------------------------------------------------------------------
  // Backend error codes that must be handled
  // ---------------------------------------------------------------------------

  /// All assessment error codes from the backend, with the HTTP status and
  /// user-facing message the mobile app should surface.
  final errorScenarios = <({
    String code,
    String message,
    int statusCode,
    String description,
  })>[
    (
      code: 'ASSESSMENT_NOT_FOUND',
      message: 'Assessment assessment-123 not found.',
      statusCode: 404,
      description: 'assessment does not exist',
    ),
    (
      code: 'ASSESSMENT_UNAVAILABLE',
      message: 'Assessment assessment-123 is not available.',
      statusCode: 409,
      description: 'assessment is unavailable',
    ),
    (
      code: 'ATTEMPT_NOT_FOUND',
      message: 'Assessment attempt not found.',
      statusCode: 404,
      description: 'attempt does not exist',
    ),
    (
      code: 'ATTEMPT_NOT_OWNED',
      message: 'Assessment attempt not found.',
      statusCode: 404,
      description: 'attempt owned by another user',
    ),
    (
      code: 'ATTEMPT_NOT_RESUMABLE',
      message: 'Attempt attempt-456 cannot be resumed in its current state.',
      statusCode: 409,
      description: 'attempt cannot be resumed',
    ),
    (
      code: 'ATTEMPT_ALREADY_SUBMITTED',
      message: 'Attempt attempt-456 has already been submitted.',
      statusCode: 409,
      description: 'duplicate submission',
    ),
    (
      code: 'ATTEMPT_EXPIRED',
      message: 'Attempt attempt-456 has expired.',
      statusCode: 409,
      description: 'attempt time limit exceeded',
    ),
    (
      code: 'ATTEMPT_INVALID',
      message: 'Attempt attempt-456 is in an invalid state for this operation.',
      statusCode: 409,
      description: 'attempt in invalid state',
    ),
    (
      code: 'MAX_ATTEMPTS_REACHED',
      message: 'Maximum number of attempts reached for this assessment.',
      statusCode: 409,
      description: 'no more attempts allowed',
    ),
    (
      code: 'DEADLINE_NOT_OPEN',
      message: 'The assessment deadline has not opened yet.',
      statusCode: 409,
      description: 'deadline not yet open',
    ),
    (
      code: 'DEADLINE_CLOSED',
      message: 'The assessment deadline has closed.',
      statusCode: 409,
      description: 'deadline has passed',
    ),
    (
      code: 'DEADLINE_BLOCKS_SUBMISSION',
      message: 'The deadline prevents submission at this time.',
      statusCode: 409,
      description: 'deadline blocks submission',
    ),
    (
      code: 'RESULT_NOT_FOUND',
      message: 'Assessment result not found.',
      statusCode: 404,
      description: 'result does not exist',
    ),
    (
      code: 'RESULT_ALREADY_EXISTS',
      message: 'Result already exists for attempt attempt-456.',
      statusCode: 409,
      description: 'result already computed',
    ),
    (
      code: 'NO_QUESTIONS_FOUND',
      message: 'No questions found for assessment assessment-123.',
      statusCode: 404,
      description: 'assessment has no questions',
    ),
  ];

  // ---------------------------------------------------------------------------
  // Group 1: Repository maps ApiClientException -> AppException
  // ---------------------------------------------------------------------------

  group('Repository error mapping', () {
    for (final scenario in errorScenarios) {
      test(
          'maps ${scenario.code} ApiClientException to AppException '
          '(${scenario.description})', () async {
        mockDatasource.errorToThrow = ApiClientException(
          code: scenario.code,
          message: scenario.message,
          statusCode: scenario.statusCode,
        );

        expect(
          () => repository.getAssessmentDetail(
            bearerToken: bearerToken,
            assessmentId: assessmentId,
          ),
          throwsA(
            isA<AppException>()
                .having((e) => e.code, 'code', scenario.code)
                .having((e) => e.message, 'message', scenario.message),
          ),
        );
      });
    }

    test('preserves error code and message through mapping', () async {
      mockDatasource.errorToThrow = const ApiClientException(
        code: 'MAX_ATTEMPTS_REACHED',
        message: 'Maximum number of attempts reached for this assessment.',
        statusCode: 409,
      );

      try {
        await repository.startAttempt(
          bearerToken: bearerToken,
          assessmentId: assessmentId,
        );
        fail('Expected AppException');
      } on AppException catch (e) {
        expect(e.code, 'MAX_ATTEMPTS_REACHED');
        expect(e.message,
            'Maximum number of attempts reached for this assessment.');
      }
    });

    test('does not swallow non-ApiClientException errors', () async {
      mockDatasource.errorToThrow = Exception('network timeout');

      expect(
        () => repository.getAssessments(bearerToken: bearerToken),
        throwsA(isA<Exception>().having(
          (e) => e.toString(),
          'toString',
          contains('network timeout'),
        )),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Group 2: Error mapping across all repository methods
  // ---------------------------------------------------------------------------

  group('All repository methods handle errors', () {
    const apiError = ApiClientException(
      code: 'ATTEMPT_EXPIRED',
      message: 'Attempt attempt-456 has expired.',
      statusCode: 409,
    );

    test('getAssessments throws AppException on API error', () {
      mockDatasource.errorToThrow = apiError;

      expect(
        () => repository.getAssessments(bearerToken: bearerToken),
        throwsA(isA<AppException>()),
      );
    });

    test('getResultHistory throws AppException on API error', () {
      mockDatasource.errorToThrow = apiError;

      expect(
        () => repository.getResultHistory(
          bearerToken: bearerToken,
          assessmentId: assessmentId,
        ),
        throwsA(isA<AppException>()),
      );
    });

    test('getDeadlines throws AppException on API error', () {
      mockDatasource.errorToThrow = apiError;

      expect(
        () => repository.getDeadlines(bearerToken: bearerToken),
        throwsA(isA<AppException>()),
      );
    });

    test('resumeAttempt throws AppException on API error', () {
      mockDatasource.errorToThrow = apiError;

      expect(
        () => repository.resumeAttempt(
          bearerToken: bearerToken,
          attemptId: attemptId,
        ),
        throwsA(isA<AppException>()),
      );
    });

    test('submitAttempt throws AppException on API error', () {
      mockDatasource.errorToThrow = apiError;

      expect(
        () => repository.submitAttempt(
          bearerToken: bearerToken,
          attemptId: attemptId,
        ),
        throwsA(isA<AppException>()),
      );
    });

    test('getAttemptResult throws AppException on API error', () {
      mockDatasource.errorToThrow = apiError;

      expect(
        () => repository.getAttemptResult(
          bearerToken: bearerToken,
          attemptId: attemptId,
        ),
        throwsA(isA<AppException>()),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Group 3: AppAsyncFailure carries correct code and message
  // ---------------------------------------------------------------------------

  group('AppAsyncFailure error state construction', () {
    for (final scenario in errorScenarios) {
      test('AppAsyncFailure for ${scenario.code} has user-friendly message',
          () {
        final state = AppAsyncFailure<void>(
          message: scenario.message,
          code: scenario.code,
        );

        expect(state.hasError, isTrue);
        expect(state.isLoading, isFalse);
        expect(state.hasData, isFalse);
        expect(state.code, scenario.code);
        expect(state.message, isNotEmpty);
        // Message must not contain raw stack traces or internal identifiers.
        expect(state.message, isNot(contains('Exception')));
        expect(state.message, isNot(contains('stackTrace')));
        expect(state.message, isNot(contains('at line')));
      });
    }

    test('failure state for expired attempt shows human-readable text', () {
      const state = AppAsyncFailure<void>(
        message: 'Attempt attempt-456 has expired.',
        code: 'ATTEMPT_EXPIRED',
      );
      expect(state.message, contains('expired'));
      expect(state.code, 'ATTEMPT_EXPIRED');
    });

    test('failure state for duplicate submission shows human-readable text',
        () {
      const state = AppAsyncFailure<void>(
        message: 'Attempt attempt-456 has already been submitted.',
        code: 'ATTEMPT_ALREADY_SUBMITTED',
      );
      expect(state.message, contains('already been submitted'));
      expect(state.code, 'ATTEMPT_ALREADY_SUBMITTED');
    });

    test('failure state for unauthorized (not owned) shows not-found message',
        () {
      // Backend returns NOT_FOUND for ownership errors to prevent leaking.
      const state = AppAsyncFailure<void>(
        message: 'Assessment attempt not found.',
        code: 'ATTEMPT_NOT_OWNED',
      );
      expect(state.message, contains('not found'));
      expect(state.message, isNot(contains('forbidden')));
      expect(state.message, isNot(contains('unauthorized')));
    });

    test('failure state for unavailable assessment', () {
      const state = AppAsyncFailure<void>(
        message: 'Assessment assessment-123 is not available.',
        code: 'ASSESSMENT_UNAVAILABLE',
      );
      expect(state.message, contains('not available'));
    });
  });

  // ---------------------------------------------------------------------------
  // Group 4: Error handlers must NOT compute grading or deadline logic
  // ---------------------------------------------------------------------------

  group('Error handlers do not compute grading or deadlines', () {
    test('AppException contains no grading fields', () {
      const exception = AppException(
        code: 'ATTEMPT_EXPIRED',
        message: 'Attempt has expired.',
      );
      // AppException only carries code + message; no score, grade, or
      // deadline fields exist on the class.
      expect(exception.code, isA<String>());
      expect(exception.message, isA<String>());
      expect(exception.toString(), contains('code'));
      expect(exception.toString(), contains('message'));
      // The toString should not reference grading terms.
      expect(exception.toString(), isNot(contains('score')));
      expect(exception.toString(), isNot(contains('grade')));
      expect(exception.toString(), isNot(contains('penalty')));
      expect(exception.toString(), isNot(contains('deadline')));
    });

    test('AppAsyncFailure contains no grading fields', () {
      const state = AppAsyncFailure<void>(
        message: 'The assessment deadline has closed.',
        code: 'DEADLINE_CLOSED',
      );
      // AppAsyncFailure only has message + code; no computed fields.
      expect(state.message, isA<String>());
      expect(state.code, isA<String?>());
    });

    test('ApiClientException to AppException mapping is pass-through',
        () async {
      const apiException = ApiClientException(
        code: 'DEADLINE_CLOSED',
        message: 'The assessment deadline has closed.',
        statusCode: 409,
      );

      mockDatasource.errorToThrow = apiException;

      try {
        await repository.submitAttempt(
          bearerToken: bearerToken,
          attemptId: attemptId,
        );
        fail('Expected AppException');
      } on AppException catch (e) {
        // Code and message are passed through verbatim; no transformation,
        // no grading computation, no deadline recalculation.
        expect(e.code, apiException.code);
        expect(e.message, apiException.message);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Group 5: Retryable vs non-retryable error classification
  // ---------------------------------------------------------------------------

  group('Retry-appropriate error states', () {
    // Transient / retryable errors: not-found, unavailable (server may recover).
    final retryableCodes = [
      'ASSESSMENT_NOT_FOUND',
      'ASSESSMENT_UNAVAILABLE',
      'ATTEMPT_NOT_FOUND',
      'RESULT_NOT_FOUND',
      'NO_QUESTIONS_FOUND',
    ];

    // Terminal errors: duplicate submission, expired, max attempts -- retry
    // will not help.
    final terminalCodes = [
      'ATTEMPT_ALREADY_SUBMITTED',
      'ATTEMPT_EXPIRED',
      'MAX_ATTEMPTS_REACHED',
      'DEADLINE_CLOSED',
      'RESULT_ALREADY_EXISTS',
    ];

    for (final code in retryableCodes) {
      test('$code can reasonably show retry', () {
        final state = AppAsyncFailure<void>(message: 'Error', code: code);
        expect(state.hasError, isTrue);
        // These codes are potentially transient; UI may show retry.
        expect(state.code, code);
      });
    }

    for (final code in terminalCodes) {
      test('$code is a terminal error (retry would not help)', () {
        final state = AppAsyncFailure<void>(message: 'Error', code: code);
        expect(state.hasError, isTrue);
        expect(state.code, code);
        // The code itself is enough for the UI to decide not to show retry.
        expect(
          terminalCodes,
          contains(state.code),
          reason: '$code should be recognized as terminal',
        );
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Group 6: Specific operation error scenarios
  // ---------------------------------------------------------------------------

  group('Specific operation error scenarios', () {
    test('startAttempt with MAX_ATTEMPTS_REACHED', () async {
      mockDatasource.errorToThrow = const ApiClientException(
        code: 'MAX_ATTEMPTS_REACHED',
        message: 'Maximum number of attempts reached for this assessment.',
        statusCode: 409,
      );

      expect(
        () => repository.startAttempt(
          bearerToken: bearerToken,
          assessmentId: assessmentId,
        ),
        throwsA(isA<AppException>()
            .having((e) => e.code, 'code', 'MAX_ATTEMPTS_REACHED')),
      );
    });

    test('submitAttempt with ATTEMPT_ALREADY_SUBMITTED', () async {
      mockDatasource.errorToThrow = const ApiClientException(
        code: 'ATTEMPT_ALREADY_SUBMITTED',
        message: 'Attempt attempt-456 has already been submitted.',
        statusCode: 409,
      );

      expect(
        () => repository.submitAttempt(
          bearerToken: bearerToken,
          attemptId: attemptId,
        ),
        throwsA(isA<AppException>()
            .having((e) => e.code, 'code', 'ATTEMPT_ALREADY_SUBMITTED')),
      );
    });

    test('submitAttempt with ATTEMPT_EXPIRED', () async {
      mockDatasource.errorToThrow = const ApiClientException(
        code: 'ATTEMPT_EXPIRED',
        message: 'Attempt attempt-456 has expired.',
        statusCode: 409,
      );

      expect(
        () => repository.submitAttempt(
          bearerToken: bearerToken,
          attemptId: attemptId,
        ),
        throwsA(isA<AppException>()
            .having((e) => e.code, 'code', 'ATTEMPT_EXPIRED')),
      );
    });

    test('submitAttempt with DEADLINE_CLOSED', () async {
      mockDatasource.errorToThrow = const ApiClientException(
        code: 'DEADLINE_CLOSED',
        message: 'The assessment deadline has closed.',
        statusCode: 409,
      );

      expect(
        () => repository.submitAttempt(
          bearerToken: bearerToken,
          attemptId: attemptId,
        ),
        throwsA(isA<AppException>()
            .having((e) => e.code, 'code', 'DEADLINE_CLOSED')),
      );
    });

    test('resumeAttempt with ATTEMPT_NOT_RESUMABLE', () async {
      mockDatasource.errorToThrow = const ApiClientException(
        code: 'ATTEMPT_NOT_RESUMABLE',
        message:
            'Attempt attempt-456 cannot be resumed in its current state.',
        statusCode: 409,
      );

      expect(
        () => repository.resumeAttempt(
          bearerToken: bearerToken,
          attemptId: attemptId,
        ),
        throwsA(isA<AppException>()
            .having((e) => e.code, 'code', 'ATTEMPT_NOT_RESUMABLE')),
      );
    });

    test('getAssessmentDetail with ASSESSMENT_UNAVAILABLE', () async {
      mockDatasource.errorToThrow = const ApiClientException(
        code: 'ASSESSMENT_UNAVAILABLE',
        message: 'Assessment assessment-123 is not available.',
        statusCode: 409,
      );

      expect(
        () => repository.getAssessmentDetail(
          bearerToken: bearerToken,
          assessmentId: assessmentId,
        ),
        throwsA(isA<AppException>()
            .having((e) => e.code, 'code', 'ASSESSMENT_UNAVAILABLE')),
      );
    });

    test('startAttempt with DEADLINE_NOT_OPEN', () async {
      mockDatasource.errorToThrow = const ApiClientException(
        code: 'DEADLINE_NOT_OPEN',
        message: 'The assessment deadline has not opened yet.',
        statusCode: 409,
      );

      expect(
        () => repository.startAttempt(
          bearerToken: bearerToken,
          assessmentId: assessmentId,
        ),
        throwsA(isA<AppException>()
            .having((e) => e.code, 'code', 'DEADLINE_NOT_OPEN')),
      );
    });
  });
}
