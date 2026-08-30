import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';
import 'package:aim_mobile/core/design_tokens/aim_sizes.dart';
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
    final l10n = Localizations.of<AppLocalizations>(context, AppLocalizations);

    final isRtl = Directionality.of(context) == TextDirection.rtl;

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
                color: theme.colorScheme.error,
                size: AimSizes.iconMd,
              ),
              const SizedBox(width: AimSpacing.space8),
              Expanded(
                child: Text(
                  _titleForType(errorType, isRtl, l10n),
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: theme.colorScheme.error,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              if (onDismiss != null)
                IconButton(
                  icon: const Icon(Icons.close, size: 18),
                  onPressed: onDismiss,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  color: theme.colorScheme.onSurfaceVariant,
                ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            _messageForType(errorType, isRtl, l10n),
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          if (fallbackText != null && fallbackText!.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.space12),
            Container(
              padding: const EdgeInsets.all(AimSpacing.space12),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(AimRadius.sm),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n?.voiceTeacherTextResponseTitle ?? 'Teacher response (text):',
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
                label: Text(l10n?.voiceTeacherTryAgain ?? (isRtl ? 'حاول مجدداً' : 'Try Again')),
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

  String _titleForType(VoiceErrorType type, bool isRtl, AppLocalizations? l10n) {
    if (l10n != null) {
      switch (type) {
        case VoiceErrorType.networkError:
          return l10n.voiceTeacherConnectionErrorTitle;
        case VoiceErrorType.microphoneError:
          return l10n.voiceTeacherMicrophoneErrorTitle;
        case VoiceErrorType.serverError:
          return l10n.voiceTeacherServerErrorTitle;
        case VoiceErrorType.unknownError:
          return l10n.voiceTeacherGenericErrorTitle;
      }
    }
    if (isRtl) {
      switch (type) {
        case VoiceErrorType.networkError:
          return 'خطأ في الاتصال';
        case VoiceErrorType.microphoneError:
          return 'خطأ في الميكروفون';
        case VoiceErrorType.serverError:
          return 'خطأ في الخادم';
        case VoiceErrorType.unknownError:
          return 'حدث خطأ ما';
      }
    }
    switch (type) {
      case VoiceErrorType.networkError:
        return 'Connection Error';
      case VoiceErrorType.microphoneError:
        return 'Microphone Error';
      case VoiceErrorType.serverError:
        return 'Server Error';
      case VoiceErrorType.unknownError:
        return 'Something Went Wrong';
    }
  }

  String _messageForType(VoiceErrorType type, bool isRtl, AppLocalizations? l10n) {
    if (l10n != null) {
      switch (type) {
        case VoiceErrorType.networkError:
          return l10n.voiceTeacherConnectionErrorMsg;
        case VoiceErrorType.microphoneError:
          return l10n.voiceTeacherMicrophoneErrorMsg;
        case VoiceErrorType.serverError:
          return l10n.voiceTeacherServerErrorMsg;
        case VoiceErrorType.unknownError:
          return l10n.voiceTeacherGenericErrorMsg;
      }
    }
    if (isRtl) {
      switch (type) {
        case VoiceErrorType.networkError:
          return 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى';
        case VoiceErrorType.microphoneError:
          return 'يرجى منح إذن استخدام الميكروفون للمتابعة';
        case VoiceErrorType.serverError:
          return 'حدث خطأ في خدمة الصوت. يرجى المحاولة مرة أخرى';
        case VoiceErrorType.unknownError:
          return 'حدث خطأ غير متوقع أثناء الجلسة الصوتية';
      }
    }
    switch (type) {
      case VoiceErrorType.networkError:
        return 'Check your internet connection and try again';
      case VoiceErrorType.microphoneError:
        return 'Please grant microphone permission to continue';
      case VoiceErrorType.serverError:
        return 'Voice service encountered an error. Please try again';
      case VoiceErrorType.unknownError:
        return 'An unexpected error occurred during the voice session';
    }
  }

  bool _containsArabic(String text) {
    return RegExp(r'[؀-ۿ]').hasMatch(text);
  }
}
