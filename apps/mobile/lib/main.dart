import 'package:aim_mobile/app/aim_mobile_app.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';


void main() {
  runApp(
    const ProviderScope(
      child: AimMobileApp(),
      // child: AimMobileApp(),
    ),
  );
}
