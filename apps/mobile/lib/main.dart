import 'package:aim_mobile/app/aim_mobile_app.dart';
import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  final widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  // Keeps the native splash (Android launch_background / iOS
  // LaunchScreen.storyboard) on screen — instead of tearing down to a blank
  // window — until SplashPage explicitly calls FlutterNativeSplash.remove()
  // once its own first frame (built to match the native splash exactly) has
  // painted. This is what makes the handoff seamless with no white flash.
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  runApp(
    const ProviderScope(
      child: AimMobileApp(),
    ),
  );
}
