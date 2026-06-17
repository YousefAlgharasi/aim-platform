import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';

/// Placeholder banner shown on auth screens that are not yet fully implemented.
class AuthPlaceholderBanner extends StatelessWidget {
  const AuthPlaceholderBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return AIMAlertBanner(
      tone: AIMAlertTone.info,
      child: const Text(
        'Placeholder auth only. Supabase authentication is not implemented yet.',
      ),
    );
  }
}
