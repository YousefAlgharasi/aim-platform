// Phase 8 — P8-089
// AiChatErrorState — safe AI Teacher chat error UI.
//
// This widget intentionally does not render raw backend/provider error
// messages. The backend remains the only layer that knows provider details;
// Flutter shows a safe retryable chat message using AIM design-system state
// components.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class AiChatErrorState extends StatelessWidget {
  const AiChatErrorState({
    super.key,
    this.onRetry,
  });

  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AIMFullScreenError(
      message: l10n.aiTeacherChatErrorMessage,
      retryLabel: l10n.aiTeacherRetryChatLabel,
      semanticLabel: l10n.aiTeacherChatErrorSemantic,
      onRetry: onRetry,
    );
  }
}
