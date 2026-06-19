// Phase 8 — P8-089
// AiChatErrorState — safe AI Teacher chat error UI.
//
// This widget intentionally does not render raw backend/provider error
// messages. The backend remains the only layer that knows provider details;
// Flutter shows a safe retryable chat message using AIM design-system state
// components.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

class AiChatErrorState extends StatelessWidget {
  const AiChatErrorState({
    super.key,
    this.onRetry,
  });

  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return AIMFullScreenError(
      message:
          'AI Teacher is temporarily unavailable. Your progress is safe, and you can try again.',
      retryLabel: 'Retry chat',
      semanticLabel: 'AI Teacher chat error',
      onRetry: onRetry,
    );
  }
}
