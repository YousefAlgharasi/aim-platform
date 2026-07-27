import 'package:aim_mobile/app/aim_mobile_app.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/logging/app_logger.dart';
import 'core/logging/app_provider_observer.dart';

void main() {
  final widgetsBinding = WidgetsFlutterBinding.ensureInitialized();

  // Attach global uncaught Flutter framework error handler
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    AppLogger.e('FlutterError', details.exceptionAsString(), details.exception, details.stack);
  };

  // Attach global asynchronous platform error handler
  PlatformDispatcher.instance.onError = (error, stack) {
    AppLogger.e('PlatformDispatcher', 'Unhandled asynchronous exception', error, stack);
    return true;
  };

  // Keeps the native splash on screen until SplashPage removes it
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  runApp(
    const ProviderScope(
      observers: [AppProviderObserver()],
      child: AimMobileApp(),
    ),
  );
}
