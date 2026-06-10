import 'package:flutter/material.dart';

import '../../../../core/routing/routing.dart';

class SplashPlaceholderPage extends StatelessWidget {
  const SplashPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AIM Splash')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Splash placeholder'),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () => Navigator.of(context).pushNamed(AppRoutePaths.signIn),
              child: const Text('Go to sign in'),
            ),
            TextButton(
              onPressed: () =>
                  Navigator.of(context).pushNamed(AppRoutePaths.mainShell),
              child: const Text('Open main shell'),
            ),
          ],
        ),
      ),
    );
  }
}
