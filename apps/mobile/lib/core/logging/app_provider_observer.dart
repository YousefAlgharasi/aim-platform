import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_logger.dart';

/// Riverpod provider observer that automatically intercepts and logs all
/// errors, exceptions, and state failures across the application's Riverpod tree.
class AppProviderObserver extends ProviderObserver {
  const AppProviderObserver();

  @override
  void providerDidFail(
    ProviderBase<Object?> provider,
    Object error,
    StackTrace stackTrace,
    ProviderContainer container,
  ) {
    AppLogger.e(
      'Riverpod:${provider.name ?? provider.runtimeType}',
      'Provider failed with error',
      error,
      stackTrace,
    );
  }

  @override
  void didUpdateProvider(
    ProviderBase<Object?> provider,
    Object? previousValue,
    Object? newValue,
    ProviderContainer container,
  ) {
    if (newValue is AsyncError) {
      AppLogger.e(
        'Riverpod:${provider.name ?? provider.runtimeType}',
        'AsyncState transitioned to error',
        newValue.error,
        newValue.stackTrace,
      );
    }
  }
}
