import 'package:flutter/material.dart';

import '../core/theme/theme.dart';

class AimMobileApp extends StatelessWidget {
  const AimMobileApp({super.key});

  static const String appTitle = 'AIM Mobile';

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: appTitle,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const AimShellHomePage(),
    );
  }
}

class AimShellHomePage extends StatelessWidget {
  const AimShellHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(AimMobileApp.appTitle),
      ),
      body: const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'AIM Flutter Mobile shell is ready.',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
