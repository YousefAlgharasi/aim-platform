import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';

/// Centralized application logger for structured error, warning, and debug logging.
/// Logs are formatted and output via [developer.log] and [debugPrint] so they
/// appear in `flutter run`, Android `adb logcat`, iOS Console, and DevTools.
final class AppLogger {
  const AppLogger._();

  /// Log an error with an optional exception and stack trace.
  static void e(
    String tag,
    String message, [
    Object? error,
    StackTrace? stackTrace,
  ]) {
    final formattedMessage = '❌ [$tag] $message${error != null ? '\nError: $error' : ''}';
    developer.log(
      formattedMessage,
      name: tag,
      error: error,
      stackTrace: stackTrace,
      level: 1000, // SEVERE
    );
    if (kDebugMode) {
      debugPrint('❌ [$tag] $message');
      if (error != null) debugPrint('   Error: $error');
      if (stackTrace != null) debugPrint('   StackTrace:\n$stackTrace');
    }
  }

  /// Log a warning message.
  static void w(
    String tag,
    String message, [
    Object? error,
    StackTrace? stackTrace,
  ]) {
    final formattedMessage = '⚠️ [$tag] $message${error != null ? '\nWarning: $error' : ''}';
    developer.log(
      formattedMessage,
      name: tag,
      error: error,
      stackTrace: stackTrace,
      level: 900, // WARNING
    );
    if (kDebugMode) {
      debugPrint('⚠️ [$tag] $message');
      if (error != null) debugPrint('   Warning: $error');
    }
  }

  /// Log an informational message.
  static void i(String tag, String message) {
    developer.log(
      'ℹ️ [$tag] $message',
      name: tag,
      level: 800, // INFO
    );
    if (kDebugMode) {
      debugPrint('ℹ️ [$tag] $message');
    }
  }
}
