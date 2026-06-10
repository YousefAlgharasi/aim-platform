import 'package:flutter/material.dart';

class AuthPlaceholderBanner extends StatelessWidget {
  const AuthPlaceholderBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Text(
          'Placeholder auth only. Supabase authentication is not implemented yet.',
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
