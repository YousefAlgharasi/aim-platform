import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/state.dart';

final class TestStateNotifier extends AppStateNotifier<String> {}

void main() {
  test('AppStateNotifier follows idle loading success failure reset flow', () {
    final notifier = TestStateNotifier();

    expect(notifier.state, isA<AppAsyncIdle<String>>());

    notifier.setLoading();
    expect(notifier.state, isA<AppAsyncLoading<String>>());

    notifier.setSuccess('ready');
    final success = notifier.state;
    expect(success, isA<AppAsyncSuccess<String>>());
    expect((success as AppAsyncSuccess<String>).data, 'ready');

    notifier.setFailure(message: 'Failed', code: 'TEST_ERROR');
    final failure = notifier.state;
    expect(failure, isA<AppAsyncFailure<String>>());
    expect((failure as AppAsyncFailure<String>).message, 'Failed');
    expect(failure.code, 'TEST_ERROR');

    notifier.reset();
    expect(notifier.state, isA<AppAsyncIdle<String>>());
  });

  test('AppFormState supports submit, validation, and error updates', () {
    const state = AppFormState();

    final updated = state.copyWith(
      isSubmitting: true,
      isValid: true,
      errorMessage: 'Invalid',
    );

    expect(updated.isSubmitting, isTrue);
    expect(updated.isValid, isTrue);
    expect(updated.errorMessage, 'Invalid');

    final cleared = updated.copyWith(clearError: true);

    expect(cleared.errorMessage, isNull);
  });

  test('RetryState tracks retry and clears error safely', () {
    const state = RetryState();

    final updated = state.copyWith(
      retryCount: 1,
      lastErrorMessage: 'Network error',
      lastErrorCode: 'NETWORK',
    );

    expect(updated.retryCount, 1);
    expect(updated.lastErrorMessage, 'Network error');
    expect(updated.lastErrorCode, 'NETWORK');

    final cleared = updated.copyWith(clearError: true);

    expect(cleared.retryCount, 1);
    expect(cleared.lastErrorMessage, isNull);
    expect(cleared.lastErrorCode, isNull);
  });
}
