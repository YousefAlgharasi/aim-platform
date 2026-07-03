import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

enum VoiceErrorType {
  networkError,
  microphoneError,
  serverError,
  unknownError,
}

class VoiceErrorState extends StatelessWidget {
  final VoiceErrorType errorType;
  final String? fallbackText;
  final VoidCallback? onRetry;
  final VoidCallback? onDismiss;

  const VoiceErrorState({
    super.key,
    required this.errorType,
    this.fallbackText,
    this.onRetry,
    this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);

    return Container(
      margin: const EdgeInsets.all(AimSpacing.space16),
      padding: const EdgeInsets.all(AimSpacing.space16),
      decoration: BoxDecoration(
        color: theme.colorScheme.errorContainer.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(AimRadius.md),
        border: Border.all(
          color: theme.colorScheme.error.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Icon(
                _iconForType(errorType),
                size: 20,
                color: theme.colorScheme.error,
              ),
              const SizedBox(width: AimSpacing.space8),
              Expanded(
                child: Text(
                  _titleForType(errorType, l10n),
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: theme.colorScheme.error,
                  ),
                ),
              ),
              if (onDismiss != null)
                IconButton(
                  icon: const Icon(Icons.close, size: 18),
                  onPressed: onDismiss,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(
                    minWidth: 28,
                    minHeight: 28,
                  ),
                ),
            ],
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            _messageForType(errorType, l10n),
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onErrorContainer,
            ),
          ),
          if (fallbackText != null && fallbackText!.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.space8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AimSpacing.space8),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(AimRadius.sm),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.voiceTeacherTeacherResponseTextLabel,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    fallbackText!,
                    style: theme.textTheme.bodyMedium,
                    textDirection: _containsArabic(fallbackText!)
                        ? TextDirection.rtl
                        : TextDirection.ltr,
                  ),
                ],
              ),
            ),
          ],
          if (onRetry != null) ...[
            const SizedBox(height: AimSpacing.space8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh, size: 18),
                label: Text(l10n.commonRetry),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AimColors.primary500,
                  side: BorderSide(color: AimColors.primary500.withValues(alpha: 0.3)),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  IconData _iconForType(VoiceErrorType type) {
    switch (type) {
      case VoiceErrorType.networkError:
        return Icons.wifi_off;
      case VoiceErrorType.microphoneError:
        return Icons.mic_off;
      case VoiceErrorType.serverError:
        return Icons.cloud_off;
      case VoiceErrorType.unknownError:
        return Icons.error_outline;
    }
  }

  String _titleForType(VoiceErrorType type, AppLocalizations l10n) {
    switch (type) {
      case VoiceErrorType.networkError:
        return l10n.voiceTeacherErrorTitleNetwork;
      case VoiceErrorType.microphoneError:
        return l10n.voiceTeacherErrorTitleMicrophone;
      case VoiceErrorType.serverError:
        return l10n.voiceTeacherErrorTitleServer;
      case VoiceErrorType.unknownError:
        return l10n.voiceTeacherErrorTitleUnknown;
    }
  }

  String _messageForType(VoiceErrorType type, AppLocalizations l10n) {
    switch (type) {
      case VoiceErrorType.networkError:
        return l10n.voiceTeacherErrorMessageNetwork;
      case VoiceErrorType.microphoneError:
        return l10n.voiceTeacherErrorMessageMicrophone;
      case VoiceErrorType.serverError:
        return l10n.voiceTeacherErrorMessageServer;
      case VoiceErrorType.unknownError:
        return l10n.voiceTeacherErrorMessageUnknown;
    }
  }

  bool _containsArabic(String text) {
    return RegExp(r'[؀-ۿ]').hasMatch(text);
  }
}
