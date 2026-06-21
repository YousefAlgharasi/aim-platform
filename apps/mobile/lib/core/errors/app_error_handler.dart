// P6-024: AppErrorHandler — maps ApiClientException and generic exceptions
// to user-facing AppAsyncFailure states with standardised messages.
//
// Rules:
// - Never expose raw backend error details to the UI.
// - Never expose AIM Engine internals or AI provider errors to the UI.
// - Map 401 → sign-out signal; 403 → permission message; 404 → not found;
//   5xx → server error; network → connectivity message.
// - All callers use mapToFailure() so error messages are consistent.

import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';

class AppErrorHandler {
  const AppErrorHandler._();

  /// Maps any exception to a typed [AppAsyncFailure].
  ///
  /// Usage in a notifier:
  /// ```dart
  /// } catch (e) {
  ///   state = AppErrorHandler.mapToFailure(e);
  /// }
  /// ```
  static AppAsyncFailure<T> mapToFailure<T>(Object error) {
    if (error is ApiClientException) {
      return AppAsyncFailure<T>(
        code: error.code,
        message: _messageForApiError(error),
      );
    }
    return const AppAsyncFailure(
      code: 'UNEXPECTED_ERROR',
      message: 'Something went wrong. Please try again.',
    );
  }

  /// Returns true if the error is an authentication failure (401).
  /// Callers should sign the user out when this is true.
  static bool isAuthError(Object error) {
    if (error is ApiClientException) {
      return error.statusCode == 401;
    }
    return false;
  }

  /// Returns true if the error is a permission failure (403).
  static bool isPermissionError(Object error) {
    if (error is ApiClientException) {
      return error.statusCode == 403;
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  static String _messageForApiError(ApiClientException e) {
    final status = e.statusCode;

    if (status == 401) {
      return 'Your session has expired. Please sign in again.';
    }
    if (status == 403) {
      return 'You do not have permission to perform this action.';
    }
    if (status == 404) {
      return 'The requested content could not be found.';
    }
    if (status != null && status >= 500) {
      return 'The server encountered an error. Please try again later.';
    }
    if (e.code == 'NETWORK_ERROR' || e.code == 'CONNECTION_ERROR') {
      return 'No internet connection. Please check your network and try again.';
    }
    // Use backend message for known domain errors (validation, business rules)
    if (e.message.isNotEmpty) {
      return e.message;
    }
    return 'Something went wrong. Please try again.';
  }
}
