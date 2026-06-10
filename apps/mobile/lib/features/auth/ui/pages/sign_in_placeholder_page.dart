import 'package:flutter/material.dart';

import '../../../../core/routing/routing.dart';

class SignInPlaceholderPage extends StatelessWidget {
  const SignInPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AIM Sign In')),
      body: Center(
        child: FilledButton(
          onPressed: () => Navigator.of(context).pushNamed(AppRoutePaths.mainShell),
          child: const Text('Continue to main shell'),
        ),
      ),
    );
  }
}
